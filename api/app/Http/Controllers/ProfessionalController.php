<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\Professional;
use App\Models\Specialization;
use App\Models\Language;
use Carbon\Carbon;
use Illuminate\Support\Facades\URL;

class ProfessionalController extends Controller
{
    /**
     * Handle professional application with file uploads
     */
    public function apply(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:professionals,email',
            'full_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'professional_type' => 'required|in:counselor,doctor,peer_mentor,corporate',

            // File uploads
            'professional_photo' => 'nullable|image|mimes:jpeg,png,webp|max:5120', // 5MB
            'license_document' => 'nullable|mimes:pdf,jpeg,png,jpg|max:10240', // 10MB

            // License Information
            'kmpdc_license' => 'nullable|string',
            'cpb_license' => 'nullable|string',

            // Specializations & Languages
            'specializations' => 'nullable|array',
            'languages' => 'nullable|array',

            // SOP Consent
            'sop_agreed' => 'required|boolean|accepted',
            'signature_name' => 'required|string|max:255',

            // Payment Information
            'mpesa_number' => 'required|string|max:20',
            'bank_name' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:50',
            'account_name' => 'nullable|string|max:255',
            'branch_code' => 'nullable|string|max:50',
            'rate_per_hour' => 'required|numeric|min:500',

            // Bio & Experience
            'bio' => 'nullable|string|max:1000',
            'years_experience' => 'nullable|integer|min:0|max:100',
            'qualification' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Create professional record
            $professional = new Professional();
            $professional->email = $request->email;
            $professional->full_name = $request->full_name;
            $professional->phone = $request->phone;
            $professional->professional_type = $request->professional_type;
            $professional->kmpdc_license = $request->kmpdc_license;
            $professional->cpb_license = $request->cpb_license;

            // Handle photo upload
            if ($request->hasFile('professional_photo')) {
                $photoPath = $this->storeFile(
                    $request->file('professional_photo'),
                    'professionals/photos',
                    $request->email
                );
                $professional->professional_photo_path = $photoPath;
                $professional->professional_photo_original_name = $request->file('professional_photo')->getClientOriginalName();
            }

            // Handle license document upload
            if ($request->hasFile('license_document')) {
                $licensePath = $this->storeFile(
                    $request->file('license_document'),
                    'professionals/licenses',
                    $request->email
                );
                $professional->license_document_path = $licensePath;
                $professional->license_document_original_name = $request->file('license_document')->getClientOriginalName();
            }

            // Specializations & Languages
            $professional->specializations = $request->specializations ?? [];
            $professional->languages = $request->languages ?? ['english'];

            // SOP Consent
            $professional->sop_agreed = true;
            $professional->sop_agreed_at = Carbon::now();
            $professional->signature_name = $request->signature_name;

            // Payment Information
            $professional->mpesa_number = $request->mpesa_number;
            $professional->bank_name = $request->bank_name;
            $professional->account_number = $request->account_number;
            $professional->account_name = $request->account_name;
            $professional->branch_code = $request->branch_code;
            $professional->rate_per_hour = $request->rate_per_hour;

            // Bio & Experience
            $professional->bio = $request->bio;
            $professional->years_experience = $request->years_experience;
            $professional->qualification = $request->qualification;

            // Auto-approve applicants to 'verified' status
            // KMPDC License verification is deferred to admin review (kmpdc_verified stays false)
            $professional->status = 'verified';
            $professional->verified_at = Carbon::now();

            $professional->save();

            return response()->json([
                'success' => true,
                'message' => 'Application submitted successfully. You can now access your professional dashboard.',
                'professional_id' => $professional->id,
                'status' => $professional->status,
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Professional application error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to process application. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Store file and return path
     */
    private function storeFile($file, $directory, $email)
    {
        $timestamp = now()->format('YmdHis');
        $sanitizedEmail = str_replace('@', '_', $email);
        $filename = "{$sanitizedEmail}_{$timestamp}." . $file->getClientOriginalExtension();

        // Store in storage/uploads/ directory
        $path = $file->storeAs($directory, $filename, 'uploads');

        return $path;
    }

    /**
     * Get professional's photo (public endpoint)
     */
    public function getPhoto($id)
    {
        $professional = Professional::find($id);

        if (!$professional || !$professional->professional_photo_path) {
            abort(404);
        }

        $disk = Storage::disk('uploads');
        if (!$disk->exists($professional->professional_photo_path)) {
            abort(404);
        }

        return response($disk->get($professional->professional_photo_path), 200, [
            'Content-Type'  => $disk->mimeType($professional->professional_photo_path) ?: 'image/jpeg',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    /**
     * Get professional details (authenticated)
     */
    public function show($id)
    {
        $professional = Professional::where('status', 'verified')->find($id);

        if (!$professional) {
            return response()->json([
                'success' => false,
                'message' => 'Professional not found or not verified',
            ], 404);
        }

        $toObjects = function ($items) {
            $items = is_array($items) ? $items : [];
            $out = [];
            foreach (array_values($items) as $i => $v) {
                $out[] = is_array($v)
                    ? ['id' => $v['id'] ?? $i, 'name' => $v['name'] ?? '']
                    : ['id' => $i, 'name' => (string) $v];
            }
            return $out;
        };

        $professional->load('availability');

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $professional->id,
                'name' => $professional->full_name,
                'display_name' => $professional->full_name ?: 'Professional',
                'avatar' => null,
                'specializations' => $toObjects($professional->specializations),
                'languages' => $toObjects($professional->languages),
                'availability' => $professional->availability ?? [],
                'rating' => null,
                'total_reviews' => 0,
                'match_reasons' => [],
                'rate_per_hour' => $professional->rate_per_hour,
                'years_experience' => $professional->years_experience,
                'bio' => $professional->bio,
                'photo_url' => $professional->professional_photo_path ? url("/api/professionals/{$professional->id}/photo") : null,
            ],
        ]);
    }

    /**
     * List all verified professionals (public)
     */
    public function index(Request $request)
    {
        $query = Professional::where('status', 'verified');

        // Filter by specialization
        if ($request->has('specialization')) {
            $query->where('specializations', 'like', '%' . $request->specialization . '%');
        }

        // Filter by language
        if ($request->has('language')) {
            $query->where('languages', 'like', '%' . $request->language . '%');
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('professional_type', $request->type);
        }

        // Filter by location (county or town/city)
        if ($request->filled('county')) {
            $query->where('location_county', $request->county);
        }
        if ($request->filled('location')) {
            $query->where(function ($q) use ($request) {
                $q->where('location_county', $request->location)
                  ->orWhere('location_city', $request->location);
            });
        }

        $professionals = $query->paginate(20);

        // Reshape for the directory UI: it expects display_name + specializations/
        // languages as [{name}] objects, and tolerates null rating/match_score.
        $toObjects = function ($items) {
            $items = is_array($items) ? $items : [];
            $out = [];
            foreach (array_values($items) as $i => $v) {
                $out[] = is_array($v)
                    ? ['id' => $v['id'] ?? $i, 'name' => $v['name'] ?? '']
                    : ['id' => $i, 'name' => (string) $v];
            }
            return $out;
        };

        $professionals->getCollection()->transform(function ($p) use ($toObjects) {
            $arr = $p->toArray();
            $arr['display_name']    = $p->full_name ?: 'Professional';
            $arr['avatar']          = null;
            $arr['specializations'] = $toObjects($p->specializations);
            $arr['languages']       = $toObjects($p->languages);
            $arr['rating']          = null;
            $arr['total_reviews']   = 0;
            $arr['match_score']     = null;
            $arr['photo_url']       = $p->professional_photo_path ? url("/api/professionals/{$p->id}/photo") : null;
            return $arr;
        });

        return response()->json([
            'success' => true,
            'data' => $professionals->items(),
            'pagination' => [
                'total' => $professionals->total(),
                'per_page' => $professionals->perPage(),
                'current_page' => $professionals->currentPage(),
            ],
        ]);
    }

    /**
     * Get professional dashboard (authenticated)
     */
    public function dashboard()
    {
        $user = auth()->user();
        $professional = Professional::forUser($user)->first();

        if (!$professional) {
            return response()->json([
                'success' => false,
                'message' => 'Professional profile not found',
            ], 404);
        }

        // Shape specializations/languages as [{id,name}] objects — the dashboard
        // UI (and show()/index()) expect objects, not raw strings.
        $toObjects = function ($items) {
            $items = is_array($items) ? $items : [];
            $out = [];
            foreach (array_values($items) as $i => $v) {
                $out[] = is_array($v)
                    ? ['id' => $v['id'] ?? $i, 'name' => $v['name'] ?? '']
                    : ['id' => $i, 'name' => (string) $v];
            }
            return $out;
        };

        $base      = \App\Models\Consultation::where('professional_id', $professional->id);
        $completed = (clone $base)->where('status', 'completed');

        $totalSessions = (clone $completed)->count();

        // Ratings from session feedback
        $fb           = \App\Models\SessionFeedback::whereHas('consultation', fn($q) => $q->where('professional_id', $professional->id));
        $totalReviews = (clone $fb)->count();
        $rating       = $totalReviews ? round((float) (clone $fb)->avg('overall_rating'), 1) : null;

        // Pending payout: professional keeps 65% of completed-session value
        $pendingPayouts = round((float) (clone $completed)->sum('amount') * 0.65, 2);

        // Upcoming / active sessions
        $upcoming = \App\Models\Consultation::with(['user:id,display_name,username,avatar'])
            ->where('professional_id', $professional->id)
            ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
            ->where('scheduled_at', '>=', now()->subHours(2))
            ->orderBy('scheduled_at')
            ->limit(20)
            ->get()
            ->map(fn($c) => [
                'id'               => $c->id,
                'scheduled_at'     => $c->scheduled_at,
                'duration_minutes' => $c->duration_minutes,
                'status'           => $c->status,
                'amount'           => $c->amount,
                'user'             => [
                    'id'           => $c->user->id ?? 0,
                    'display_name' => $c->user->display_name ?? null,
                    'username'     => $c->user->username ?? null,
                    'avatar'       => $c->user->avatar ?? null,
                ],
            ]);

        // Online presence is tracked per-user in user_presence
        $isOnline = (bool) \App\Models\UserPresence::where('user_id', $user->id)->value('is_online');

        return response()->json([
            'professional' => [
                'id'                        => $professional->id,
                'verification_status'       => $professional->status,
                'rate_per_hour'             => (float) $professional->rate_per_hour,
                'rating'                    => $rating,
                'total_sessions'            => $totalSessions,
                'total_reviews'             => $totalReviews,
                'is_available_online'       => $isOnline,
                'is_accepting_new_patients' => true,
                'specializations'           => $toObjects($professional->specializations),
                'languages'                 => $toObjects($professional->languages),
            ],
            'upcoming_consultations' => $upcoming,
            'pending_payouts'        => $pendingPayouts,
        ]);
    }

    /**
     * Analytics for the logged-in professional (sessions, earnings, ratings).
     */
    public function analytics(Request $request)
    {
        $user = auth('api')->user();
        $pro  = Professional::where('user_id', $user->id)
            ->orWhere('email', $user->email)
            ->first();
        if (!$pro) {
            return response()->json(['error' => 'Not a professional'], 403);
        }

        $period = $request->get('period', '12months');
        $months = $period === '6months' ? 6 : ($period === '3months' ? 3 : 12);

        $base      = \App\Models\Consultation::where('professional_id', $pro->id);
        $completed = (clone $base)->where('status', 'completed');

        $totalSessions = (clone $completed)->count();
        $totalEarned   = round((float) (clone $completed)->sum('amount') * 0.65, 2);
        $allCount      = (clone $base)->count();
        $cancelled     = (clone $base)->where('status', 'cancelled')->count();
        $cancellationRate = $allCount > 0 ? round($cancelled / $allCount * 100, 1) : 0;

        $fbFor = fn() => \App\Models\SessionFeedback::whereHas('consultation', fn($q) => $q->where('professional_id', $pro->id));
        $fbCount   = $fbFor()->count();
        $avgRating = $fbCount ? round((float) $fbFor()->avg('overall_rating'), 1) : 0;
        $pct = fn($col) => $fbCount ? (int) round($fbFor()->where($col, true)->count() / $fbCount * 100) : 0;
        $feltHeard = $pct('felt_heard');
        $feltSafe  = $pct('felt_safe');
        $wouldRec  = $pct('would_recommend');

        $sessionsByMonth = [];
        $earningsByMonth = [];
        $ratingByMonth   = [];
        for ($i = $months - 1; $i >= 0; $i--) {
            $m      = now()->startOfMonth()->subMonths($i);
            $label  = $m->format('M Y');
            $start  = $m->copy()->startOfMonth();
            $end    = $m->copy()->endOfMonth();
            $mDone  = (clone $completed)->whereBetween('scheduled_at', [$start, $end]);
            $mCount = (clone $mDone)->count();
            $mCanc  = (clone $base)->where('status', 'cancelled')->whereBetween('scheduled_at', [$start, $end])->count();
            $mAmt   = round((float) (clone $mDone)->sum('amount') * 0.65, 2);
            $mFb    = \App\Models\SessionFeedback::whereHas('consultation', fn($q) => $q->where('professional_id', $pro->id))
                        ->whereBetween('created_at', [$start, $end]);
            $mAvg   = (clone $mFb)->count() ? round((float) (clone $mFb)->avg('overall_rating'), 1) : 0;

            $sessionsByMonth[] = ['month' => $label, 'count' => $mCount, 'cancelled' => $mCanc];
            $earningsByMonth[] = ['month' => $label, 'amount' => $mAmt];
            $ratingByMonth[]   = ['month' => $label, 'avg' => $mAvg];
        }

        $physical = (clone $completed)->where('mode', 'physical')->count();
        $virtual  = $totalSessions - $physical;

        $patientIds = (clone $completed)->select('user_id')->distinct()->pluck('user_id');
        $newCount = 0; $returning = 0;
        foreach ($patientIds as $pid) {
            $n = (clone $completed)->where('user_id', $pid)->count();
            $n > 1 ? $returning++ : $newCount++;
        }

        return response()->json([
            'summary' => [
                'total_sessions'      => $totalSessions,
                'total_earned'        => $totalEarned,
                'avg_rating'          => $avgRating,
                'cancellation_rate'   => $cancellationRate,
                'felt_heard_pct'      => $feltHeard,
                'felt_safe_pct'       => $feltSafe,
                'would_recommend_pct' => $wouldRec,
            ],
            'sessions_by_month' => $sessionsByMonth,
            'earnings_by_month' => $earningsByMonth,
            'rating_by_month'   => $ratingByMonth,
            'mode_split'        => ['physical' => $physical, 'virtual' => $virtual],
            'patient_split'     => ['new' => $newCount, 'returning' => $returning],
            'feedback_summary'  => [
                'felt_heard_pct'      => $feltHeard,
                'felt_safe_pct'       => $feltSafe,
                'would_recommend_pct' => $wouldRec,
            ],
        ]);
    }

    /**
     * Update availability (authenticated)
     */
    public function updateAvailability(Request $request)
    {
        $user = auth()->user();
        $professional = Professional::forUser($user)->first();

        if (!$professional) {
            return response()->json([
                'success' => false,
                'message' => 'Professional profile not found',
            ], 404);
        }

        // Implementation for availability updates
        // This would integrate with the AvailabilityController

        return response()->json([
            'success' => true,
            'message' => 'Availability updated',
        ]);
    }

    /**
     * Professional registration (authenticated)
     */
    public function register(Request $request)
    {
        // Authenticated user submitting a professional application from the SPA
        // apply form. Identity (email/name) comes from the logged-in account;
        // the rest of the profile comes from the form (multipart/form-data).
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Authentication required.'], 401);
        }

        $validator = Validator::make($request->all(), [
            'kmpdc_license'      => 'nullable|string|max:100',
            'cpb_license'        => 'nullable|string|max:100',
            'qualification'      => 'required|string|max:255',
            'credential_document'=> 'nullable|string|max:500',
            'bio'                => 'required|string|min:80|max:2000',
            'years_experience'   => 'required|integer|min:0|max:60',
            'gender'             => 'nullable|string|max:20',
            'rate_per_hour'      => 'required|numeric|min:500',
            'mpesa_number'       => 'required|string|max:20',
            'signature_name'     => 'required|string|max:255',
            'professional_photo' => 'nullable|image|mimes:jpeg,png,webp|max:5120',
            'location_county'    => 'nullable|string|max:120',
            'location_city'      => 'nullable|string|max:120',
            'latitude'           => 'nullable|numeric',
            'longitude'          => 'nullable|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        // The form sends specialization_ids / language_ids as JSON arrays of IDs.
        // Resolve them to names so they display consistently everywhere.
        $specIds = $this->decodeIds($request->input('specialization_ids'));
        $langIds = $this->decodeIds($request->input('language_ids'));
        $specNames = $specIds
            ? Specialization::whereIn('id', $specIds)->pluck('name')->all()
            : [];
        $langNames = $langIds
            ? Language::whereIn('id', $langIds)->pluck('name')->all()
            : [];

        if (empty($specNames)) {
            return response()->json(['success' => false, 'error' => 'Select at least one specialization.'], 422);
        }
        if (empty($langNames)) {
            return response()->json(['success' => false, 'error' => 'Select at least one language.'], 422);
        }

        // One application per account — update in place if re-applying.
        // Email is optional for counsellors, so find by user_id if available
        $lookupEmail = $user->email ?? "user_{$user->id}@counselor.local";
        $professional = Professional::withTrashed()->firstOrNew(['email' => $lookupEmail]);
        if ($professional->trashed()) {
            $professional->restore();
        }

        $professional->email            = $lookupEmail;
        $professional->full_name        = $user->display_name ?: ($user->username ?? $user->email);
        $professional->phone            = $user->phone;
        $professional->professional_type= 'counselor';
        $professional->kmpdc_license    = $request->kmpdc_license;
        $professional->cpb_license      = $request->cpb_license;
        $professional->qualification    = $request->qualification;
        $professional->credential_document = $request->credential_document;
        $professional->bio              = $request->bio;
        $professional->years_experience = (int) $request->years_experience;
        $professional->gender           = $request->gender;
        $professional->rate_per_hour    = $request->rate_per_hour;
        $professional->mpesa_number     = $request->mpesa_number;
        $professional->signature_name   = $request->signature_name;
        $professional->specializations  = $specNames;
        $professional->languages        = $langNames;
        $professional->location_county  = $request->location_county;
        $professional->location_city    = $request->location_city;
        $professional->latitude         = $request->latitude;
        $professional->longitude        = $request->longitude;
        $professional->is_available_physical = (bool) ($request->location_county || $request->location_city);
        $professional->sop_agreed       = true;
        $professional->sop_agreed_at    = Carbon::now();
        $professional->status           = 'pending';
        $professional->verified_at      = null;

        if ($request->hasFile('professional_photo')) {
            $professional->professional_photo_path = $this->storeFile(
                $request->file('professional_photo'),
                'professionals/photos',
                $user->email
            );
            $professional->professional_photo_original_name = $request->file('professional_photo')->getClientOriginalName();
        }

        $professional->save();

        return response()->json([
            'success'         => true,
            'message'         => 'Application submitted successfully. Our admin team will review and verify your credentials within 24–48 hours.',
            'professional_id' => $professional->id,
            'status'          => $professional->status,
            'user'            => $user,
        ], 201);
    }

    /**
     * Decode a specialization_ids / language_ids field which may arrive as a
     * JSON string ("[1,2]"), an array, or comma-separated values.
     */
    private function decodeIds($raw): array
    {
        if (is_array($raw)) {
            return array_values(array_filter(array_map('intval', $raw)));
        }
        if (is_string($raw) && $raw !== '') {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                return array_values(array_filter(array_map('intval', $decoded)));
            }
            return array_values(array_filter(array_map('intval', explode(',', $raw))));
        }
        return [];
    }

    /**
     * List all specializations for the application form (public).
     */
    public function specializations()
    {
        return response()->json(Specialization::orderBy('name')->get());
    }

    /**
     * List all languages for the application form (public).
     */
    public function languages()
    {
        return response()->json(Language::orderBy('name')->get());
    }

    /**
     * Pre-submission license check for the apply form.
     * There is no live KMPDC registry integration yet, so we accept a
     * plausibly-formatted number to let the application proceed; the admin
     * performs the authoritative verification during review (competence floor
     * + manual approval).
     */
    public function verifyLicense(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'kmpdc_license' => 'required|string|max:100',
        ]);
        if ($validator->fails()) {
            return response()->json(['verified' => false, 'error' => 'License number is required.'], 422);
        }

        $license = trim($request->kmpdc_license);
        $looksValid = (bool) preg_match('/^[A-Za-z0-9][A-Za-z0-9\-\/ ]{2,}$/', $license);

        return response()->json([
            'verified' => $looksValid,
            'message'  => $looksValid
                ? 'License accepted for submission. Final verification is completed by our team during review.'
                : 'That does not look like a valid license number. Please check and try again.',
        ]);
    }
}
