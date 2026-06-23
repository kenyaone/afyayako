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

class SendSessionReminders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $now = now();

        // 24-hour window: sessions scheduled between now+23h and now+25h
        $window24Start = $now->copy()->addHours(23);
        $window24End   = $now->copy()->addHours(25);

        // 1-hour window: sessions scheduled between now+50min and now+70min
        $window1Start  = $now->copy()->addMinutes(50);
        $window1End    = $now->copy()->addMinutes(70);

        $consultations = Consultation::with(['user', 'professional.user'])
            ->whereIn('status', ['confirmed'])
            ->where(function ($q) use ($window24Start, $window24End, $window1Start, $window1End) {
                $q->whereBetween('scheduled_at', [$window24Start, $window24End])
                  ->orWhereBetween('scheduled_at', [$window1Start, $window1End]);
            })
            ->get();

        foreach ($consultations as $c) {
            $hours = $now->diffInHours($c->scheduled_at);
            $label = $hours >= 20 ? '24 hours' : '1 hour';

            // Email patient
            if ($c->user && $c->user->email) {
                try {
                    Mail::to($c->user->email)->queue(
                        new SessionReminder($c, $c->user->display_name ?? $c->user->username, $label, false)
                    );
                } catch (\Exception $e) {
                    Log::warning('Reminder to patient failed', ['consultation_id' => $c->consultation_id, 'error' => $e->getMessage()]);
                }
            }

            // Email professional
            if ($c->professional && $c->professional->user && $c->professional->user->email) {
                try {
                    Mail::to($c->professional->user->email)->queue(
                        new SessionReminder($c, $c->professional->user->display_name ?? 'Doctor', $label, true)
                    );
                } catch (\Exception $e) {
                    Log::warning('Reminder to professional failed', ['consultation_id' => $c->consultation_id, 'error' => $e->getMessage()]);
                }
            }
        }

        Log::info('Session reminders sent', ['count' => $consultations->count(), 'checked_at' => $now->toISOString()]);
    }
}
