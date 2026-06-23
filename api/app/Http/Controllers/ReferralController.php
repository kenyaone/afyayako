<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Professional;
use App\Models\Referral;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    // Professional creates a referral for a patient
    public function store(Request $request)
    {
        $user = auth('api')->user();
        $pro  = Professional::where('email', $user->email)->first();
        if (!$pro) return response()->json(['error' => 'Not a professional.'], 403);

        $request->validate([
            'patient_id'      => 'required|integer|exists:users,id',
            'consultation_id' => 'nullable|integer|exists:consultations,id',
            'type'            => 'required|in:internal,external',
            'referred_to_professional_id' => 'required_if:type,internal|nullable|integer|exists:professionals,id',
            'referred_to_name' => 'required_if:type,external|nullable|string|max:255',
            'referred_to_org'  => 'nullable|string|max:255',
            'reason'           => 'required|string|max:1000',
            'notes'            => 'nullable|string|max:1000',
        ]);

        $referral = Referral::create([
            'professional_id'             => $pro->id,
            'patient_id'                  => $request->patient_id,
            'consultation_id'             => $request->consultation_id,
            'type'                        => $request->type,
            'referred_to_professional_id' => $request->referred_to_professional_id,
            'referred_to_name'            => $request->referred_to_name,
            'referred_to_org'             => $request->referred_to_org,
            'facility_name'               => $request->input('facility_name'),
            'facility_address'            => $request->input('facility_address'),
            'reason'                      => $request->reason,
            'notes'                       => $request->notes,
        ]);

        // Notify the patient
        Notification::send(
            $request->patient_id,
            'referral',
            'Your therapist has made a referral',
            $request->type === 'internal'
                ? 'You have been referred to another professional on this platform.'
                : "You have been referred to {$request->referred_to_name}" . ($request->referred_to_org ? " at {$request->referred_to_org}" : '') . '.',
            ['referral_id' => $referral->id, 'reason' => $request->reason]
        );

        return response()->json(['referral' => $referral], 201);
    }

    // Professional's own referral history
    public function index()
    {
        $user = auth('api')->user();
        $pro  = Professional::where('email', $user->email)->first();
        if (!$pro) return response()->json(['error' => 'Not a professional.'], 403);

        $referrals = Referral::with(['patient:id,display_name'])
            ->where('professional_id', $pro->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($referrals);
    }

    // Patient sees their referrals
    public function myReferrals()
    {
        $user = auth('api')->user();
        $referrals = Referral::where('patient_id', $user->id)
            ->orderByDesc('created_at')
            ->get();
        return response()->json(['referrals' => $referrals]);
    }

    // ─── Receiving provider feedback loop (MoH Guideline 10) ──────────────────

    // Internal referrals addressed to the logged-in professional.
    public function incoming()
    {
        $user = auth('api')->user();
        $pro  = Professional::where('email', $user->email)->first();
        if (!$pro) return response()->json(['error' => 'Not a professional.'], 403);

        $referrals = Referral::with(['patient:id,display_name', 'professional.user:id,display_name'])
            ->where('referred_to_professional_id', $pro->id)
            ->where('type', 'internal')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($referrals);
    }

    // Receiving professional accepts or declines — feedback flows to the referrer.
    public function respond(Request $request, $id)
    {
        $user = auth('api')->user();
        $pro  = Professional::where('email', $user->email)->first();
        if (!$pro) return response()->json(['error' => 'Not a professional.'], 403);

        $request->validate([
            'response'       => 'required|in:accepted,declined',
            'receiver_notes' => 'nullable|string|max:1000',
        ]);

        $referral = Referral::where('id', $id)
            ->where('referred_to_professional_id', $pro->id)
            ->firstOrFail();

        $referral->update([
            'status'         => $request->response,
            'receiver_notes' => $request->receiver_notes,
            'responded_at'   => now(),
        ]);

        // Close the loop back to the referring professional.
        if ($referral->professional?->user?->id) {
            Notification::send(
                $referral->professional->user?->id,
                'referral_response',
                "Referral {$request->response}",
                "Your referral for a patient was {$request->response} by the receiving professional.",
                ['referral_id' => $referral->id, 'response' => $request->response]
            );
        }

        return response()->json(['success' => true, 'referral' => $referral]);
    }

    // Receiving professional reports the outcome of care — feedback to referrer.
    public function reportOutcome(Request $request, $id)
    {
        $user = auth('api')->user();
        $pro  = Professional::where('email', $user->email)->first();
        if (!$pro) return response()->json(['error' => 'Not a professional.'], 403);

        $request->validate([
            'outcome' => 'required|string|max:2000',
        ]);

        $referral = Referral::where('id', $id)
            ->where('referred_to_professional_id', $pro->id)
            ->firstOrFail();

        $referral->update([
            'status'     => 'completed',
            'outcome'    => $request->outcome,
            'outcome_at' => now(),
        ]);

        if ($referral->professional?->user?->id) {
            Notification::send(
                $referral->professional->user?->id,
                'referral_outcome',
                'Referral outcome reported',
                'The receiving professional has reported the outcome of your referral.',
                ['referral_id' => $referral->id]
            );
        }

        return response()->json(['success' => true, 'referral' => $referral]);
    }

    public function approve(Request $request, $id)
    {
        $user = auth('api')->user();
        // Approval is an oversight action — restricted to admins (supervisors).
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Only admins/supervisors can approve referrals'], 403);
        }

        $request->validate([
            'approval_notes' => 'nullable|string|max:500',
        ]);

        $referral = Referral::findOrFail($id);

        $referral->update([
            'approved_by' => $user->id,
            'approved_at' => now(),
            'approval_notes' => $request->approval_notes,
        ]);

        Notification::send(
            $referral->patient_id,
            'referral_approved',
            'Your referral has been approved',
            'Your referral is now approved and you can proceed.',
            ['referral_id' => $referral->id]
        );

        return response()->json(['success' => true, 'referral' => $referral]);
    }

    public function reject(Request $request, $id)
    {
        $user = auth('api')->user();
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Only admins/supervisors can reject referrals'], 403);
        }

        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $referral = Referral::findOrFail($id);

        $referral->update([
            'status' => 'rejected',
            'approval_notes' => $request->rejection_reason,
        ]);

        Notification::send(
            $referral->patient_id,
            'referral_rejected',
            'Your referral was not approved',
            'The referral could not be approved. Reason: ' . $request->rejection_reason,
            ['referral_id' => $referral->id]
        );

        return response()->json(['success' => true, 'message' => 'Referral rejected']);
    }
}
