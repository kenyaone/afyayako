<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\EapSubscription;
use App\Models\EapTier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CorporateController extends Controller
{
    public function tiers()
    {
        $tiers = EapTier::where('is_active', true)->get();
        return response()->json(['tiers' => $tiers]);
    }

    public function apply(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'           => 'required|string|max:200',
            'contact_name'   => 'required|string|max:100',
            'contact_email'  => 'required|email',
            'contact_phone'  => 'required|string|max:15',
            'industry'       => 'sometimes|nullable|string|max:100',
            'employee_count' => 'required|integer|min:1',
            'kra_pin'        => 'sometimes|nullable|string|max:20',
            'address'        => 'sometimes|nullable|string',
            'eap_tier_id'    => 'required|exists:eap_tiers,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $tier = EapTier::find($request->eap_tier_id);

        DB::beginTransaction();
        try {
            $company = Company::create([
                'name'           => $request->name,
                'contact_name'   => $request->contact_name,
                'contact_email'  => $request->contact_email,
                'contact_phone'  => $request->contact_phone,
                'industry'       => $request->industry,
                'employee_count' => $request->employee_count,
                'kra_pin'        => $request->kra_pin,
                'address'        => $request->address,
                'is_active'      => false,
            ]);

            $sessionsTotal = $tier->sessions_per_employee * min($request->employee_count, $tier->max_employees);

            $eapSub = EapSubscription::create([
                'company_id'      => $company->id,
                'eap_tier_id'     => $tier->id,
                'admin_user_id'   => auth('api')->id(),
                'status'          => 'pending',
                'employee_limit'  => $tier->max_employees,
                'sessions_total'  => $sessionsTotal,
                'sessions_used'   => 0,
                'amount_paid'     => 0,
            ]);

            DB::commit();

            return response()->json([
                'message'          => 'EAP application submitted. Our team will contact you shortly.',
                'company'          => $company,
                'eap_subscription' => $eapSub->load('eapTier'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Application failed: ' . $e->getMessage()], 500);
        }
    }

    // ─── EAP Employer Dashboard Stats ────────────────────────────────────────
    // Returns anonymised aggregate data only — no patient identities

    public function eapStats()
    {
        $user  = auth('api')->user();
        $sub   = EapSubscription::where('admin_user_id', $user->id)
            ->where('status', 'active')->with('eapTier', 'company')->first();

        if (!$sub) return response()->json(['error' => 'No active EAP subscription'], 404);

        // Sessions usage
        $consultations = \App\Models\Consultation::where('eap_subscription_id', $sub->id)
            ->whereIn('status', ['completed', 'confirmed', 'in_progress'])->get();

        $completedSessions = $consultations->where('status', 'completed')->count();

        // Condition breakdown (anonymised)
        $userIds = $consultations->pluck('user_id')->unique();
        $assessments = \App\Models\Assessment::whereIn('user_id', $userIds)
            ->orderByDesc('created_at')
            ->get()
            ->unique('user_id');

        $conditionBreakdown = $assessments->groupBy('assessment_type')
            ->map(fn($g) => $g->count());

        $severityBreakdown = $assessments->groupBy('severity')
            ->map(fn($g) => $g->count());

        // Monthly sessions trend (last 6 months)
        $trend = \App\Models\Consultation::where('eap_subscription_id', $sub->id)
            ->where('status', 'completed')
            ->where('scheduled_at', '>=', now()->subMonths(6))
            ->selectRaw("DATE_FORMAT(scheduled_at, '%Y-%m') as month, COUNT(*) as count")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'company'            => $sub->company?->name,
            'tier'               => $sub->eapTier?->name,
            'sessions_total'     => $sub->sessions_total,
            'sessions_used'      => $sub->sessions_used,
            'sessions_completed' => $completedSessions,
            'sessions_remaining' => max(0, $sub->sessions_total - $sub->sessions_used),
            'utilisation_pct'    => $sub->sessions_total > 0
                ? round(($sub->sessions_used / $sub->sessions_total) * 100, 1) : 0,
            'employees_enrolled' => $userIds->count(),
            'condition_breakdown'=> $conditionBreakdown,
            'severity_breakdown' => $severityBreakdown,
            'monthly_trend'      => $trend,
        ]);
    }
}
