<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use App\Models\InsuranceClaim;
use App\Models\Payment;
use App\Models\Professional;
use App\Models\ProfessionalPayout;
use App\Models\Subscription;
use App\Models\SubscriptionPayment;
use App\Models\Plan;
use App\Services\MpesaService;
use App\Services\PesapalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    const COMMISSION_RATE = 0.20;

    public function initiate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'consultation_id' => 'required|string|exists:consultations,consultation_id',
            'phone'           => 'required|string|min:9',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $user = auth('api')->user();
        $consultation = Consultation::where('consultation_id', $request->consultation_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$consultation) {
            return response()->json(['error' => 'Consultation not found'], 404);
        }

        if ($consultation->status !== 'pending') {
            return response()->json(['error' => 'Consultation already paid or cancelled'], 422);
        }

        // Check if payment already exists
        if ($consultation->payment) {
            return response()->json(['error' => 'Payment already initiated for this consultation'], 422);
        }

        try {
            $mpesa = new MpesaService();
            $result = $mpesa->stkPush(
                $request->phone,
                $consultation->amount,
                $consultation->consultation_id,
                'UberHealth Consultation'
            );

            $payment = Payment::create([
                'consultation_id'   => $consultation->id,
                'amount'            => $consultation->amount,
                'phone'             => $request->phone,
                'mpesa_checkout_id' => $result['CheckoutRequestID'] ?? null,
                'status'            => 'pending',
            ]);

            return response()->json([
                'message'          => 'STK Push sent. Enter your M-Pesa PIN.',
                'payment'          => $payment,
                'checkout_request' => $result['CheckoutRequestID'] ?? null,
            ]);
        } catch (\Exception $e) {
            Log::error('Payment initiation failed', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Payment initiation failed: ' . $e->getMessage()], 500);
        }
    }

    public function callback(Request $request)
    {
        Log::info('M-Pesa STK Callback', $request->all());

        $body = $request->input('Body.stkCallback', []);
        $resultCode = $body['ResultCode'] ?? -1;
        $checkoutId = $body['CheckoutRequestID'] ?? null;

        if (!$checkoutId) {
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        $payment = Payment::where('mpesa_checkout_id', $checkoutId)->first();

        if (!$payment) {
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        if ($resultCode == 0) {
            // Success
            $items = collect($body['CallbackMetadata']['Item'] ?? []);
            $txId = $items->firstWhere('Name', 'MpesaReceiptNumber')['Value'] ?? null;

            $payment->update([
                'status'                => 'completed',
                'mpesa_transaction_id'  => $txId,
                'mpesa_result_code'     => (string) $resultCode,
                'mpesa_result_desc'     => $body['ResultDesc'] ?? 'Success',
                'completed_at'          => now(),
            ]);

            // Confirm consultation
            $consultation = $payment->consultation;
            $consultation->update(['status' => 'confirmed']);

            // Create professional payout (80% of amount)
            $payoutAmount = $consultation->amount * (1 - self::COMMISSION_RATE);
            ProfessionalPayout::create([
                'professional_id' => $consultation->professional_id,
                'consultation_id' => $consultation->id,
                'amount'          => $payoutAmount,
                'status'          => 'pending',
            ]);

            // Increment professional total_sessions
            $consultation->professional->increment('total_sessions');
        } else {
            $payment->update([
                'status'            => 'failed',
                'mpesa_result_code' => (string) $resultCode,
                'mpesa_result_desc' => $body['ResultDesc'] ?? 'Failed',
            ]);
        }

        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
    }

    public function subscriptionInitiate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'plan_id' => 'required|exists:plans,id',
            'phone'   => 'required|string|min:9',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $user = auth('api')->user();
        $plan = Plan::find($request->plan_id);

        if (!$plan || !$plan->is_active) {
            return response()->json(['error' => 'Plan not available'], 422);
        }

        // Create subscription record (pending activation)
        $subscription = Subscription::create([
            'user_id'    => $user->id,
            'plan_id'    => $plan->id,
            'status'     => 'active', // will activate on successful payment
            'started_at' => now(),
            'expires_at' => $plan->interval === 'annual'
                ? now()->addYear()
                : now()->addMonth(),
            'amount_paid'=> $plan->price_kes,
        ]);

        try {
            $mpesa = new MpesaService();
            $result = $mpesa->stkPush(
                $request->phone,
                $plan->price_kes,
                'SUB-' . $subscription->id,
                'UberHealth ' . $plan->name . ' Subscription'
            );

            $subPayment = SubscriptionPayment::create([
                'subscription_id'   => $subscription->id,
                'amount'            => $plan->price_kes,
                'phone'             => $request->phone,
                'mpesa_checkout_id' => $result['CheckoutRequestID'] ?? null,
                'status'            => 'pending',
            ]);

            return response()->json([
                'message'      => 'STK Push sent.',
                'subscription' => $subscription,
                'payment'      => $subPayment,
            ]);
        } catch (\Exception $e) {
            $subscription->delete();
            return response()->json(['error' => 'Payment initiation failed'], 500);
        }
    }

    public function subscriptionCallback(Request $request)
    {
        Log::info('M-Pesa Subscription Callback', $request->all());

        $body = $request->input('Body.stkCallback', []);
        $resultCode = $body['ResultCode'] ?? -1;
        $checkoutId = $body['CheckoutRequestID'] ?? null;

        if (!$checkoutId) {
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        $subPayment = SubscriptionPayment::where('mpesa_checkout_id', $checkoutId)->first();

        if (!$subPayment) {
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        if ($resultCode == 0) {
            $items = collect($body['CallbackMetadata']['Item'] ?? []);
            $txId = $items->firstWhere('Name', 'MpesaReceiptNumber')['Value'] ?? null;

            $subPayment->update([
                'status'              => 'completed',
                'mpesa_transaction_id'=> $txId,
            ]);

            $subPayment->subscription->update([
                'status'              => 'active',
                'mpesa_transaction_id'=> $txId,
            ]);
        } else {
            $subPayment->update(['status' => 'failed']);
            $subPayment->subscription->update(['status' => 'cancelled']);
        }

        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
    }

    public function b2cResult(Request $request)
    {
        Log::info('M-Pesa B2C Result', $request->all());

        $result = $request->input('Result', []);
        $resultCode = $result['ResultCode'] ?? -1;
        $conversationId = $result['ConversationID'] ?? null;

        if ($resultCode == 0) {
            Log::info('B2C payout successful', ['conversation_id' => $conversationId]);
        } else {
            Log::warning('B2C payout failed', [
                'result_code' => $resultCode,
                'result_desc' => $result['ResultDesc'] ?? 'Unknown error',
            ]);
        }

        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
    }

    public function b2cTimeout(Request $request)
    {
        Log::warning('M-Pesa B2C Timeout', $request->all());
        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
    }

    public function insuranceClaim(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'consultation_id' => 'required|string|exists:consultations,consultation_id',
            'provider'        => 'required|string|max:100',
            'member_number'   => 'required|string|max:100',
            'id_number'       => 'required|string|max:50',
            'scheme_name'     => 'nullable|string|max:100',
            'claim_reference' => 'required|string|max:50',
            'amount'          => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $user = auth('api')->user();
        $consultation = Consultation::where('consultation_id', $request->consultation_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$consultation) {
            return response()->json(['error' => 'Consultation not found'], 404);
        }

        if (!in_array($consultation->status, ['pending', 'confirmed'])) {
            return response()->json(['error' => 'Consultation already cancelled or completed'], 422);
        }

        // Confirm the consultation so the patient can join
        $consultation->update(['status' => 'confirmed']);

        $claim = InsuranceClaim::create([
            'consultation_id' => $consultation->id,
            'user_id'         => $user->id,
            'claim_reference' => $request->claim_reference,
            'provider'        => $request->provider,
            'member_number'   => $request->member_number,
            'id_number'       => $request->id_number,
            'scheme_name'     => $request->scheme_name,
            'amount'          => $request->amount,
            'status'          => 'pending',
        ]);

        Log::info('Insurance claim created', [
            'claim_reference'   => $claim->claim_reference,
            'consultation_id'   => $consultation->consultation_id,
            'provider'          => $claim->provider,
            'user_id'           => $user->id,
        ]);

        return response()->json([
            'message'         => 'Insurance claim submitted. Session is confirmed.',
            'claim_reference' => $claim->claim_reference,
            'consultation_id' => $consultation->consultation_id,
            'amount'          => $claim->amount,
            'status'          => $claim->status,
        ]);
    }

    // Patient views their own insurance claims
    // ─── Paystack ──────────────────────────────────────────────────────────────

    public function paystackInitialize(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'consultation_id' => 'required|string|exists:consultations,consultation_id',
        ]);
        if ($validator->fails()) return response()->json(['error' => $validator->errors()->first()], 422);

        $user = auth('api')->user();
        $consultation = Consultation::where('consultation_id', $request->consultation_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$consultation) return response()->json(['error' => 'Consultation not found'], 404);
        if ($consultation->status !== 'pending') return response()->json(['error' => 'Consultation already paid'], 422);

        $secretKey = config('services.paystack.secret_key', env('PAYSTACK_SECRET_KEY', ''));

        if (empty($secretKey)) {
            Log::error('Paystack secret key not configured');
            return response()->json(['error' => 'Online payment is not yet configured. Please contact support or use insurance.'], 503);
        }

        $email     = $user->email ?: "user{$user->id}@afyayako.com";
        $reference = 'ps-' . $consultation->consultation_id . '-' . time();
        $amountKobo = (int) round($consultation->amount * 100); // KES in smallest unit

        $response = \Illuminate\Support\Facades\Http::withHeaders([
            'Authorization' => "Bearer {$secretKey}",
            'Content-Type'  => 'application/json',
        ])->post('https://api.paystack.co/transaction/initialize', [
            'email'     => $email,
            'amount'    => $amountKobo,
            'currency'  => 'KES',
            'reference' => $reference,
            'metadata'  => [
                'consultation_id' => $consultation->consultation_id,
                'platform'        => 'Afya Yako Siri Yako',
            ],
        ]);

        if (!$response->successful()) {
            Log::error('Paystack init failed', ['body' => $response->body()]);
            return response()->json(['error' => 'Payment initialisation failed. Please try again.'], 500);
        }

        $data = $response->json('data');

        // Store reference for verification
        Payment::create([
            'consultation_id'   => $consultation->id,
            'amount'            => $consultation->amount,
            'phone'             => null,
            'mpesa_checkout_id' => $reference, // reuse field for paystack reference
            'status'            => 'pending',
        ]);

        return response()->json([
            'access_code'      => $data['access_code'] ?? null,
            'authorization_url'=> $data['authorization_url'] ?? null,
            'reference'        => $reference,
        ]);
    }

    public function paystackVerify(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reference'       => 'required|string',
            'consultation_id' => 'required|string',
        ]);
        if ($validator->fails()) return response()->json(['error' => $validator->errors()->first()], 422);

        $secretKey = config('services.paystack.secret_key', env('PAYSTACK_SECRET_KEY', ''));
        $response  = \Illuminate\Support\Facades\Http::withHeaders([
            'Authorization' => "Bearer {$secretKey}",
        ])->get("https://api.paystack.co/transaction/verify/{$request->reference}");

        if (!$response->successful()) {
            return response()->json(['error' => 'Payment verification failed'], 500);
        }

        $data   = $response->json('data');
        $status = $data['status'] ?? 'failed';

        if ($status !== 'success') {
            return response()->json(['error' => 'Payment not successful. Status: ' . $status], 422);
        }

        $user         = auth('api')->user();
        $consultation = Consultation::where('consultation_id', $request->consultation_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$consultation) return response()->json(['error' => 'Consultation not found'], 404);

        $payment = Payment::where('consultation_id', $consultation->id)->first();
        if ($payment) {
            $payment->update(['status' => 'completed', 'completed_at' => now()]);
        }

        $consultation->update(['status' => 'confirmed']);

        ProfessionalPayout::create([
            'professional_id' => $consultation->professional_id,
            'consultation_id' => $consultation->id,
            'amount'          => $consultation->amount * (1 - self::COMMISSION_RATE),
            'status'          => 'pending',
        ]);

        $consultation->professional->increment('total_sessions');

        return response()->json(['message' => 'Payment confirmed', 'consultation_id' => $request->consultation_id]);
    }

    public function myClaims()
    {
        $user   = auth('api')->user();
        $claims = InsuranceClaim::where('user_id', $user->id)
            ->with('consultation:id,consultation_id,scheduled_at')
            ->orderByDesc('created_at')
            ->get();
        return response()->json(['claims' => $claims]);
    }

    public function pesapalInitiate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'consultation_id' => 'required|string|exists:consultations,consultation_id',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $user = auth('api')->user();
        $consultation = Consultation::where('consultation_id', $request->consultation_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$consultation) {
            return response()->json(['error' => 'Consultation not found'], 404);
        }

        if ($consultation->status !== 'pending') {
            return response()->json(['error' => 'Consultation already paid or cancelled'], 422);
        }

        if ($consultation->payment) {
            return response()->json(['error' => 'Payment already initiated for this consultation'], 422);
        }

        try {
            $pesapal = new PesapalService();
            $result = $pesapal->initiatePayment(
                $consultation->consultation_id,
                $consultation->amount,
                'UberHealth Consultation - ' . $consultation->consultation_id,
                config('services.pesapal.callback_url'),
                url('/payment/success'),
                $request->phone,
                $request->email ?? $user->email
            );

            if (!$result['success']) {
                return response()->json(['error' => $result['error'] ?? 'Payment initiation failed'], 500);
            }

            $payment = Payment::create([
                'consultation_id' => $consultation->id,
                'amount' => $consultation->amount,
                'phone' => $request->phone,
                'payment_method' => 'pesapal',
                'pesapal_order_tracking_id' => $result['order_tracking_id'],
                'status' => 'pending',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Redirecting to PesaPal',
                'payment' => $payment,
                'redirect_url' => $result['redirect_url'],
            ]);
        } catch (\Exception $e) {
            Log::error('PesaPal payment initiation failed', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Payment initiation failed: ' . $e->getMessage()], 500);
        }
    }

    public function pesapalCallback(Request $request)
    {
        Log::info('PesaPal Callback', $request->all());

        $orderTrackingId = $request->input('OrderTrackingId');

        if (!$orderTrackingId) {
            return response()->json(['error' => 'Missing order tracking ID'], 400);
        }

        try {
            $pesapal = new PesapalService();
            $status = $pesapal->getTransactionStatus($orderTrackingId);

            $payment = Payment::where('pesapal_order_tracking_id', $orderTrackingId)->first();

            if (!$payment) {
                Log::warning('PesaPal callback: payment not found', ['order_tracking_id' => $orderTrackingId]);
                return response()->json(['error' => 'Payment not found'], 404);
            }

            if ($status['payment_status_description'] === 'COMPLETED') {
                $payment->update(['status' => 'completed']);
                $consultation = $payment->consultation;
                $consultation->update(['status' => 'confirmed']);

                // Calculate and create payout for professional
                $amount = $consultation->amount;
                $commission = $amount * self::COMMISSION_RATE;
                $payout = $amount - $commission;

                ProfessionalPayout::create([
                    'professional_id' => $consultation->professional_id,
                    'payment_id' => $payment->id,
                    'amount' => $payout,
                    'status' => 'pending',
                ]);

                $consultation->professional->increment('total_sessions');
            } elseif (in_array($status['payment_status_description'], ['FAILED', 'CANCELLED'])) {
                $payment->update(['status' => 'failed']);
            }

            return response()->json(['success' => true, 'message' => 'Payment processed']);
        } catch (\Exception $e) {
            Log::error('PesaPal callback processing failed', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Callback processing failed'], 500);
        }
    }
}
