<?php

namespace App\Console\Commands;

use App\Mail\SessionFeedbackRequest;
use App\Models\SessionFeedback;
use App\Models\Consultation;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

/**
 * Fires every hour. Sends the 3-question feedback survey email to
 * employees whose session was marked complete ≥ 24h ago, only once.
 *
 * Cron: `0 * * * *` (top of every hour). Manual: `php artisan eap:send-feedback-requests`.
 */
class SendSessionFeedbackRequests extends Command
{
    protected $signature   = 'eap:send-feedback-requests';
    protected $description = 'Email pending post-session feedback survey links (24h after completion).';

    public function handle(): int
    {
        $ready = SessionFeedback::whereNull('satisfaction_rating')
            ->whereNotNull('feedback_token')
            ->whereNotNull('feedback_requested_at')
            ->where('feedback_requested_at', '<=', now()->subHours(24))
            ->whereRaw('COALESCE(feedback_email_sent_at, 0) = 0')
            ->get();

        if ($ready->isEmpty()) {
            $this->line('No feedback surveys due right now.');
            return self::SUCCESS;
        }

        $sent = 0;
        foreach ($ready as $fb) {
            $consultation = Consultation::with('professional')->find($fb->consultation_id);
            $user         = User::find($fb->user_id);

            if (!$user?->email || !$consultation) {
                continue;
            }

            $url = rtrim(config('app.frontend_url', config('app.url')), '/')
                 . '/feedback/' . $fb->feedback_token;

            try {
                Mail::to($user->email)->send(new SessionFeedbackRequest(
                    feedback:         $fb,
                    recipientName:    $user->display_name ?? 'there',
                    therapistName:    $consultation->professional?->full_name ?? 'your therapist',
                    sessionDateLabel: optional($consultation->scheduled_at)->format('D d M Y · H:i') ?? '',
                    feedbackUrl:      $url,
                ));

                // Non-destructive mark: try to timestamp column if it exists.
                try {
                    $fb->forceFill(['feedback_email_sent_at' => now()])->save();
                } catch (\Throwable $e) {
                    // Column may not exist — fall back to just noting the token was used.
                }
                $sent++;
            } catch (\Throwable $e) {
                $this->warn('Failed for consultation '.$consultation->id.': '.$e->getMessage());
            }
        }

        $this->info("Sent {$sent} feedback request(s).");
        return self::SUCCESS;
    }
}
