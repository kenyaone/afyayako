<?php

namespace App\Http\Controllers;

use App\Mail\BookingConfirmation;
use App\Models\Assessment;
use App\Models\Consultation;
use App\Models\MoodLog;
use App\Models\Notification;
use App\Models\Professional;
use App\Models\ProfessionalPayout;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ConsultationController extends Controller
{
    // ─── Patient: list their consultations ───────────────────────────────────

    public function index()
    {
        $user = auth('api')->user();
        $consultations = Consultation::with(['professional.user:id,display_name,username,avatar', 'payment'])
            ->where('user_id', $user->id)
            ->orderByDesc('scheduled_at')
            ->paginate(20);

        return response()->json($consultations);
    }

    // ─── Patient: create booking ─────────────────────────────────────────────

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'professional_id'    => 'required|exists:professionals,id',
            'scheduled_at'       => 'required|date|after:now',
            'duration_minutes'   => 'sometimes|integer|in:30,60,90',
            'mode'               => 'required|string|in:virtual,physical',
            'consent_accepted'   => 'required|boolean',
            'share_assessments'  => 'sometimes|boolean',
            'share_mood_logs'    => 'sometimes|boolean',
            'payment_method'     => 'sometimes|string|in:paystack,pesapal,insurance,cash',
            'triage_snapshot'    => 'sometimes|nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        if (!$request->boolean('consent_accepted')) {
            return response()->json(['error' => 'Consent must be accepted to proceed'], 422);
        }

        $user = auth('api')->user();

        // Document the informed consent against the current versioned telehealth
        // consent document (MoH Guideline 4). The accept checkbox the client ticks
        // is the act of acceptance; we persist version, hash, IP and timestamp.
        \App\Http\Controllers\ConsentController::record($user->id, $request->ip(), 'booking');
        $professional = Professional::find($request->professional_id);

        if (!$professional || $professional->status !== 'verified') {
            return response()->json(['error' => 'Professional not available'], 422);
        }

        if ($request->mode === 'physical' && !$professional->is_available_physical) {
            return response()->json(['error' => 'Professional not available for physical consultations'], 422);
        }

        // Age verification is mandatory before any tele-service (MoH Guideline 2 & 4).
        // A missing date of birth can no longer be silently treated as "adult".
        if (!$user->date_of_birth) {
            return response()->json([
                'error' => 'Please add your date of birth to your profile before booking.',
                'requires_date_of_birth' => true,
            ], 422);
        }

        $isMinor = \Carbon\Carbon::parse($user->date_of_birth)->age < 18;
        if ($isMinor && !$user->parentalConsent()->exists()) {
            return response()->json(['error' => 'Parental consent required', 'requires_parental_consent' => true], 422);
        }

        $duration = $request->duration_minutes ?? 60;
        $amount = $professional->rate_per_hour * ($duration / 60);
        $consultationId = 'cons-' . bin2hex(random_bytes(4));
        $isCash = $request->input('payment_method') === 'cash';

        $consultation = Consultation::create([
            'consultation_id'     => $consultationId,
            'user_id'             => $user->id,
            'professional_id'     => $professional->id,
            'scheduled_at'        => $request->scheduled_at,
            'duration_minutes'    => $duration,
            'mode'                => $request->mode,
            'consent_accepted_at' => now(),
            'status'              => $isCash ? 'confirmed' : 'draft',
            'booking_fee_paid'    => false,
            'amount'              => $amount,
            'jitsi_room'          => $consultationId,
            'share_assessments'   => $request->boolean('share_assessments', false),
            'share_mood_logs'     => $request->boolean('share_mood_logs', false),
            'triage_snapshot'     => $request->input('triage_snapshot'),
        ]);

        $loaded = $consultation->load(['professional.user:id,display_name,email', 'user:id,display_name,email']);

        if ($isCash) {
            $message = 'Session confirmed. Pay at the time of the session.';
        } else {
            $message = 'Booking step 1/4 complete. Next: pay KES 500 booking fee to secure your slot.';
        }

        try {
            if ($user->email) {
                Mail::to($user->email)->send(new BookingConfirmation(
                    $loaded, $user->display_name ?? $user->username, false
                ));
            }
            $proEmail = $loaded->professional?->user?->email;
            if ($proEmail) {
                Mail::to($proEmail)->send(new BookingConfirmation(
                    $loaded, $loaded->professional->user->display_name ?? 'Professional', true
                ));
            }
        } catch (\Exception $e) {
            // Email failures must not block the booking response
        }

        // In-app notification for the therapist. Fires-and-forgets so a bell
        // write failure never blocks the booking response.
        try {
            $proUserId = $loaded->professional?->user?->id;
            if ($proUserId) {
                $whenLabel  = optional($loaded->scheduled_at)->format('D d M · H:i') ?? 'soon';
                $patientLbl = $user->is_anonymous_mode
                    ? 'A new patient'
                    : ($user->display_name ?: $user->username);
                $triage     = $loaded->triage_snapshot ?? null;
                $urgent     = is_array($triage) && (($triage['urgency'] ?? '') === 'crisis' || ($triage['phq9_q9'] ?? 0) >= 2);

                Notification::send(
                    userId:  $proUserId,
                    type:    'booking.created',
                    title:   $urgent ? 'Priority booking — please review' : 'New booking',
                    body:    "{$patientLbl} booked a {$loaded->duration_minutes}-min {$loaded->mode} session on {$whenLabel}.",
                    data:    [
                        'consultation_id'  => $loaded->consultation_id,
                        'scheduled_at'     => $loaded->scheduled_at,
                        'link'             => "/session/{$loaded->consultation_id}",
                        'triage_flagged'   => $urgent,
                    ],
                    urgent:  $urgent,
                );
            }
        } catch (\Throwable $e) {
            \Log::warning('Booking notification failed: '.$e->getMessage());
        }

        return response()->json([
            'message'         => $message,
            'consultation'    => $loaded,
            'next_step'       => $isCash ? 'none' : 'booking_fee_payment',
            'booking_fee_kes' => 500,
        ], 201);
    }

    // ─── Join session (patient or professional) ───────────────────────────────

    public function join($id)
    {
        $user = auth('api')->user();

        $consultation = Consultation::with(['professional.user:id,display_name,avatar', 'user:id,display_name'])
            ->where(function ($q) use ($id) {
                $q->where('id', $id)->orWhere('consultation_id', $id);
            })
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereHas('professional', fn($p) => $p->where('user_id', $user->id));
            })
            ->first();

        if (!$consultation) {
            return response()->json(['error' => 'Session not found or access denied.'], 404);
        }

        if (!in_array($consultation->status, ['confirmed', 'in_progress'])) {
            return response()->json(['error' => 'Session is not ready. Status: ' . $consultation->status], 422);
        }

        // Mark in_progress if within 15 min of start
        if ($consultation->status === 'confirmed') {
            $diff = Carbon::now()->diffInMinutes(Carbon::parse($consultation->scheduled_at), false);
            if ($diff <= 15) {
                $consultation->update(['status' => 'in_progress', 'actual_start' => now()]);
            }
        }

        $isProfessional = $consultation->professional->email === $user->email;

        // ── Attendance audit: record who joined (A) ─────────────────
        // First-time join for a party stamps their joined_at.
        // Once both stamps exist, mark attendance_verified when the two
        // parties overlapped by ≥ 20 minutes (rough "session happened").
        if ($isProfessional && !$consultation->professional_joined_at) {
            $consultation->update(['professional_joined_at' => now()]);
        } elseif (!$isProfessional && !$consultation->patient_joined_at) {
            $consultation->update(['patient_joined_at' => now()]);
        }
        if ($consultation->patient_joined_at && $consultation->professional_joined_at
            && !$consultation->attendance_verified_at) {
            $pat = Carbon::parse($consultation->patient_joined_at);
            $pro = Carbon::parse($consultation->professional_joined_at);
            $bothPresentFrom = $pat->greaterThan($pro) ? $pat : $pro;
            $overlapMinutes  = $bothPresentFrom->diffInMinutes(now());
            if ($overlapMinutes >= 20) {
                $consultation->update(['attendance_verified_at' => now()]);
            }
        }

        $jitsiUrl = 'https://meet.ffmuc.net/' . $consultation->jitsi_room;

        // Shared data the professional can see
        $sharedData = [];
        if ($isProfessional) {
            if ($consultation->share_assessments) {
                $sharedData['assessments'] = Assessment::where('user_id', $consultation->user_id)
                    ->latest()->take(5)
                    ->get(['assessment_type', 'score', 'severity', 'interpretation', 'is_crisis_flag', 'created_at']);
            }
            if ($consultation->share_mood_logs) {
                $sharedData['mood_logs'] = MoodLog::where('user_id', $consultation->user_id)
                    ->latest()->take(7)
                    ->get(['mood_score', 'notes', 'logged_at']);
            }
            if (!empty($sharedData)) {
                \App\Models\AuditLog::record('view_shared_clinical_data', 'consultation', $consultation->id, [
                    'patient_id' => $consultation->user_id,
                    'shared'     => array_keys($sharedData),
                ]);
            }
        }

        return response()->json([
            'consultation'  => $consultation,
            'jitsi_url'     => $jitsiUrl,
            'room'          => $consultation->jitsi_room,
            'display_name'  => $user->display_name,
            'is_professional' => $isProfessional,
            'shared_data'   => $sharedData,
            'session_info'  => [
                'duration_minutes' => $consultation->duration_minutes,
                'scheduled_at'     => $consultation->scheduled_at,
                'amount'           => $consultation->amount,
            ],
        ]);
    }

    // ─── End session (professional marks complete) ────────────────────────────

    public function endSession($id, Request $request)
    {
        $user = auth('api')->user();
        $professional = Professional::forUser($user)->first();

        if (!$professional) {
            return response()->json(['error' => 'Professional profile not found'], 404);
        }

        $consultation = Consultation::where('id', $id)
            ->where('professional_id', $professional->id)
            ->whereIn('status', ['confirmed', 'in_progress'])
            ->first();

        if (!$consultation) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        // ── Gate B: clinical notes required to mark complete ─────────
        $clinicalNotes = $request->input('clinical_notes', $request->input('notes'));
        $wordCount = str_word_count(strip_tags((string) $clinicalNotes));
        if ($wordCount < 30) {
            return response()->json([
                'error' => 'Clinical notes are required (minimum 30 words) to complete a session.',
                'notes_word_count' => $wordCount,
                'required_word_count' => 30,
            ], 422);
        }

        // ── Gate A: attendance verified (both parties joined) ────────
        if (!$consultation->attendance_verified_at) {
            return response()->json([
                'error' => 'Attendance not verified — both employee and therapist must have joined the session.',
                'patient_joined'      => (bool) $consultation->patient_joined_at,
                'professional_joined' => (bool) $consultation->professional_joined_at,
            ], 422);
        }

        $consultation->update([
            'status'                    => 'completed',
            'actual_end'                => now(),
            'professional_notes'        => $clinicalNotes,
            'clinical_notes'            => $clinicalNotes,
            'clinical_notes_filed_at'   => now(),
            'clinical_notes_word_count' => $wordCount,
        ]);

        $professional->increment('total_sessions');

        // Mirror the audit signals onto the eap_sessions row (if any)
        // so HR's /eap-verify can filter without joining consultations.
        try {
            \DB::table('eap_sessions')
                ->where('consultation_id', $consultation->id)
                ->update([
                    'attendance_verified' => true,
                    'notes_filed'         => true,
                    'session_status'      => 'completed',
                    'updated_at'          => now(),
                ]);
        } catch (\Throwable $e) { /* no-op if column missing */ }

        // Queue post-session feedback request (D) — sent 24h later by the
        // eap:send-feedback-requests scheduled command.
        try {
            \App\Models\SessionFeedback::firstOrCreate(
                ['consultation_id' => $consultation->id],
                [
                    'user_id'               => $consultation->user_id,
                    'professional_id'       => $consultation->professional_id,
                    'feedback_token'        => bin2hex(random_bytes(16)),
                    'feedback_requested_at' => now(),
                ]
            );
        } catch (\Throwable $e) { \Log::warning('Feedback queue failed: '.$e->getMessage()); }

        return response()->json([
            'message'      => 'Session marked complete',
            'consultation' => $consultation->fresh(),
            'audit'        => [
                'attendance_verified' => true,
                'notes_filed'         => true,
                'notes_word_count'    => $wordCount,
                'feedback_scheduled'  => true,
            ],
        ]);
    }

    // ─── Recording management ─────────────────────────────────────────────────

    // Patient grants (or withdraws) consent to record this session.
    // MoH Guideline 4 / Data Management: recording requires explicit prior
    // permission. Only the patient (session owner) may grant it.
    public function recordingConsent($id, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'consent' => 'required|boolean',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $user = auth('api')->user();
        $consultation = Consultation::where('id', $id)->where('user_id', $user->id)->first();
        if (!$consultation) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        $granted = $request->boolean('consent');
        $consultation->update([
            'recording_consent'    => $granted,
            'recording_consent_at' => $granted ? now() : null,
            'recording_consent_by' => $granted ? $user->id : null,
            'recording_enabled'    => $granted,
        ]);

        return response()->json([
            'message' => $granted ? 'Recording consent granted.' : 'Recording consent withdrawn.',
            'recording_consent' => $granted,
        ]);
    }

    public function saveRecording($id, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'recording_url' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $user = auth('api')->user();
        $consultation = $this->getOwnConsultation($id, $user->id);

        if (!$consultation) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        // Gate: no recording may be stored without the patient's recorded consent.
        if (!$consultation->recording_consent) {
            return response()->json([
                'error' => 'Recording consent has not been granted for this session.',
                'requires_recording_consent' => true,
            ], 422);
        }

        $consultation->update([
            'recording_url'     => $request->recording_url,
            'recording_kept'    => true,
            'recording_deleted' => false,
        ]);

        return response()->json(['message' => 'Recording saved', 'consultation' => $consultation]);
    }

    public function deleteRecording($id)
    {
        $user = auth('api')->user();
        $consultation = $this->getOwnConsultation($id, $user->id);

        if (!$consultation) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        // Actually remove the stored file when it is hosted by us, not just
        // null the reference (MoH Guideline 4 — secure disposal).
        $this->deleteRecordingFile($consultation->recording_url);

        $consultation->update([
            'recording_url'     => null,
            'recording_kept'    => false,
            'recording_deleted' => true,
        ]);

        \App\Models\AuditLog::record('delete_recording', 'consultation', $consultation->id);

        return response()->json(['message' => 'Recording deleted']);
    }

    public function shareRecording($id)
    {
        $user = auth('api')->user();
        $consultation = $this->getOwnConsultation($id, $user->id);

        if (!$consultation || !$consultation->recording_url) {
            return response()->json(['error' => 'No recording found for this session'], 404);
        }

        return response()->json([
            'share_url'      => $consultation->recording_url,
            'consultation_id'=> $consultation->consultation_id,
            'notice'         => 'Only share this private recording link with people you trust.',
        ]);
    }

    // ─── Notes request (patient asks for full notes) ──────────────────────────

    public function requestNotes($id)
    {
        $user = auth('api')->user();
        $consultation = Consultation::where('id', $id)->where('user_id', $user->id)->first();

        if (!$consultation) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        if ($consultation->status !== 'completed') {
            return response()->json(['error' => 'Notes are only available after a completed session'], 422);
        }

        $consultation->update(['notes_requested_at' => now()]);

        return response()->json([
            'message' => 'Notes request sent to your therapist. They will share within 24–48 hours.',
            'professional_notes' => $consultation->professional_notes,
        ]);
    }

    // ─── Follow-up booking ────────────────────────────────────────────────────

    public function bookFollowUp($id, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'scheduled_at'     => 'required|date|after:now',
            'duration_minutes' => 'sometimes|integer|in:30,60,90',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $user = auth('api')->user();
        $parent = Consultation::where('id', $id)->where('user_id', $user->id)->first();

        if (!$parent) {
            return response()->json(['error' => 'Original consultation not found'], 404);
        }

        $duration = $request->duration_minutes ?? $parent->duration_minutes;
        $professional = $parent->professional;
        $amount = $professional->rate_per_hour * ($duration / 60);

        $followUp = Consultation::create([
            'consultation_id'        => 'cons-' . bin2hex(random_bytes(4)),
            'user_id'                => $user->id,
            'professional_id'        => $parent->professional_id,
            'scheduled_at'           => $request->scheduled_at,
            'duration_minutes'       => $duration,
            'status'                 => 'pending',
            'amount'                 => $amount,
            'jitsi_room'             => 'cons-' . bin2hex(random_bytes(4)),
            'share_assessments'      => $parent->share_assessments,
            'share_mood_logs'        => $parent->share_mood_logs,
            'is_follow_up'           => true,
            'parent_consultation_id' => $parent->id,
        ]);

        return response()->json([
            'message'      => 'Follow-up booked. Proceed to payment.',
            'consultation' => $followUp->load('professional.user:id,display_name'),
        ], 201);
    }

    // ─── Professional: session list ───────────────────────────────────────────

    public function proList()
    {
        $user = auth('api')->user();
        $professional = Professional::forUser($user)->first();

        if (!$professional) {
            return response()->json(['error' => 'Professional profile not found'], 404);
        }

        $consultations = Consultation::with(['user:id,display_name,username,avatar', 'payment'])
            ->where('professional_id', $professional->id)
            ->orderByDesc('scheduled_at')
            ->paginate(20);

        return response()->json($consultations);
    }

    // ─── Show single consultation ─────────────────────────────────────────────

    public function show($id)
    {
        $user = auth('api')->user();

        $consultation = Consultation::with(['professional.user:id,display_name,avatar', 'payment', 'user:id,display_name'])
            ->where('id', $id)
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereHas('professional', fn($p) => $p->where('user_id', $user->id));
            })
            ->first();

        if (!$consultation) {
            return response()->json(['error' => 'Consultation not found'], 404);
        }

        return response()->json(['consultation' => $consultation]);
    }

    // ─── Cancel ───────────────────────────────────────────────────────────────

    public function cancel($id)
    {
        $user = auth('api')->user();
        $consultation = Consultation::where('id', $id)->where('user_id', $user->id)->first();

        if (!$consultation) {
            return response()->json(['error' => 'Consultation not found'], 404);
        }

        if (!in_array($consultation->status, ['pending', 'confirmed'])) {
            return response()->json(['error' => 'Cannot cancel a ' . $consultation->status . ' consultation'], 422);
        }

        $isLate = $consultation->scheduled_at && now()->diffInHours($consultation->scheduled_at, false) < 24
                  && now()->lt($consultation->scheduled_at);

        $consultation->update([
            'status'            => 'cancelled',
            'late_cancellation' => $isLate,
        ]);

        return response()->json([
            'message'          => 'Consultation cancelled',
            'late_cancellation'=> $isLate,
            'consultation'     => $consultation,
        ]);
    }

    // ─── Reschedule ───────────────────────────────────────────────────────────

    public function reschedule($id, Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'scheduled_at' => 'required|date|after:now',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $user = auth('api')->user();
        $consultation = Consultation::where('id', $id)
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereHas('professional', fn($q2) => $q2->where('user_id', $user->id));
            })->first();

        if (!$consultation) {
            return response()->json(['error' => 'Consultation not found'], 404);
        }
        if (!in_array($consultation->status, ['pending', 'confirmed'])) {
            return response()->json(['error' => 'Cannot reschedule a ' . $consultation->status . ' session'], 422);
        }

        $consultation->update(['scheduled_at' => $request->scheduled_at]);

        return response()->json(['message' => 'Session rescheduled.', 'consultation' => $consultation]);
    }

    // ─── Rate ─────────────────────────────────────────────────────────────────

    public function rate($id, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|between:1,5',
            'review' => 'sometimes|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $user = auth('api')->user();
        $consultation = Consultation::where('id', $id)
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->first();

        if (!$consultation) {
            return response()->json(['error' => 'Consultation not found or not completed'], 404);
        }

        $consultation->update([
            'user_rating' => $request->rating,
            'user_review' => $request->review,
        ]);

        $professional = $consultation->professional;
        $allRatings = Consultation::where('professional_id', $professional->id)->whereNotNull('user_rating')->pluck('user_rating');
        $professional->update(['rating' => round($allRatings->avg(), 2), 'total_reviews' => $allRatings->count()]);

        return response()->json(['message' => 'Rating submitted', 'consultation' => $consultation]);
    }

    // ─── Professional: add notes ──────────────────────────────────────────────

    public function addNotes($id, Request $request)
    {
        $validator = Validator::make($request->all(), ['notes' => 'required|string']);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $user = auth('api')->user();
        $professional = Professional::forUser($user)->first();

        if (!$professional) {
            return response()->json(['error' => 'Professional profile not found'], 404);
        }

        $consultation = Consultation::where('id', $id)->where('professional_id', $professional->id)->first();

        if (!$consultation) {
            return response()->json(['error' => 'Consultation not found'], 404);
        }

        $consultation->update(['professional_notes' => $request->notes]);

        return response()->json(['message' => 'Notes saved', 'consultation' => $consultation]);
    }

    // Continuity: patient's most recently-used therapist + booking count
    public function myTherapist()
    {
        $user = auth('api')->user();
        $last = Consultation::with('professional.user:id,display_name,avatar')
            ->where('user_id', $user->id)
            ->whereIn('status', ['confirmed', 'in_progress', 'completed'])
            ->orderByDesc('scheduled_at')
            ->first();

        if (!$last || !$last->professional) {
            return response()->json(['therapist' => null]);
        }

        $count = Consultation::where('user_id', $user->id)
            ->where('professional_id', $last->professional_id)
            ->whereIn('status', ['confirmed', 'in_progress', 'completed'])
            ->count();

        $pro = $last->professional;
        return response()->json([
            'therapist' => [
                'id'               => $pro->id,
                'display_name'     => $pro->full_name ?? 'Therapist',
                'avatar'           => null,
                'sessions_together' => $count,
                'last_session_at'  => $last->scheduled_at,
            ],
        ]);
    }

    // ─── Professional: direct-book a confirmed session (no payment needed) ──────
    // Used when payment was made offline, via EAP, or for test sessions.

    public function directBook(Request $request)
    {
        $user = auth('api')->user();
        $pro  = $user->professional;
        if (!$pro) return response()->json(['error' => 'Not a professional'], 403);

        $validator = Validator::make($request->all(), [
            'patient_username' => 'required|string',
            'scheduled_at'     => 'required|date',
            'duration_minutes' => 'sometimes|integer|in:30,60,90',
            'agreed_amount'    => 'required|numeric|min:0',
            'notes'            => 'sometimes|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $patient = \App\Models\User::where('username', $request->patient_username)
            ->orWhere('email', $request->patient_username)
            ->first();

        if (!$patient) {
            return response()->json(['error' => 'Patient not found — check username or email'], 404);
        }

        $consultationId = 'cons-' . bin2hex(random_bytes(4));

        $consultation = Consultation::create([
            'consultation_id'      => $consultationId,
            'user_id'              => $patient->id,
            'professional_id'      => $pro->id,
            'scheduled_at'         => $request->scheduled_at,
            'duration_minutes'     => $request->duration_minutes ?? 60,
            'status'               => 'confirmed',
            'amount'               => $request->agreed_amount,
            'jitsi_room'           => $consultationId,
            'professional_notes'   => $request->notes ?? null,
            'share_assessments'    => true,
            'share_mood_logs'      => true,
        ]);

        return response()->json([
            'message'      => 'Session created and confirmed.',
            'consultation' => $consultation->load('professional.user:id,display_name'),
            'join_url'     => "/session/{$consultationId}",
        ], 201);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    // Securely remove a locally-hosted recording file. External URLs (recording
    // hosted elsewhere) can't be deleted here, so we just drop the reference.
    private function deleteRecordingFile(?string $url): void
    {
        if (!$url) {
            return;
        }
        $path = parse_url($url, PHP_URL_PATH);
        if (!$path || !str_starts_with($path, '/uploads/')) {
            return; // not a file we host
        }
        $file = public_path(ltrim($path, '/'));
        if (is_file($file)) {
            @unlink($file);
        }
    }

    private function getOwnConsultation(int $id, int $userId): ?Consultation
    {
        return Consultation::where('id', $id)
            ->where(function ($q) use ($userId) {
                $q->where('user_id', $userId)
                  ->orWhereHas('professional', fn($p) => $p->where('user_id', $userId));
            })
            ->first();
    }

    public function payBookingFee(Request $request, $consultationId)
    {
        $request->validate(['phone' => 'required|regex:/^254\d{9}$/']);

        $consultation = Consultation::findOrFail($consultationId);
        if ($consultation->user_id !== auth('api')->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($consultation->booking_fee_paid) {
            return response()->json(['error' => 'Booking fee already paid'], 422);
        }

        if ($consultation->status !== 'draft') {
            return response()->json(['error' => 'Cannot pay booking fee for this consultation'], 422);
        }

        $mpesaService = app(\App\Services\MpesaService::class);
        try {
            $response = $mpesaService->stkPush(
                $request->phone,
                500,
                'Booking Fee',
                'BOOKFEE'
            );

            $payment = \App\Models\Payment::create([
                'consultation_id' => $consultation->id,
                'payment_type' => 'booking_fee',
                'amount' => 500,
                'phone' => $request->phone,
                'mpesa_checkout_id' => $response['CheckoutRequestID'] ?? null,
                'status' => 'pending',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'M-Pesa prompt sent. Enter your PIN.',
                'checkout_id' => $response['CheckoutRequestID'] ?? null,
                'payment_id' => $payment->id,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Payment failed: ' . $e->getMessage()], 400);
        }
    }
}
