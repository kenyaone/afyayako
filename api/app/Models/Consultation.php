<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Consultation extends Model
{
    use HasFactory;

    protected $appends = ['user_display_name', 'professional_detail'];

    protected $fillable = [
        'consultation_id',
        'user_id',
        'professional_id',
        'eap_subscription_id',
        'scheduled_at',
        'duration_minutes',
        'status',
        'amount',
        'mode',
        'consent_accepted_at',
        'booking_fee_paid',
        'booking_fee_payment_id',
        'jitsi_room',
        'share_assessments',
        'share_mood_logs',
        'triage_snapshot',
        'recording_enabled',
        'recording_url',
        'recording_kept',
        'recording_deleted',
        'recording_consent',
        'recording_consent_at',
        'recording_consent_by',
        'notes_requested_at',
        'is_follow_up',
        'parent_consultation_id',
        'professional_notes',
        'user_rating',
        'user_review',
        'actual_start',
        'actual_end',
        'reminder_24h_sent_at',
        'reminder_1h_sent_at',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'actual_start' => 'datetime',
            'actual_end' => 'datetime',
            'consent_accepted_at' => 'datetime',
            'notes_requested_at' => 'datetime',
            'share_assessments' => 'boolean',
            'share_mood_logs' => 'boolean',
            'triage_snapshot' => 'array',
            'recording_enabled' => 'boolean',
            'recording_kept' => 'boolean',
            'recording_deleted' => 'boolean',
            'recording_consent' => 'boolean',
            'recording_consent_at' => 'datetime',
            'professional_notes' => 'encrypted', // PHI encrypted at rest (Guideline 4)
            'booking_fee_paid' => 'boolean',
            'is_follow_up' => 'boolean',
            'amount' => 'float',
            'reminder_24h_sent_at' => 'datetime',
            'reminder_1h_sent_at' => 'datetime',
        ];
    }

    public function getUserDisplayNameAttribute(): ?string
    {
        return $this->user?->display_name ?: $this->user?->username;
    }

    public function getProfessionalDetailAttribute(): ?array
    {
        $proUser = $this->professional?->user;
        if (!$proUser) return null;
        return [
            'display_name' => $proUser->display_name ?: $proUser->username,
            'avatar'       => $proUser->avatar,
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function professional()
    {
        return $this->belongsTo(Professional::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function payout()
    {
        return $this->hasOne(ProfessionalPayout::class);
    }

    public function treatmentPlan()
    {
        return $this->hasOne(TreatmentPlan::class);
    }
}
