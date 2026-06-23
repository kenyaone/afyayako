<?php
namespace App\Http\Controllers;

use App\Models\SafetyPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SafetyPlanController extends Controller
{
    public function show()
    {
        $user = auth('api')->user();
        $plan = SafetyPlan::where('user_id', $user->id)->where('is_active', true)
            ->with('professional.user:id,display_name')
            ->latest()->first();
        return response()->json(['plan' => $plan]);
    }

    public function store(Request $request)
    {
        $v = Validator::make($request->all(), [
            'warning_signs'         => 'nullable|array',
            'coping_strategies'     => 'nullable|array',
            'support_contacts'      => 'nullable|array',
            'crisis_resources'      => 'nullable|array',
            'reasons_to_live'       => 'nullable|array',
            'safe_environment_steps'=> 'nullable|array',
        ]);
        if ($v->fails()) return response()->json(['error' => $v->errors()->first()], 422);

        $user = auth('api')->user();

        // Deactivate old plan
        SafetyPlan::where('user_id', $user->id)->update(['is_active' => false]);

        $plan = SafetyPlan::create([
            'user_id'                => $user->id,
            'professional_id'        => $request->professional_id,
            'warning_signs'          => $request->warning_signs ?? [],
            'coping_strategies'      => $request->coping_strategies ?? [],
            'support_contacts'       => $request->support_contacts ?? [],
            'crisis_resources'       => $request->crisis_resources ?? \App\Support\Hotlines::safetyPlanDefaults(),
            'reasons_to_live'        => $request->reasons_to_live ?? [],
            'safe_environment_steps' => $request->safe_environment_steps ?? [],
            'is_active'              => true,
            'reviewed_at'            => now(),
        ]);

        return response()->json(['message' => 'Safety plan saved.', 'plan' => $plan], 201);
    }

    public function markReviewed()
    {
        $user = auth('api')->user();
        SafetyPlan::where('user_id', $user->id)->where('is_active', true)
            ->update(['reviewed_at' => now()]);
        return response()->json(['message' => 'Marked as reviewed.']);
    }

    // Professional fetches a patient's plan (must have a consultation with them)
    public function patientPlan(int $patientId)
    {
        $pro = auth('api')->user()->professional;
        if (!$pro) return response()->json(['error' => 'Not a professional'], 403);

        $hasConsult = \App\Models\Consultation::where('professional_id', $pro->id)
            ->where('user_id', $patientId)->exists();
        if (!$hasConsult) return response()->json(['error' => 'No consultation relationship'], 403);

        $plan = SafetyPlan::where('user_id', $patientId)->where('is_active', true)->latest()->first();

        // Audit: professional accessed a patient's safety plan.
        \App\Models\AuditLog::record('view_safety_plan', 'patient', $patientId);

        return response()->json(['plan' => $plan]);
    }
}
