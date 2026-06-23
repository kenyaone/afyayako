<?php

namespace App\Services;

use App\Models\Consultation;
use App\Models\CrisisEvent;
use App\Models\Notification;
use App\Models\User;
use App\Models\UserPresence;
use Illuminate\Support\Facades\Mail;

/**
 * Central crisis escalation (MoH Guideline 6 & 7 — Emergency Planning and
 * Handling of Suicidal Clients).
 *
 * Both the automated (assessment) and manual (self-report) crisis paths route
 * through here so escalation is consistent: notify admins, alert online
 * professionals if the patient is active, and email the patient's assigned
 * therapist. Every escalation marks the event as escalated for the admin queue.
 */
class CrisisEscalator
{
    public function escalate(CrisisEvent $event, User $user, string $summary): void
    {
        $isOnline = UserPresence::where('user_id', $user->id)
            ->where('last_seen_at', '>=', UserPresence::onlineCutoff())
            ->exists();

        $onlineNote = $isOnline ? ' (currently ONLINE)' : '';
        $body = "Crisis flagged for \"{$user->display_name}\"{$onlineNote}: {$summary}";

        $data = [
            'crisis_event_id' => $event->id,
            'user_id'         => $user->id,
            'severity'        => $event->severity,
            'trigger_source'  => $event->trigger_source,
            'is_online'       => $isOnline,
        ];

        // 1. Always notify admins (urgent).
        Notification::sendToAdmins('crisis_alert', 'URGENT: Crisis flagged', $body, $data, true);

        // 2. If the patient is active right now, alert online professionals.
        if ($isOnline) {
            Notification::sendToOnlineProfessionals(
                'crisis_alert',
                'URGENT: Patient needs immediate support',
                $body,
                $data,
                true
            );
        }

        // 3. Notify the patient's own therapist (most recent confirmed/completed).
        $assignedPro = Consultation::where('user_id', $user->id)
            ->whereIn('status', ['completed', 'confirmed', 'in_progress'])
            ->orderByDesc('scheduled_at')
            ->with('professional.user')
            ->first()?->professional;

        // In-app notification for the assigned professional.
        if ($assignedPro?->user_id) {
            Notification::send(
                $assignedPro->user_id,
                'crisis_alert',
                'URGENT: Your patient was flagged in crisis',
                $body,
                $data,
                true
            );
        }

        // Email backup for the assigned professional.
        if ($assignedPro?->user?->email) {
            try {
                Mail::raw(
                    "URGENT CRISIS ALERT\n\n"
                    . "Your patient \"{$user->display_name}\" has been flagged in crisis.\n\n"
                    . "{$summary}\n\n"
                    . "Please reach out to this patient as soon as possible.\n\n"
                    . "Log in to review: https://mhapke.com/caseload/{$user->id}\n\n"
                    . "— Afya Yako Siri Yako Crisis System",
                    fn($m) => $m->to($assignedPro->user->email)
                        ->subject("⚠️ URGENT: Patient {$user->display_name} flagged — crisis")
                );
            } catch (\Exception $e) {
                // Email failure must never block the crisis flow.
            }
        }

        $event->update(['escalated' => true]);
    }
}
