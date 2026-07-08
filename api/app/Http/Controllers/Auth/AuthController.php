<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\CorporateEmployee;
use App\Models\EapSubscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
    public function signup(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username'     => 'required|string|min:3|max:50|unique:users,username',
            'display_name' => 'required|string|max:100',
            'password'     => 'required|string|min:6',
            'email'        => 'nullable|email|unique:users,email',
            'phone'        => 'nullable|string|max:15',
            'date_of_birth' => 'required|date|before:today',
            'role'         => 'sometimes|in:user,professional',
            'anonymity_preference' => 'sometimes|nullable|in:anonymous,identified',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $role = in_array($request->role, ['user', 'professional']) ? $request->role : 'user';
        $anonymityPreference = $role === 'user' ? ($request->anonymity_preference ?? 'identified') : null;

        $user = User::create([
            'username'               => $request->username,
            'display_name'           => $request->display_name,
            'password'               => $request->password,
            'email'                  => $request->email,
            'phone'                  => $request->phone,
            'role'                   => $role,
            'date_of_birth'          => $request->date_of_birth,
            'anonymity_preference'   => $anonymityPreference,
            'is_anonymous_mode'      => true,
        ]);

        $token = JWTAuth::fromUser($user);
        $refreshToken = JWTAuth::fromUser($user, ['type' => 'refresh']);

        $age = \Carbon\Carbon::parse($user->date_of_birth)->age;
        $requiresParentalConsent = $age < 18 && !$user->parentalConsent()->exists();

        return response()->json([
            'message' => 'Account created successfully',
            'user'    => $user,
            'access'  => $token,
            'refresh' => $refreshToken,
            'requires_parental_consent' => $requiresParentalConsent,
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        // The login form accepts "email address or username" in the username
        // field, so authenticate against whichever column the input matches.
        $login = trim($request->username);
        $field = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
        $credentials = [
            $field     => $login,
            'password' => $request->password,
        ];

        try {
            if (!$token = auth('api')->attempt($credentials)) {
                return response()->json(['error' => 'Invalid username or password'], 401);
            }
        } catch (JWTException $e) {
            return response()->json(['error' => 'Could not create token'], 500);
        }

        $user = auth('api')->user();

        return response()->json([
            'message' => 'Login successful',
            'user'    => $this->userWithEapStatus($user),
            'access'  => $token,
            'refresh' => $token, // same token; refresh via /auth/refresh
        ]);
    }

    /**
     * Enrich the user payload with EAP-membership info so the frontend can
     * hide payment steps and show session-usage indicators without an extra
     * round-trip. Returns is_eap_employee=false for non-EAP users; when true,
     * adds eap_employee_code, eap_sessions_used, eap_sessions_allowed.
     */
    private function userWithEapStatus(?User $user): ?array
    {
        if (!$user) return null;
        $data = $user->toArray();
        $data['is_eap_employee']    = false;
        $data['eap_sessions_used']  = 0;
        $data['eap_sessions_allowed'] = 0;

        $ce = CorporateEmployee::where('user_id', $user->id)->first();
        if ($ce) {
            $sub = EapSubscription::with('eapTier')
                ->where('company_id', $ce->company_id)
                ->where('status', 'active')
                ->latest()
                ->first();
            if ($sub) {
                $used = Consultation::where('user_id', $user->id)
                    ->where('eap_subscription_id', $sub->id)
                    ->whereYear('created_at', now()->year)
                    ->whereMonth('created_at', now()->month)
                    ->count();
                $data['is_eap_employee']      = true;
                $data['eap_employee_code']    = $ce->employee_code;
                $data['eap_sessions_used']    = $used;
                $data['eap_sessions_allowed'] = $sub->eapTier?->sessions_per_employee ?? 0;
            }
        }
        return $data;
    }

    public function logout(Request $request)
    {
        try {
            auth('api')->logout();
            return response()->json(['message' => 'Logged out successfully']);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Failed to logout'], 500);
        }
    }

    public function me(Request $request)
    {
        $user = auth('api')->user();
        return response()->json(['user' => $this->userWithEapStatus($user)]);
    }

    public function updateProfile(Request $request)
    {
        $user = auth('api')->user();

        $validator = Validator::make($request->all(), [
            'display_name'     => 'sometimes|string|max:100',
            'email'            => 'sometimes|nullable|email|unique:users,email,' . $user->id,
            'phone'            => 'sometimes|nullable|string|max:15',
            'is_anonymous_mode'=> 'sometimes|boolean',
            'avatar'           => 'sometimes|nullable|string',
            // Allow setting DOB once (age verification). Block silently changing
            // it after it's been used to establish minor/adult status.
            'date_of_birth'    => 'sometimes|nullable|date|before:today',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $fields = ['display_name', 'email', 'phone', 'is_anonymous_mode', 'avatar'];
        // Only allow date_of_birth to be set if not already on file.
        if ($request->has('date_of_birth') && !$user->date_of_birth) {
            $fields[] = 'date_of_birth';
        }

        $user->update($request->only($fields));

        return response()->json(['message' => 'Profile updated', 'user' => $user->fresh()]);
    }

    public function refresh(Request $request)
    {
        try {
            $token = auth('api')->refresh();
            return response()->json(['access' => $token]);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Could not refresh token'], 401);
        }
    }

    // ─── Forgot Password ──────────────────────────────────────────────────────

    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $user = User::where('email', $request->email)->first();

        // Always return success to prevent email enumeration
        if (!$user) {
            return response()->json(['message' => 'If that email exists, a reset link has been sent.']);
        }

        $token = Str::random(64);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['token' => Hash::make($token), 'created_at' => now()]
        );

        $base = rtrim(config('app.frontend_url') ?: env('FRONTEND_URL', 'https://afyayako.co.ke'), '/');
        $resetUrl = "{$base}/reset-password?token={$token}&email=" . urlencode($user->email);

        try {
            Mail::raw(
                "Hi {$user->display_name},\n\n"
                . "You requested a password reset for your Afya Yako Siri Yako account.\n\n"
                . "Click this link to reset your password (expires in 60 minutes):\n\n"
                . "{$resetUrl}\n\n"
                . "If you did not request this, ignore this email — your password will not change.\n\n"
                . "— Afya Yako Siri Yako",
                fn($m) => $m->to($user->email)->subject('Reset your password — Afya Yako Siri Yako')
            );
        } catch (\Exception $e) {}

        return response()->json(['message' => 'If that email exists, a reset link has been sent.']);
    }

    // ─── Reset Password ───────────────────────────────────────────────────────

    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'token'    => 'required|string',
            'password' => 'required|string|min:6',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record || !Hash::check($request->token, $record->token)) {
            return response()->json(['error' => 'Invalid or expired reset link.'], 422);
        }

        if (now()->diffInMinutes($record->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['error' => 'Reset link has expired. Please request a new one.'], 422);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $user->update(['password' => $request->password]);

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Password reset successfully. You can now log in.']);
    }

    // ─── Change Password (authenticated) ─────────────────────────────────────

    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:6',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $user = auth('api')->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['error' => 'Current password is incorrect.'], 422);
        }

        if (Hash::check($request->new_password, $user->password)) {
            return response()->json(['error' => 'New password must be different from your current password.'], 422);
        }

        $user->update([
            'password'             => $request->new_password,
            'must_change_password' => false,
        ]);

        return response()->json(['message' => 'Password changed successfully.', 'user' => $user->fresh()]);
    }

    // ─── Delete Account (Right to Erasure — DPA 2019 s.28) ───────────────────

    public function deleteAccount(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|string',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $user = auth('api')->user();

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Incorrect password.'], 422);
        }

        $uid = $user->id;

        // Delete personal records
        DB::table('mood_logs')->where('user_id', $uid)->delete();
        DB::table('sobriety_trackers')->where('user_id', $uid)->delete();
        DB::table('journal_entries')->where('user_id', $uid)->delete();
        DB::table('safety_plans')->where('user_id', $uid)->delete();
        DB::table('recovery_goals')->where('user_id', $uid)->delete();
        DB::table('medications')->where('user_id', $uid)->delete();
        DB::table('user_presence')->where('user_id', $uid)->delete();
        DB::table('group_memberships')->where('user_id', $uid)->delete();
        DB::table('push_subscriptions')->where('user_id', $uid)->delete();
        DB::table('referral_codes')->where('user_id', $uid)->delete();
        DB::table('peer_mentor_profiles')->where('user_id', $uid)->delete();

        // Anonymise identity — keep anonymised assessment + consultation records
        // for professional legal obligations (7-year clinical record requirement)
        $user->update([
            'username'     => 'deleted_' . $uid . '_' . time(),
            'display_name' => 'Deleted User',
            'email'        => null,
            'phone'        => null,
            'avatar'       => null,
        ]);

        auth('api')->logout();

        return response()->json(['message' => 'Account deleted. Your personal data has been erased.']);
    }

    // ─── Avatar Upload ────────────────────────────────────────────────────────

    public function uploadAvatar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'avatar' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $user = auth('api')->user();
        $file = $request->file('avatar');
        $name = 'avatars/' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
        $file->move(public_path('uploads'), $name);
        $url = 'https://api.afyayako.co.ke/uploads/' . $name;

        $user->update(['avatar' => $url]);

        return response()->json(['message' => 'Avatar updated.', 'avatar' => $url, 'user' => $user->fresh()]);
    }
}
