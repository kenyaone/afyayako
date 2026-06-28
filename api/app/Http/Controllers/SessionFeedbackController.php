<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use App\Models\FollowUpSurvey;
use App\Models\Notification;
use App\Models\Professional;
use App\Models\SessionFeedback;
use Illuminate\Http\Request;

class SessionFeedbackController extends Controller
{
    // Patient submits post-session feedback
    public function store(Request $request, string $consultationId)
    {
        $user = auth('api')->user();
        $consultation = Consultation::where('consultation_id', $consultationId)
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->first();

        if (!$consultation) {
            return response()->json(['error' => 'Session not found or not completed.'], 404);
        }

        if (SessionFeedback::where('consultation_id', $consultation->id)->exists()) {
            return response()->json(['error' => 'Feedback already submitted.'], 422);
        }

        $request->validate([
            'overall_rating'       => 'required|integer|min:1|max:5',
            'communication_rating' => 'required|integer|min:1|max:5',
            'felt_heard'           => 'required|boolean',
            'would_recommend'      => 'required|boolean',
            'felt_safe'            => 'required|boolean',
            'comment'              => 'sometimes|nullable|string|max:1000',
        ]);

        $feedback = SessionFeedback::create([
            'consultation_id'      => $consultation->id,
            'user_id'              => $user->id,
            'overall_rating'       => $request->overall_rating,
            'communication_rating' => $request->communication_rating,
            'felt_heard'           => $request->felt_heard,
            'would_recommend'      => $request->would_recommend,
            'felt_safe'            => $request->felt_safe,
            'comment'              => $request->comment,
        ]);

        // Update professional's rating (only from visible reviews)
        $pro = Professional::find($consultation->professional_id);
        if ($pro) {
            $this->recomputeRating($pro);
        }

        // Schedule follow-up surveys
        $this->scheduleFollowUpSurveys($consultation->id, $user->id);

        // Notify professional
        if ($pro) {
            Notification::send(
                $pro->user_id,
                'new_feedback',
                'New session feedback received',
                "A patient rated your session {$request->overall_rating}/5.",
                ['consultation_id' => $consultation->id, 'overall_rating' => $request->overall_rating]
            );
        }

        return response()->json(['feedback' => $feedback], 201);
    }

    // Public: list visible reviews for a professional's profile page
    public function publicReviews(int $proId)
    {
        $pro = Professional::findOrFail($proId);

        $reviews = SessionFeedback::whereHas('consultation', fn($q) => $q->where('professional_id', $pro->id))
            ->where('is_hidden', false)
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(fn($f) => [
                'id'                   => $f->id,
                'overall_rating'       => $f->overall_rating,
                'communication_rating' => $f->communication_rating,
                'felt_heard'           => $f->felt_heard,
                'would_recommend'      => $f->would_recommend,
                'felt_safe'            => $f->felt_safe,
                'comment'              => $f->comment,
                'created_at'           => $f->created_at,
                'flag_status'          => $f->flag_status,
            ]);

        return response()->json(['reviews' => $reviews]);
    }

    // Authenticated user flags a review
    public function flag(Request $request, int $id)
    {
        $user = auth('api')->user();
        $feedback = SessionFeedback::findOrFail($id);

        if ($feedback->flag_status !== 'none') {
            return response()->json(['error' => 'This review has already been flagged.'], 422);
        }

        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $feedback->update([
            'flag_status' => 'flagged',
            'flag_reason' => $request->reason,
            'flagged_by'  => $user->id,
            'flagged_at'  => now(),
        ]);

        // Notify all admins
        \App\Models\User::where('role', 'admin')->each(function ($admin) use ($feedback, $request) {
            Notification::send(
                $admin->id,
                'review_flagged',
                'Review flagged for moderation',
                "A session review was flagged: \"{$request->reason}\"",
                ['feedback_id' => $feedback->id]
            );
        });

        return response()->json(['message' => 'Review flagged. Our team will review it within 24 hours.']);
    }

    // Admin: list all pending flagged reviews
    public function adminFlagged()
    {
        $feedbacks = SessionFeedback::with([
            'consultation.professional.user:id,display_name,username',
            'flagger:id,display_name,username',
        ])
        ->where('flag_status', 'flagged')
        ->orderByDesc('flagged_at')
        ->get()
        ->map(fn($f) => [
            'id'             => $f->id,
            'overall_rating' => $f->overall_rating,
            'comment'        => $f->comment,
            'flag_reason'    => $f->flag_reason,
            'flagged_at'     => $f->flagged_at,
            'flagged_by'     => $f->flagger?->display_name ?? $f->flagger?->username ?? 'Unknown',
            'professional'   => optional($f->consultation?->professional?->user)->display_name
                                ?? optional($f->consultation?->professional?->user)->username
                                ?? 'Unknown',
            'professional_id'=> $f->consultation?->professional_id,
        ]);

        return response()->json(['flagged' => $feedbacks]);
    }

    // Admin: clear a flagged review (keep visible, mark as reviewed)
    public function adminClear(int $id)
    {
        $feedback = SessionFeedback::findOrFail($id);
        $feedback->update(['flag_status' => 'cleared']);
        return response()->json(['message' => 'Review cleared — it remains visible on the profile.']);
    }

    // Admin: remove a review from public view and recompute professional rating
    public function adminRemove(int $id)
    {
        $feedback = SessionFeedback::with('consultation')->findOrFail($id);
        $feedback->update(['flag_status' => 'removed', 'is_hidden' => true]);

        $pro = Professional::find($feedback->consultation?->professional_id ?? 0);
        if ($pro) {
            $this->recomputeRating($pro);
        }

        return response()->json(['message' => 'Review removed from the professional\'s profile.']);
    }

    // Professional sees their own aggregated feedback
    public function myFeedback()
    {
        $user = auth('api')->user();
        $pro  = Professional::forUser($user)->first();
        if (!$pro) return response()->json(['error' => 'Not a professional.'], 403);

        $feedbacks = SessionFeedback::with('consultation:id,consultation_id,scheduled_at')
            ->whereHas('consultation', fn($q) => $q->where('professional_id', $pro->id))
            ->orderByDesc('created_at')
            ->paginate(20);

        $stats = [
            'avg_overall'         => round(SessionFeedback::whereHas('consultation', fn($q) => $q->where('professional_id', $pro->id))->avg('overall_rating') ?? 0, 2),
            'avg_communication'   => round(SessionFeedback::whereHas('consultation', fn($q) => $q->where('professional_id', $pro->id))->avg('communication_rating') ?? 0, 2),
            'felt_heard_pct'      => $this->pct($pro->id, 'felt_heard'),
            'would_recommend_pct' => $this->pct($pro->id, 'would_recommend'),
            'felt_safe_pct'       => $this->pct($pro->id, 'felt_safe'),
            'total'               => $feedbacks->total(),
        ];

        return response()->json(['stats' => $stats, 'feedbacks' => $feedbacks]);
    }

    private function recomputeRating(Professional $pro): void
    {
        $base = SessionFeedback::whereHas('consultation', fn($q) => $q->where('professional_id', $pro->id))
            ->where('is_hidden', false);

        $avg   = $base->avg('overall_rating');
        $count = $base->count();
        $pro->update(['rating' => round($avg ?? 0, 2), 'total_reviews' => $count]);
    }

    private function pct(int $proId, string $col): int
    {
        $total = SessionFeedback::whereHas('consultation', fn($q) => $q->where('professional_id', $proId))->count();
        if (!$total) return 0;
        $yes = SessionFeedback::whereHas('consultation', fn($q) => $q->where('professional_id', $proId))->where($col, true)->count();
        return (int) round($yes / $total * 100);
    }

    private function scheduleFollowUpSurveys(int $consultationId, int $userId): void
    {
        $now = now();
        foreach (['3day' => 3, '1week' => 7, '1month' => 30] as $type => $days) {
            FollowUpSurvey::firstOrCreate(
                ['consultation_id' => $consultationId, 'survey_type' => $type],
                ['user_id' => $userId, 'due_at' => $now->copy()->addDays($days)]
            );
        }
    }
}
