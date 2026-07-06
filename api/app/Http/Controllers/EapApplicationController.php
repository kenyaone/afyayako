<?php

namespace App\Http\Controllers;

use App\Mail\HrCredentials;
use App\Models\Company;
use App\Models\EapSubscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

/**
 * Admin-facing endpoints for reviewing and activating incoming
 * corporate/EAP applications. Every action is admin-only.
 */
class EapApplicationController extends Controller
{
    // GET /api/admin/eap-applications
    // Lists all pending + recently-activated applications for triage.
    public function index()
    {
        $this->requireAdmin();

        $subs = EapSubscription::with(['company', 'eapTier'])
            ->orderByDesc('created_at')
            ->limit(100)
            ->get()
            ->map(function ($s) {
                $tier = $s->eapTier;
                $emp  = (int) $s->company?->employee_count ?: 0;
                $isFlat = ($tier?->pricing_model ?? '') === 'flat_monthly';
                $monthlyPerEmp = $tier?->price_kes_annual ? $tier->price_kes_annual / 12 : 0;
                $monthlyTotal  = $isFlat ? $monthlyPerEmp : $monthlyPerEmp * $emp;

                return [
                    'id'              => $s->id,
                    'status'          => $s->status,
                    'company'         => [
                        'id'             => $s->company?->id,
                        'name'           => $s->company?->name,
                        'contact_name'   => $s->company?->contact_name,
                        'contact_email'  => $s->company?->contact_email,
                        'contact_phone'  => $s->company?->contact_phone,
                        'industry'       => $s->company?->industry,
                        'employee_count' => $emp,
                        'kra_pin'        => $s->company?->kra_pin,
                    ],
                    'tier'            => $tier?->only('id', 'name', 'pricing_model', 'price_kes_annual', 'sessions_per_employee'),
                    'sessions_total'  => $s->sessions_total,
                    'monthly_bill'    => round($monthlyTotal),
                    'payment_method'  => $s->payment_method,
                    'billing_notes'   => $s->billing_notes,
                    'amount_paid'     => (float) $s->amount_paid,
                    'created_at'      => $s->created_at,
                    'activated_at'    => $s->activated_at,
                ];
            });

        return response()->json(['applications' => $subs]);
    }

    // POST /api/admin/eap-applications/{id}/approve
    // Activates the subscription, creates/attaches HR user, emails credentials.
    public function approve($id, Request $request)
    {
        $this->requireAdmin();

        $validator = Validator::make($request->all(), [
            'amount_paid'    => 'sometimes|nullable|numeric|min:0',
            'payment_method' => 'sometimes|nullable|in:invoice_net30,bank_transfer,cheque',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $sub = EapSubscription::with('company', 'eapTier')->find($id);
        if (!$sub) return response()->json(['error' => 'Application not found'], 404);

        $company = $sub->company;
        if (!$company || !$company->contact_email) {
            return response()->json(['error' => 'Company contact email missing'], 422);
        }

        // Attach or create the HR user linked to Company.contact_email
        $tempPassword = Str::random(12);
        $user = User::where('email', $company->contact_email)->first();
        $created = false;

        if (!$user) {
            $baseUsername = Str::slug(explode('@', $company->contact_email)[0], '_') ?: 'hr_user';
            $username = $baseUsername;
            $i = 1;
            while (User::where('username', $username)->exists()) {
                $username = $baseUsername.'_'.(++$i);
            }
            $user = User::create([
                'username'             => $username,
                'display_name'         => $company->contact_name ?: 'HR · '.$company->name,
                'email'                => $company->contact_email,
                'password'             => bcrypt($tempPassword),
                'role'                 => $this->roleAcceptsCorporate() ? 'corporate' : 'admin',
                'is_anonymous_mode'    => false,
                'anonymity_preference' => 'identified',
            ]);
            $created = true;
        } else {
            $user->password = bcrypt($tempPassword);
            if ($this->roleAcceptsCorporate() && $user->role !== 'admin') {
                $user->role = 'corporate';
            }
            $user->save();
        }

        // Activate the subscription
        $sub->update([
            'status'         => 'active',
            'admin_user_id'  => $user->id,
            'activated_at'   => now(),
            'amount_paid'    => $request->input('amount_paid') ?? $sub->amount_paid,
            'payment_method' => $request->input('payment_method') ?? $sub->payment_method,
            'started_at'     => now(),
            'expires_at'     => now()->addYear(),
        ]);
        $company->update(['is_active' => true]);

        // Send HR credentials
        try {
            Mail::to($company->contact_email)->send(new HrCredentials(
                company:      $company->fresh(),
                user:         $user->fresh(),
                tempPassword: $tempPassword,
                loginUrl:     rtrim(config('app.frontend_url', config('app.url')), '/').'/login',
            ));
        } catch (\Throwable $e) {
            \Log::warning('HR credentials email failed: '.$e->getMessage());
        }

        // EapCompanyInvoice already auto-fires from EapSubscription::booted on
        // status flip to 'active' — no need to duplicate here.

        return response()->json([
            'message'         => 'Application approved and activated.',
            'user_created'    => $created,
            'user_id'         => $user->id,
            'subscription_id' => $sub->id,
        ]);
    }

    // POST /api/admin/eap-applications/{id}/reject
    public function reject($id, Request $request)
    {
        $this->requireAdmin();

        $sub = EapSubscription::find($id);
        if (!$sub) return response()->json(['error' => 'Application not found'], 404);

        $sub->update([
            'status'        => 'rejected',
            'billing_notes' => trim(($sub->billing_notes ?? '')."\n\nRejected: ".$request->input('reason', 'No reason given')),
        ]);

        return response()->json(['message' => 'Application marked rejected.']);
    }

    // ── helpers ───────────────────────────────────────────────

    private function requireAdmin(): void
    {
        $user = auth('api')->user();
        if (!$user || $user->role !== 'admin') {
            abort(response()->json(['error' => 'Admin only'], 403));
        }
    }

    private function roleAcceptsCorporate(): bool
    {
        // Probe the users table CHECK constraint by attempting an insert
        // inside a rolled-back transaction. If it doesn't accept 'corporate',
        // we fall back to 'admin' (still works for EAP access).
        try {
            \DB::beginTransaction();
            \DB::table('users')->insert([
                'username'     => '__probe_corp_'.Str::random(6),
                'display_name' => 'probe',
                'password'     => 'x',
                'role'         => 'corporate',
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);
            \DB::rollBack();
            return true;
        } catch (\Throwable $e) {
            \DB::rollBack();
            return false;
        }
    }
}
