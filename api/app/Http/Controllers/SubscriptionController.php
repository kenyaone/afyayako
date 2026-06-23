<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\SubscriptionPayment;
use App\Services\MpesaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SubscriptionController extends Controller
{
    public function plans()
    {
        $plans = Plan::where('is_active', true)->get();
        return response()->json(['plans' => $plans]);
    }

    public function subscribe(Request $request)
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

        // Cancel existing active subscription
        Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->update(['status' => 'cancelled']);

        $subscription = Subscription::create([
            'user_id'    => $user->id,
            'plan_id'    => $plan->id,
            'status'     => 'active',
            'started_at' => now(),
            'expires_at' => $plan->interval === 'annual'
                ? now()->addYear()
                : now()->addMonth(),
            'amount_paid'=> $plan->price_kes,
        ]);

        // For free plans, no payment needed
        if ($plan->price_kes == 0) {
            return response()->json([
                'message'      => 'Subscribed to free plan successfully.',
                'subscription' => $subscription->load('plan'),
            ], 201);
        }

        try {
            $mpesa = new MpesaService();
            $result = $mpesa->stkPush(
                $request->phone,
                $plan->price_kes,
                'SUB-' . $subscription->id,
                'UberHealth ' . $plan->name . ' Plan'
            );

            SubscriptionPayment::create([
                'subscription_id'   => $subscription->id,
                'amount'            => $plan->price_kes,
                'phone'             => $request->phone,
                'mpesa_checkout_id' => $result['CheckoutRequestID'] ?? null,
                'status'            => 'pending',
            ]);

            return response()->json([
                'message'      => 'STK Push sent. Complete payment to activate subscription.',
                'subscription' => $subscription->load('plan'),
            ], 201);
        } catch (\Exception $e) {
            $subscription->delete();
            return response()->json(['error' => 'Payment initiation failed'], 500);
        }
    }

    public function current()
    {
        $user = auth('api')->user();
        $subscription = Subscription::with('plan')
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (!$subscription) {
            return response()->json(['subscription' => null, 'message' => 'No active subscription']);
        }

        return response()->json(['subscription' => $subscription]);
    }
}
