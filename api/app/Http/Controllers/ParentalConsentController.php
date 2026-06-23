<?php

namespace App\Http\Controllers;

use App\Models\ParentalConsent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ParentalConsentController extends Controller
{
    public function request(Request $request)
    {
        $request->validate([
            'guardian_name' => 'required|string|min:3',
            'guardian_phone' => 'required|regex:/^254\d{9}$/',
            'relationship' => 'required|string|in:parent,guardian,caregiver',
        ]);

        $user = Auth::user();

        if (!$user->date_of_birth || \Carbon\Carbon::parse($user->date_of_birth)->age >= 18) {
            return response()->json(['error' => 'Parental consent not required for this user'], 422);
        }

        if ($user->parentalConsent()->exists()) {
            return response()->json(['error' => 'Parental consent already provided'], 422);
        }

        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        \Cache::put("parental_consent_otp_{$user->id}", $otp, \Carbon\Carbon::now()->addMinutes(10));

        $mpesaService = app(\App\Services\MpesaService::class);
        try {
            $mpesaService->sendSMS(
                $request->guardian_phone,
                "Your Afya Yako Siri Yako parental consent verification code is: {$otp}. This code expires in 10 minutes."
            );
        } catch (\Exception $e) {
            \Log::warning("Failed to send parental consent OTP SMS: " . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'OTP sent to guardian phone',
            'phone_last4' => substr($request->guardian_phone, -4),
        ]);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'guardian_name' => 'required|string|min:3',
            'guardian_phone' => 'required|regex:/^254\d{9}$/',
            'guardian_email' => 'nullable|email',
            'relationship' => 'required|string|in:parent,guardian,caregiver',
            'otp' => 'required|string|size:6',
            // MoH Guideline 4: the minor must also give their own assent.
            'minor_assent' => 'required|accepted',
        ]);

        $user = Auth::user();

        if (!$user->date_of_birth || \Carbon\Carbon::parse($user->date_of_birth)->age >= 18) {
            return response()->json(['error' => 'Parental consent not required'], 422);
        }

        if ($user->parentalConsent()->exists()) {
            return response()->json(['error' => 'Parental consent already provided'], 422);
        }

        $storedOtp = \Cache::get("parental_consent_otp_{$user->id}");

        if (!$storedOtp || $storedOtp !== $request->otp) {
            return response()->json(['error' => 'Invalid or expired OTP'], 422);
        }

        $consent = ParentalConsent::create([
            'user_id' => $user->id,
            'guardian_name' => $request->guardian_name,
            'guardian_phone' => $request->guardian_phone,
            'guardian_email' => $request->guardian_email,
            'relationship' => $request->relationship,
            'minor_assent' => true,
            'consent_given_at' => now(),
            'minor_assented_at' => now(),
            'ip_address' => $request->ip(),
        ]);

        \Cache::forget("parental_consent_otp_{$user->id}");

        return response()->json([
            'success' => true,
            'message' => 'Parental consent verified and recorded',
            'consent' => $consent,
        ]);
    }

    public function status(Request $request)
    {
        $user = Auth::user();

        if (!$user->date_of_birth) {
            return response()->json([
                'requires_consent' => false,
                'has_consent' => false,
            ]);
        }

        $age = \Carbon\Carbon::parse($user->date_of_birth)->age;
        $requiresConsent = $age < 18;
        $hasConsent = $user->parentalConsent()->exists();

        return response()->json([
            'requires_consent' => $requiresConsent,
            'has_consent' => $hasConsent,
            'is_adult' => !$requiresConsent,
        ]);
    }
}
