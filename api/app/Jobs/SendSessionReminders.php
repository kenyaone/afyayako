<?php

namespace App\Jobs;

use App\Mail\SessionReminder;
use App\Models\Consultation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

/**
 * Sends 24h and 1h reminders for confirmed sessions.
 *
 * Runs every 30 minutes (see routes/console.php). Windows are intentionally
 * wide enough that a session is caught even if a run gets skipped, and
 * dedup columns (reminder_24h_sent_at / reminder_1h_sent_at) prevent a
 * session from being reminded twice.
 */
class SendSessionReminders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $now = now();

        // 24h window: scheduled between now+23h and now+25h AND not already stamped.
        $sent24 = 0;
        Consultation::with(['user', 'professional.user'])
            ->where('status', 'confirmed')
            ->whereBetween('scheduled_at', [$now->copy()->addHours(23), $now->copy()->addHours(25)])
            ->whereNull('reminder_24h_sent_at')
            ->get()
            ->each(function (Consultation $c) use (&$sent24) {
                $this->dispatchReminders($c, '24 hours');
                $c->forceFill(['reminder_24h_sent_at' => now()])->save();
                $sent24++;
            });

        // 1h window: scheduled between now+50m and now+70m AND not already stamped.
        $sent1 = 0;
        Consultation::with(['user', 'professional.user'])
            ->where('status', 'confirmed')
            ->whereBetween('scheduled_at', [$now->copy()->addMinutes(50), $now->copy()->addMinutes(70)])
            ->whereNull('reminder_1h_sent_at')
            ->get()
            ->each(function (Consultation $c) use (&$sent1) {
                $this->dispatchReminders($c, '1 hour');
                $c->forceFill(['reminder_1h_sent_at' => now()])->save();
                $sent1++;
            });

        Log::info('Session reminders swept', ['sent_24h' => $sent24, 'sent_1h' => $sent1, 'at' => $now->toISOString()]);
    }

    private function dispatchReminders(Consultation $c, string $label): void
    {
        // Patient
        if ($c->user && $c->user->email) {
            try {
                Mail::to($c->user->email)->send(
                    new SessionReminder($c, $c->user->display_name ?? $c->user->username, $label, false)
                );
            } catch (\Throwable $e) {
                Log::warning('Reminder to patient failed', ['consultation_id' => $c->consultation_id, 'label' => $label, 'error' => $e->getMessage()]);
            }
        }

        // Professional
        $proUser = $c->professional?->user;
        if ($proUser && $proUser->email) {
            try {
                Mail::to($proUser->email)->send(
                    new SessionReminder($c, $proUser->display_name ?? 'Doctor', $label, true)
                );
            } catch (\Throwable $e) {
                Log::warning('Reminder to professional failed', ['consultation_id' => $c->consultation_id, 'label' => $label, 'error' => $e->getMessage()]);
            }
        }
    }
}
