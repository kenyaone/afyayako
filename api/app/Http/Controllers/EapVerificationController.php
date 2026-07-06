<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\EapSession;
use Illuminate\Http\Request;

class EapVerificationController extends Controller
{
    /**
     * Get anonymized session records for HR audit (no employee details)
     */
    public function getSessions(Request $request)
    {
        $user = auth('api')->user();
        $company = Company::where('contact_email', $user->email)->first();

        if (!$company) {
            return response()->json(['error' => 'Not authorized'], 403);
        }

        $query = $company->eapSessions();

        // Filter by status
        if ($request->status) {
            $query->where('session_status', $request->status);
        }

        // Filter by date range
        if ($request->start_date && $request->end_date) {
            $query->whereBetween('session_date', [
                date($request->start_date),
                date($request->end_date)
            ]);
        }

        // Filter by payment status
        if ($request->payment_status) {
            $query->where('payment_status', $request->payment_status);
        }

        // ── Audit / compliance filter ──────────────────────────
        // ?compliance=verified   → all three audit signals true
        //             pending    → any signal missing but session completed
        //             suspicious → completed sessions missing attendance OR notes
        if ($request->compliance === 'verified') {
            $query->where('session_status', 'completed')
                  ->where('attendance_verified', true)
                  ->where('notes_filed', true);
        } elseif ($request->compliance === 'suspicious') {
            $query->where('session_status', 'completed')
                  ->where(function ($q) {
                      $q->where('attendance_verified', false)
                        ->orWhere('notes_filed', false);
                  });
        }

        $sessions = $query
            ->with('corporateEmployee')
            ->orderByDesc('session_date')
            ->paginate(50);

        // Transform to HR-safe view. Ensures the new audit booleans
        // are always present even if the underlying model's hrView
        // hasn't been updated.
        $hrSessions = $sessions->getCollection()->map(function ($session) {
            $base = is_array($session->hrView ?? null) ? $session->hrView : [];
            return array_merge($base, [
                'session_id'          => $session->id,
                'employee_code'       => optional($session->corporateEmployee)->employee_code,
                'therapist_name'      => $session->therapist_name,
                'therapist_license'   => $session->therapist_license,
                'session_date'        => $session->session_date,
                'duration_minutes'    => $session->session_duration_minutes,
                'status'              => $session->session_status,
                'cost'                => (float) $session->cost_charged,
                'payment_status'      => $session->payment_status,
                'attendance_verified' => (bool) ($session->attendance_verified ?? false),
                'notes_filed'         => (bool) ($session->notes_filed ?? false),
                'feedback_score'      => $session->feedback_score,
            ]);
        });

        // Audit compliance metrics
        $completed = $company->eapSessions()->where('session_status', 'completed');
        $completedCount = (int) (clone $completed)->count();
        $verifiedCount  = (int) (clone $completed)->where('attendance_verified', true)->count();
        $notesCount     = (int) (clone $completed)->where('notes_filed', true)->count();
        $feedbackAvg    = (float) (clone $completed)->whereNotNull('feedback_score')->avg('feedback_score');

        $stats = [
            'total_sessions'          => (int) $company->eapSessions()->count(),
            'completed_sessions'      => $completedCount,
            'cancelled_sessions'      => (int) $company->eapSessions()->where('session_status', 'cancelled')->count(),
            'no_shows'                => (int) $company->eapSessions()->where('session_status', 'no-show')->count(),
            'total_cost'              => (float) (clone $completed)->sum('cost_charged'),
            'average_cost_per_session'=> (float) (clone $completed)->avg('cost_charged'),
            'pending_payments'        => (float) $company->eapSessions()->where('payment_status', 'pending')->sum('cost_charged'),
            // Audit / compliance
            'attendance_verified_pct' => $completedCount > 0 ? round(($verifiedCount / $completedCount) * 100) : 0,
            'notes_filed_pct'         => $completedCount > 0 ? round(($notesCount    / $completedCount) * 100) : 0,
            'feedback_avg_rating'     => $feedbackAvg > 0 ? round($feedbackAvg, 1) : null,
            'suspicious_count'        => (int) (clone $completed)
                                            ->where(function ($q) {
                                                $q->where('attendance_verified', false)
                                                  ->orWhere('notes_filed', false);
                                            })->count(),
        ];

        return response()->json([
            'sessions'     => $hrSessions,
            'stats'        => $stats,
            'total'        => $sessions->total(),
            'per_page'     => $sessions->perPage(),
            'current_page' => $sessions->currentPage(),
        ]);
    }

    /**
     * Export anonymized sessions for audit/compliance
     */
    public function exportSessions(Request $request)
    {
        $user = auth('api')->user();
        $company = Company::where('contact_email', $user->email)->first();

        if (!$company) {
            return response()->json(['error' => 'Not authorized'], 403);
        }

        $query = $company->eapSessions();

        if ($request->start_date && $request->end_date) {
            $query->whereBetween('session_date', [
                date($request->start_date),
                date($request->end_date)
            ]);
        }

        $sessions = $query->orderBy('session_date')->get();

        // Generate CSV
        $csv = "Employee Code,Therapist,License,Date,Duration (mins),Status,Cost (KES),Payment Status\n";

        foreach ($sessions as $session) {
            $csv .= implode(',', [
                '"' . $session->corporateEmployee?->employee_code . '"',
                '"' . $session->therapist_name . '"',
                '"' . ($session->therapist_license ?? '') . '"',
                '"' . $session->session_date->format('Y-m-d H:i') . '"',
                $session->session_duration_minutes,
                $session->session_status,
                $session->cost_charged,
                $session->payment_status,
            ]) . "\n";
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="eap-sessions-' . date('Y-m-d') . '.csv"');
    }

    /**
     * Get session detail for verification (no employee identity)
     */
    public function getSessionDetail($id)
    {
        $user = auth('api')->user();
        $company = Company::where('contact_email', $user->email)->first();

        if (!$company) {
            return response()->json(['error' => 'Not authorized'], 403);
        }

        $session = EapSession::where('id', $id)
            ->where('company_id', $company->id)
            ->with('corporateEmployee')
            ->first();

        if (!$session) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        return response()->json([
            'session' => $session->hrView,
            'message' => 'No employee details are included for privacy protection',
        ]);
    }

    /**
     * Therapist verifies treatment completion (send receipt to company)
     */
    public function verifyCompletion(Request $request, $consultationId)
    {
        $user = auth('api')->user();

        // Verify user is the therapist
        $consultation = \App\Models\Consultation::find($consultationId);
        if (!$consultation || $consultation->professional_id !== $user->id) {
            return response()->json(['error' => 'Not authorized'], 403);
        }

        // Find related corporate employee
        $corporateEmployee = \App\Models\CorporateEmployee::where('user_id', $consultation->user_id)->first();
        if (!$corporateEmployee) {
            return response()->json(['error' => 'Not an EAP employee'], 400);
        }

        $validated = $request->validate([
            'session_duration_minutes' => 'required|integer|min:15|max:180',
            'notes_for_company' => 'nullable|string|max:500', // Non-personal summary
        ]);

        // Create session record
        $session = EapSession::create([
            'company_id' => $corporateEmployee->company_id,
            'corporate_employee_id' => $corporateEmployee->id,
            'consultation_id' => $consultation->id,
            'therapist_name' => $user->profile?->full_name ?? $user->display_name,
            'therapist_license' => $user->profile?->kmpdc_license ?? $user->profile?->cpb_license,
            'session_date' => $consultation->scheduled_date,
            'session_duration_minutes' => $validated['session_duration_minutes'],
            'session_status' => 'completed',
            'cost_charged' => $consultation->cost ?? 2500, // Use consultation cost
            'payment_status' => 'paid', // Assuming payment was processed
        ]);

        return response()->json([
            'message' => 'Session verified and recorded',
            'session_id' => $session->id,
            'receipt' => $session->hrView,
        ]);
    }

    /**
     * Monthly summary report for HR
     */
    public function getMonthlyReport(Request $request)
    {
        $user = auth('api')->user();
        $company = Company::where('contact_email', $user->email)->first();

        if (!$company) {
            return response()->json(['error' => 'Not authorized'], 403);
        }

        $month = $request->month ?? date('Y-m');
        $start = date($month . '-01');
        $end = date('Y-m-t', strtotime($start));

        $sessions = $company->eapSessions()
            ->whereBetween('session_date', [$start, $end])
            ->where('session_status', 'completed')
            ->get();

        $therapists = $sessions
            ->groupBy('therapist_name')
            ->map(function ($group) {
                return [
                    'therapist' => $group->first()->therapist_name,
                    'sessions' => $group->count(),
                    'total_cost' => (float) $group->sum('cost_charged'),
                    'avg_duration' => (int) $group->avg('session_duration_minutes'),
                ];
            });

        return response()->json([
            'month' => $month,
            'summary' => [
                'total_sessions' => $sessions->count(),
                'total_cost' => (float) $sessions->sum('cost_charged'),
                'avg_session_cost' => (float) $sessions->avg('cost_charged'),
                'active_employees' => $sessions->unique('corporate_employee_id')->count(),
            ],
            'by_therapist' => $therapists->values(),
        ]);
    }
}
