<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\BurnoutController;
use App\Http\Controllers\CaseloadController;
use App\Http\Controllers\ParentalConsentController;
use App\Http\Controllers\ClinicalReceiptController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\MedicationController;
use App\Http\Controllers\PromoCodeController;
use App\Http\Controllers\SafetyPlanController;
use App\Http\Controllers\TreatmentPlanController;
use App\Http\Controllers\WaitlistController;
use App\Http\Controllers\JournalController;
use App\Http\Controllers\PeerMentorController;
use App\Http\Controllers\SessionTemplateController;
use App\Http\Controllers\AiController;
use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\AvailabilityController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\CorporateController;
use App\Http\Controllers\CrisisController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PHRController;
use App\Http\Controllers\PresenceController;
use App\Http\Controllers\ProfessionalController;
use App\Http\Controllers\ReferralController;
use App\Http\Controllers\SessionFeedbackController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\SupportGroupController;
use App\Http\Controllers\SurveyController;
use Illuminate\Support\Facades\Route;

// -------------------------------------------------------
// Public routes (no auth required)
// -------------------------------------------------------

Route::post('/auth/signup', [AuthController::class, 'signup']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/refresh', [AuthController::class, 'refresh']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

Route::get('/crisis/hotlines', [CrisisController::class, 'hotlines']);

Route::get('/subscriptions/plans', [SubscriptionController::class, 'plans']);

Route::get('/corporate/tiers', [CorporateController::class, 'tiers']);

Route::get('/burnout/questions', [BurnoutController::class, 'questions']);

// M-Pesa callbacks (called by Safaricom, no token)
Route::post('/payments/callback', [PaymentController::class, 'callback']);
Route::post('/payments/subscription/callback', [PaymentController::class, 'subscriptionCallback']);
Route::post('/payments/b2c/result', [PaymentController::class, 'b2cResult']);
Route::post('/payments/b2c/timeout', [PaymentController::class, 'b2cTimeout']);

// PesaPal callbacks (called by PesaPal, no token)
Route::post('/payments/pesapal/callback', [PaymentController::class, 'pesapalCallback']);
Route::get('/payments/pesapal/callback', [PaymentController::class, 'pesapalCallback']);

// Assessment questions — public so TakeAssessment page works before submitting
Route::get('/assessments/questions/{type}', [AssessmentController::class, 'questions']);

// Online professionals — public so the Find Therapist page can show green dots without auth
Route::get('/presence/professionals', [PresenceController::class, 'onlineProfessionals']);

// Availability bookable slots — public (patients check before booking)
Route::get('/professionals/{id}/slots', [AvailabilityController::class, 'bookableSlots']);

// Professional routes — specific routes must appear before {id} wildcard
Route::get('/professionals', [ProfessionalController::class, 'index']);
Route::post('/professionals/register', [ProfessionalController::class, 'register'])->middleware('auth:api');
Route::get('/professionals/me/dashboard', [ProfessionalController::class, 'dashboard'])->middleware('auth:api');
Route::put('/professionals/availability', [ProfessionalController::class, 'updateAvailability'])->middleware('auth:api');
Route::get('/professionals/{id}', [ProfessionalController::class, 'show']);
Route::get('/professionals/{id}/reviews', [SessionFeedbackController::class, 'publicReviews']);

// -------------------------------------------------------
// Authenticated routes
// -------------------------------------------------------

Route::middleware('auth:api')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/me', [AuthController::class, 'updateProfile']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
    Route::delete('/auth/account', [AuthController::class, 'deleteAccount']);
    Route::post('/auth/avatar', [AuthController::class, 'uploadAvatar']);

    // Assessments
    Route::get('/assessments', [AssessmentController::class, 'index']);
    Route::post('/assessments', [AssessmentController::class, 'store']);
    Route::get('/assessments/recommend', [AssessmentController::class, 'recommend']);
    Route::get('/assessments/{id}', [AssessmentController::class, 'show']);

    // Professionals (authenticated actions)
    Route::post('/professionals/apply', [ProfessionalController::class, 'apply']);

    // Consultations — specific routes BEFORE the {id} wildcard
    Route::get('/consultations', [ConsultationController::class, 'index']);
    Route::post('/consultations', [ConsultationController::class, 'store']);
    Route::get('/consultations/professional/list', [ConsultationController::class, 'proList']);
    Route::post('/consultations/direct-book', [ConsultationController::class, 'directBook']);
    Route::get('/consultations/{id}', [ConsultationController::class, 'show']);
    Route::post('/consultations/{id}/join', [ConsultationController::class, 'join']);
    Route::post('/consultations/{id}/end', [ConsultationController::class, 'endSession']);
    Route::post('/consultations/{id}/cancel', [ConsultationController::class, 'cancel']);
    Route::post('/consultations/{id}/rate', [ConsultationController::class, 'rate']);
    Route::put('/consultations/{id}/notes', [ConsultationController::class, 'addNotes']);
    Route::post('/consultations/{id}/recording', [ConsultationController::class, 'saveRecording']);
    Route::delete('/consultations/{id}/recording', [ConsultationController::class, 'deleteRecording']);
    Route::get('/consultations/{id}/recording/share', [ConsultationController::class, 'shareRecording']);
    Route::post('/consultations/{id}/notes-request', [ConsultationController::class, 'requestNotes']);
    Route::post('/consultations/{id}/follow-up', [ConsultationController::class, 'bookFollowUp']);
    Route::put('/consultations/{id}/reschedule', [ConsultationController::class, 'reschedule']);
    Route::post('/consultations/{id}/pay-booking-fee', [ConsultationController::class, 'payBookingFee']);

    // PHR — Mood
    Route::get('/phr/mood/stats', [PHRController::class, 'moodStats']);
    Route::get('/phr/mood', [PHRController::class, 'moodIndex']);
    Route::post('/phr/mood', [PHRController::class, 'moodStore']);

    // PHR — Cravings
    Route::get('/phr/cravings', [PHRController::class, 'cravingIndex']);
    Route::post('/phr/cravings', [PHRController::class, 'cravingStore']);

    // PHR — Sobriety
    Route::get('/phr/sobriety', [PHRController::class, 'sobrietyIndex']);
    Route::post('/phr/sobriety', [PHRController::class, 'sobrietyStore']);
    Route::post('/phr/sobriety/{id}/relapse', [PHRController::class, 'sobrietyRelapse']);
    Route::post('/phr/sobriety/{id}/refresh', [PHRController::class, 'sobrietyRefresh']);

    // Payments (authenticated initiation)
    Route::post('/payments/initiate', [PaymentController::class, 'initiate']);
    Route::post('/payments/insurance-claim', [PaymentController::class, 'insuranceClaim']);
    Route::post('/payments/subscription/initiate', [PaymentController::class, 'subscriptionInitiate']);
    Route::post('/payments/paystack/initialize', [PaymentController::class, 'paystackInitialize']);
    Route::post('/payments/paystack/verify', [PaymentController::class, 'paystackVerify']);
    Route::post('/payments/pesapal/initiate', [PaymentController::class, 'pesapalInitiate']);

    // Crisis
    Route::post('/crisis/report', [CrisisController::class, 'report']);

    // Subscriptions
    Route::post('/subscriptions/subscribe', [SubscriptionController::class, 'subscribe']);
    Route::get('/subscriptions/current', [SubscriptionController::class, 'current']);

    // Corporate / EAP
    Route::post('/corporate/apply', [CorporateController::class, 'apply']);

    // Lessons
    Route::get('/lessons', [LessonController::class, 'index']);
    Route::get('/lessons/{slug}', [LessonController::class, 'show']);
    Route::post('/lessons/{id}/progress', [LessonController::class, 'progress']);

    // AI
    Route::post('/ai/chat', [AiController::class, 'chat']);
    Route::post('/ai/assessment-insight', [AiController::class, 'assessmentInsight']);
    Route::post('/ai/match-explain', [AiController::class, 'matchExplain']);
    Route::get('/ai/progress-insight', [AiController::class, 'progressInsight']);
    Route::post('/ai/soap-notes', [AiController::class, 'soapNotes']);

    // Presence
    Route::post('/presence/heartbeat', [PresenceController::class, 'heartbeat']);
    Route::post('/presence/offline', [PresenceController::class, 'offline']);
    Route::post('/presence/typing', [PresenceController::class, 'typing']);
    Route::post('/presence/status', [PresenceController::class, 'status']);
    Route::get('/presence/consultation/{consultationId}', [PresenceController::class, 'consultationPresence']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/read', [NotificationController::class, 'markRead']);

    // Clinical receipt
    Route::get('/consultations/{id}/receipt', [ClinicalReceiptController::class, 'generate']);

    // Safety plan
    Route::get('/safety-plan', [SafetyPlanController::class, 'show']);
    Route::post('/safety-plan', [SafetyPlanController::class, 'store']);
    Route::post('/safety-plan/reviewed', [SafetyPlanController::class, 'markReviewed']);
    Route::get('/patients/{id}/safety-plan', [SafetyPlanController::class, 'patientPlan']);

    // Recovery goals
    Route::get('/goals', [GoalController::class, 'index']);
    Route::post('/goals', [GoalController::class, 'store']);
    Route::put('/goals/{id}', [GoalController::class, 'update']);
    Route::delete('/goals/{id}', [GoalController::class, 'destroy']);
    Route::get('/patients/{id}/goals', [GoalController::class, 'patientGoals']);
    Route::put('/goals/{id}/progress', [GoalController::class, 'updateProgress']);

    // Medications
    Route::get('/medications', [MedicationController::class, 'index']);
    Route::post('/medications', [MedicationController::class, 'store']);
    Route::put('/medications/{id}', [MedicationController::class, 'update']);
    Route::post('/medications/{id}/log', [MedicationController::class, 'log']);
    Route::get('/medications/{id}/logs', [MedicationController::class, 'logs']);

    // Waitlist
    Route::post('/professionals/{id}/waitlist', [WaitlistController::class, 'join']);
    Route::delete('/professionals/{id}/waitlist', [WaitlistController::class, 'leave']);
    Route::get('/my-waitlist', [WaitlistController::class, 'myWaitlist']);
    Route::post('/professionals/{id}/waitlist/notify-next', [WaitlistController::class, 'notifyNext']);

    // Promo codes
    Route::post('/promo/validate', [PromoCodeController::class, 'validate']);
    Route::post('/promo/redeem', [PromoCodeController::class, 'redeem']);
    Route::get('/promo/my-referral', [PromoCodeController::class, 'myReferralCode']);

    // Peer mentors
    Route::get('/peer-mentors', [PeerMentorController::class, 'index']);
    Route::get('/peer-mentors/me', [PeerMentorController::class, 'myProfile']);
    Route::post('/peer-mentors/apply', [PeerMentorController::class, 'apply']);
    Route::post('/peer-mentors/withdraw', [PeerMentorController::class, 'withdraw']);
    Route::post('/peer-mentors/{id}/connect', [PeerMentorController::class, 'connect']);

    // Insurance claims (patient view)
    Route::get('/my-claims', [PaymentController::class, 'myClaims']);

    // Private journal
    Route::get('/journal', [JournalController::class, 'index']);
    Route::post('/journal', [JournalController::class, 'store']);
    Route::get('/journal/{id}', [JournalController::class, 'show']);
    Route::put('/journal/{id}', [JournalController::class, 'update']);
    Route::delete('/journal/{id}', [JournalController::class, 'destroy']);

    // Session templates (professionals)
    Route::get('/session-templates', [SessionTemplateController::class, 'index']);
    Route::post('/session-templates', [SessionTemplateController::class, 'store']);
    Route::put('/session-templates/{id}', [SessionTemplateController::class, 'update']);
    Route::delete('/session-templates/{id}', [SessionTemplateController::class, 'destroy']);

    // EAP employer dashboard
    Route::get('/corporate/eap-stats', [CorporateController::class, 'eapStats']);

    // Professional caseload
    Route::get('/caseload', [CaseloadController::class, 'index']);
    Route::get('/caseload/{id}', [CaseloadController::class, 'patient']);
    Route::get('/professional/payouts', [CaseloadController::class, 'payoutStatement']);

    // Session feedback
    Route::post('/consultations/{consultationId}/feedback', [SessionFeedbackController::class, 'store']);
    Route::get('/feedback/mine', [SessionFeedbackController::class, 'myFeedback']);
    Route::post('/reviews/{id}/flag', [SessionFeedbackController::class, 'flag']);

    // Follow-up surveys
    Route::get('/surveys/pending', [SurveyController::class, 'pending']);
    Route::post('/surveys/{id}/respond', [SurveyController::class, 'store']);

    // Referrals
    Route::post('/referrals', [ReferralController::class, 'store']);
    Route::get('/referrals', [ReferralController::class, 'index']);
    Route::get('/referrals/mine', [ReferralController::class, 'myReferrals']);
    Route::post('/referrals/{id}/approve', [ReferralController::class, 'approve']);
    Route::post('/referrals/{id}/reject', [ReferralController::class, 'reject']);

    // Support groups
    Route::get('/groups', [SupportGroupController::class, 'index']);
    Route::post('/groups/{id}/join', [SupportGroupController::class, 'join']);
    Route::delete('/groups/{id}/leave', [SupportGroupController::class, 'leave']);
    Route::get('/groups/{id}/messages', [SupportGroupController::class, 'messages']);
    Route::post('/groups/{id}/messages', [SupportGroupController::class, 'postMessage']);

    // Availability (professional only)
    Route::get('/availability/mine', [AvailabilityController::class, 'mine']);
    Route::put('/availability', [AvailabilityController::class, 'update']);
    Route::post('/professional/set-online', [ProfessionalController::class, 'setOnline']);
    Route::put('/professional/service-areas', [ProfessionalController::class, 'updateServiceAreas']);

    // Continuity — patient's most recent completed professional
    Route::get('/consultations/my-therapist', [ConsultationController::class, 'myTherapist']);

    // Parental Consent (for minors)
    Route::post('/parental-consent/request', [ParentalConsentController::class, 'request']);
    Route::post('/parental-consent/verify', [ParentalConsentController::class, 'verify']);

    // Treatment Plans
    Route::post('/treatment-plans', [TreatmentPlanController::class, 'store']);
    Route::get('/treatment-plans/my-prescribed', [TreatmentPlanController::class, 'myPrescribedPlans']);
    Route::get('/treatment-plans/{consultationId}', [TreatmentPlanController::class, 'show']);
    Route::put('/treatment-plans/{id}', [TreatmentPlanController::class, 'update']);
    Route::delete('/treatment-plans/{id}', [TreatmentPlanController::class, 'destroy']);

    // Burnout Assessment (ProQOL-5)
    Route::post('/burnout/pay', [BurnoutController::class, 'initiatePayment']);
    Route::post('/burnout/assess', [BurnoutController::class, 'assess']);
    Route::post('/burnout/{id}/send-report', [BurnoutController::class, 'sendReport']);
    Route::get('/burnout/my-reports', [BurnoutController::class, 'myReports']);

    // Admin routes (role check via middleware)
    Route::middleware('can:admin')->prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/professionals', [AdminController::class, 'professionals']);
        Route::put('/professionals/{id}/verify', [AdminController::class, 'verifyProfessional']);
        Route::get('/consultations', [AdminController::class, 'consultations']);
        Route::put('/consultations/{id}/confirm', [AdminController::class, 'confirmConsultation']);
        Route::get('/workload', [AdminController::class, 'workload']);
        // Support groups management
        Route::get('/groups', [AdminController::class, 'listGroups']);
        Route::post('/groups', [AdminController::class, 'createGroup']);
        Route::put('/groups/{id}', [AdminController::class, 'updateGroup']);
        Route::delete('/groups/{id}', [AdminController::class, 'deleteGroup']);
        // Moderation queue
        Route::get('/moderation/flagged', [AdminController::class, 'flaggedMessages']);
        Route::put('/groups/{id}/moderate/{msgId}', [AdminController::class, 'moderateMessage']);
        // Promo code admin
        Route::get('/promo-codes', [PromoCodeController::class, 'adminList']);
        Route::post('/promo-codes', [PromoCodeController::class, 'adminCreate']);
        // SHA accreditation report
        Route::get('/sha-report', [AdminController::class, 'shaReport']);
        Route::get('/export/sessions', [AdminController::class, 'exportSessions']);
        Route::get('/export/users', [AdminController::class, 'exportUsers']);
        // User management
        Route::get('/users', [AdminController::class, 'listUsers']);
        Route::put('/users/{id}/ban', [AdminController::class, 'banUser']);
        Route::put('/users/{id}/unban', [AdminController::class, 'unbanUser']);
        // Peer mentor approvals
        Route::get('/peer-mentors', [PeerMentorController::class, 'adminList']);
        Route::put('/peer-mentors/{id}/approve', [PeerMentorController::class, 'adminApprove']);
        // Review moderation
        Route::get('/reviews/flagged', [SessionFeedbackController::class, 'adminFlagged']);
        Route::put('/reviews/{id}/clear', [SessionFeedbackController::class, 'adminClear']);
        Route::delete('/reviews/{id}', [SessionFeedbackController::class, 'adminRemove']);
        // Burnout assessment reports
        Route::get('/burnout/reports', [BurnoutController::class, 'allReports']);

        // Treatment plan accountability
        Route::get('/treatment-plans', [AdminController::class, 'treatmentPlans']);
        Route::get('/treatment-plans/:id', [AdminController::class, 'treatmentPlanDetail']);
        Route::get('/treatment-plans-audit', [AdminController::class, 'treatmentPlanAudit']);
    });
});
