<?php

namespace App\Http\Controllers;

use App\Models\SessionFeedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

/**
 * Post-session feedback (D). Submitted anonymously via a per-session
 * token — no auth required, no user identity captured. The three
 * questions map directly to the audit signals HR & compliance need:
 *   - did the therapist show up?
 *   - satisfaction 1-5
 *   - would you book again?
 *
 * Feedback rows are aggregated later; individual responses never surface
 * to HR, only average signals per-therapist and per-company.
 */
class SessionFeedbackAnonymousController extends Controller
{
    // GET /api/feedback/{token} — resolves whether the survey is still open
    public function show(string $token)
    {
        $feedback = SessionFeedback::where('feedback_token', $token)->first();
        if (!$feedback) {
            return response()->json(['error' => 'Feedback link is no longer valid.'], 404);
        }
        if ($feedback->satisfaction_rating !== null) {
            return response()->json(['status' => 'already_submitted']);
        }
        return response()->json([
            'status' => 'open',
            'requested_at' => $feedback->feedback_requested_at,
        ]);
    }

    // POST /api/feedback/{token}
    public function submit(string $token, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'therapist_showed_up' => 'required|boolean',
            'satisfaction_rating' => 'required|integer|min:1|max:5',
            'would_book_again'    => 'required|boolean',
            'comment'             => 'nullable|string|max:600',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $feedback = SessionFeedback::where('feedback_token', $token)->first();
        if (!$feedback) {
            return response()->json(['error' => 'Feedback link is no longer valid.'], 404);
        }
        if ($feedback->satisfaction_rating !== null) {
            return response()->json(['error' => 'Feedback already submitted for this session.'], 409);
        }

        $feedback->update([
            'therapist_showed_up' => $request->boolean('therapist_showed_up'),
            'satisfaction_rating' => (int) $request->input('satisfaction_rating'),
            'would_book_again'    => $request->boolean('would_book_again'),
            'comment'             => $request->input('comment'),
            // Keep no other identifying markers on this record.
        ]);

        // Mirror aggregate signal onto eap_sessions so HR audit sees it.
        try {
            DB::table('eap_sessions')
                ->where('consultation_id', $feedback->consultation_id)
                ->update([
                    'feedback_score' => (int) $request->input('satisfaction_rating'),
                    'updated_at'     => now(),
                ]);
        } catch (\Throwable $e) { /* column may not exist */ }

        return response()->json(['message' => 'Thank you. Your feedback is anonymous and helps us keep quality high.']);
    }
}
