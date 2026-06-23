<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\CrisisEvent;
use App\Models\Notification;
use App\Models\UserPresence;
use App\Services\AssessmentEngine;
use App\Services\CrisisDetector;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AssessmentController extends Controller
{
    // ─── Question Bank ────────────────────────────────────────────────────────

    private array $questions = [

        'phq9' => [
            'title'       => 'PHQ-9 — Depression Screening',
            'description' => 'Over the last 2 weeks, how often have you experienced each of the following? Choose the option that best describes you.',
            'scale'       => [
                '😌  Not at all — hasn\'t bothered me',
                '🙁  A few days — bothered me on some days (1–6 days)',
                '😟  More than half the days — bothered me most days (7–11 days)',
                '😰  Almost every day — bothered me nearly all the time (12–14 days)',
            ],
            'questions'   => [
                ['key' => 'q1', 'text' => 'Lost interest or joy in things you normally enjoy'],
                ['key' => 'q2', 'text' => 'Felt down, sad, hopeless, or empty inside'],
                ['key' => 'q3', 'text' => 'Had trouble sleeping, or slept way too much'],
                ['key' => 'q4', 'text' => 'Felt tired, drained, or had no energy'],
                ['key' => 'q5', 'text' => 'Had very little appetite, or ate too much'],
                ['key' => 'q6', 'text' => 'Felt like a failure, or like you\'ve let yourself or family down'],
                ['key' => 'q7', 'text' => 'Had trouble focusing — reading, watching TV, or even simple tasks'],
                ['key' => 'q8', 'text' => 'Moved or spoke unusually slowly, or felt restless and fidgety'],
                ['key' => 'q9', 'text' => 'Had thoughts that life isn\'t worth living, or thoughts of hurting yourself',
                 'crisis_if_nonzero' => true,
                 'crisis_message'    => 'You are not alone. Many people experience these thoughts. Please read the important message below before continuing.'],
            ],
            'branching' => [
                ['condition' => ['q1' => 0, 'q2' => 0], 'skip_to' => 'q4', 'message' => 'Skipping sleep question (not applicable).'],
            ],
        ],

        'gad7' => [
            'title'       => 'GAD-7 — Anxiety Screening',
            'description' => 'Over the last 2 weeks, how often have you experienced each of the following? Pick the option that fits you best.',
            'scale'       => [
                '😌  Not at all — hasn\'t bothered me',
                '🙁  A few days — happened on some days (1–6 days)',
                '😟  More than half the days — happened most days (7–11 days)',
                '😰  Almost every day — happening nearly all the time (12–14 days)',
            ],
            'questions'   => [
                ['key' => 'q1', 'text' => 'Felt nervous, anxious, or on edge'],
                ['key' => 'q2', 'text' => 'Couldn\'t stop or control your worrying'],
                ['key' => 'q3', 'text' => 'Worried too much about many different things'],
                ['key' => 'q4', 'text' => 'Had difficulty relaxing or unwinding'],
                ['key' => 'q5', 'text' => 'Felt so restless you couldn\'t sit still'],
                ['key' => 'q6', 'text' => 'Got easily annoyed, irritated, or short-tempered'],
                ['key' => 'q7', 'text' => 'Felt afraid that something terrible was about to happen'],
            ],
        ],

        'audit' => [
            'title'       => 'AUDIT — Alcohol Use Screening',
            'description' => 'These questions are about your alcohol use over the past 12 months. There are no right or wrong answers — be honest for the most useful result.',
            'questions'   => [
                ['key' => 'q1', 'text' => 'How often do you drink alcohol?',
                 'scale' => [
                     '🚫  Never — I don\'t drink',
                     '📅  Rarely — once a month or less',
                     '📅  Sometimes — 2–4 times per month',
                     '📅  Often — 2–3 times per week',
                     '📅  Very often — 4 or more times per week',
                 ],
                 'skip_if_zero' => true, 'skip_message' => 'Since you do not drink, the remaining questions are not applicable.'],
                ['key' => 'q2', 'text' => 'On a typical day when you drink, how many drinks do you have?',
                 'scale' => ['1–2 drinks', '3–4 drinks', '5–6 drinks', '7–9 drinks', '10 or more drinks']],
                ['key' => 'q3', 'text' => 'How often do you have 6 or more drinks in one sitting?',
                 'scale' => ['Never', 'Less than once a month', 'About once a month', 'About once a week', 'Every day or almost every day']],
                ['key' => 'q4', 'text' => 'In the past year, how often did you find you couldn\'t stop drinking once you started?',
                 'scale' => ['Never', 'Less than once a month', 'About once a month', 'About once a week', 'Every day or almost every day']],
                ['key' => 'q5', 'text' => 'In the past year, how often did drinking stop you from doing what was expected of you (work, family, etc.)?',
                 'scale' => ['Never', 'Less than once a month', 'About once a month', 'About once a week', 'Every day or almost every day']],
                ['key' => 'q6', 'text' => 'In the past year, how often did you need a drink first thing in the morning to feel okay?',
                 'scale' => ['Never', 'Less than once a month', 'About once a month', 'About once a week', 'Every day or almost every day']],
                ['key' => 'q7', 'text' => 'In the past year, how often did you feel guilty or regret drinking?',
                 'scale' => ['Never', 'Less than once a month', 'About once a month', 'About once a week', 'Every day or almost every day']],
                ['key' => 'q8', 'text' => 'In the past year, how often could you not remember what happened the night before because of drinking?',
                 'scale' => ['Never', 'Less than once a month', 'About once a month', 'About once a week', 'Every day or almost every day']],
                ['key' => 'q9', 'text' => 'Have you or anyone else been hurt or injured because of your drinking?',
                 'scale' => ['No, never', 'Yes, but not in the last year', 'Yes, in the last year']],
                ['key' => 'q10', 'text' => 'Has a family member, friend, or doctor ever told you to cut down on drinking?',
                 'scale' => ['No, never', 'Yes, but not in the last year', 'Yes, in the last year']],
            ],
        ],

        'pgsi' => [
            'title'       => 'PGSI — Problem Gambling Screening',
            'description' => 'In the past 12 months, how often has each of the following happened? Answer honestly — this helps us understand your situation.',
            'scale'       => [
                'Never — this hasn\'t happened to me',
                'Sometimes — a few times',
                'Most of the time — this happens regularly',
                'Almost always — this happens very often',
            ],
            'questions'   => [
                ['key' => 'q1', 'text' => 'You spent more on gambling than you could really afford to lose'],
                ['key' => 'q2', 'text' => 'You needed to bet more money to feel the same level of excitement'],
                ['key' => 'q3', 'text' => 'You went back to try to win back money you had already lost'],
                ['key' => 'q4', 'text' => 'You borrowed money or sold things to pay for gambling'],
                ['key' => 'q5', 'text' => 'You felt you might have a gambling problem'],
                ['key' => 'q6', 'text' => 'Gambling caused you stress, anxiety, or health problems'],
                ['key' => 'q7', 'text' => 'People close to you criticised your gambling or said you had a problem'],
                ['key' => 'q8', 'text' => 'Gambling caused financial problems for you or your family'],
                ['key' => 'q9', 'text' => 'You felt guilty about the way you gamble or what happens because of it'],
            ],
        ],

        'ftnd' => [
            'title'       => 'FTND — Nicotine Dependence',
            'description' => 'These questions help us understand how dependent you are on nicotine. Answer based on your usual smoking habits.',
            'questions'   => [
                ['key' => 'q1', 'text' => 'How soon after waking up do you smoke your first cigarette?',
                 'scale' => ['Within 5 minutes — very soon', 'After 6–30 minutes', 'After 31–60 minutes', 'More than an hour after waking']],
                ['key' => 'q2', 'text' => 'Do you find it hard not to smoke in places where smoking is not allowed?',
                 'scale' => ['No — I can manage fine', 'Yes — I really struggle']],
                ['key' => 'q3', 'text' => 'Which cigarette would be hardest to give up?',
                 'scale' => ['The very first one in the morning', 'Any other cigarette during the day']],
                ['key' => 'q4', 'text' => 'How many cigarettes do you smoke per day?',
                 'scale' => ['10 or fewer', '11–20 cigarettes', '21–30 cigarettes', '31 or more']],
                ['key' => 'q5', 'text' => 'Do you smoke more heavily in the first hour after waking than the rest of the day?',
                 'scale' => ['No — I smoke about the same all day', 'Yes — I smoke more in the morning']],
                ['key' => 'q6', 'text' => 'Do you still smoke when you are sick and have to stay in bed?',
                 'scale' => ['No — I can stop when sick', 'Yes — I still smoke even when sick']],
            ],
        ],
    ];

    // ─── Questions endpoint ───────────────────────────────────────────────────

    public function questions(string $type)
    {
        if (!array_key_exists($type, $this->questions)) {
            return response()->json(['error' => "Unknown assessment type: {$type}"], 404);
        }
        return response()->json($this->questions[$type]);
    }

    // ─── Matching recommendation ──────────────────────────────────────────────

    public function recommend(Request $request)
    {
        $assessmentType = $request->input('type');
        $language       = $request->input('language');       // patient language preference
        $genderPref     = $request->input('gender');         // patient gender preference
        $score          = (int) $request->input('score', 0); // assessment raw score
        $severity       = $request->input('severity', '');   // e.g. "Severe", "Moderate"

        // ── Specialization map ─────────────────────────────────────────────────
        $specMap = [
            'phq9'  => ['Depression & Mood', 'Anxiety & Stress', 'Trauma & PTSD'],
            'gad7'  => ['Anxiety & Stress', 'Depression & Mood', 'Trauma & PTSD'],
            'audit' => ['Addiction & Substance Use', 'Depression & Mood', 'Anxiety & Stress'],
            'pgsi'  => ['Gambling Recovery', 'Addiction & Substance Use', 'Anxiety & Stress'],
            'ftnd'  => ['Tobacco Cessation', 'Addiction & Substance Use'],
        ];

        $targetSpecs = $specMap[$assessmentType] ?? [];

        // ── Severity tier ──────────────────────────────────────────────────────
        // Maps any assessment's severity string to a 3-tier level
        $severityHigh = ['Severe', 'Moderately Severe', 'Possible Dependence', 'Severe (Problem Gambling)',
                         'High Dependence', 'Very High Dependence', 'Harmful Use'];
        $severityMid  = ['Moderate', 'Moderate Risk', 'Medium Dependence', 'Hazardous Use', 'Moderate Risk'];
        $isSevere     = in_array($severity, $severityHigh);
        $isModerate   = in_array($severity, $severityMid);

        // ── Scoring weights ────────────────────────────────────────────────────
        // Specialization:  primary=60  secondary=15  tertiary=5   max=80
        // Rating:          0–20  (actual rating, 0 if unrated — no fake defaults)
        // Experience:      0–10 normally; 0–15 for severe cases (depth matters more)
        // Online sessions: +5 if is_available_online
        // Language match:  +10 if patient language preference matches pro's languages
        // Gender match:    +5 if patient gender preference matches pro's gender
        // Workload:        –15 if pro is at 100% capacity; –8 if >80%; 0 otherwise
        // KMPDC:           hard gate already (verified only) — always shown as reason
        // Accepting pats:  hard gate already — always shown as reason
        //
        // Practical max for a perfect severe match:  80+20+15+5+10+5 = 135
        // Normalise against 120 so an excellent match (primary spec+great rating+exp+online+lang) ≈ 95%
        $NORM = $isSevere ? 125.0 : 115.0;

        // Pre-compute weekly bookings for all professionals (one query)
        $weekStart = now()->startOfWeek();
        $weekEnd   = now()->endOfWeek();
        $weeklyBookings = \App\Models\Consultation::selectRaw('professional_id, COUNT(*) as cnt')
            ->whereBetween('scheduled_at', [$weekStart, $weekEnd])
            ->whereIn('status', ['confirmed', 'in_progress'])
            ->groupBy('professional_id')
            ->pluck('cnt', 'professional_id');

        $professionals = \App\Models\Professional::where('status', 'verified')
            ->get();

        $scored = $professionals->map(function ($pro) use (
            $targetSpecs, $language, $genderPref, $isSevere, $isModerate, $NORM, $weeklyBookings
        ) {
            // specializations / languages are stored as JSON arrays of names.
            $proSpecs = is_array($pro->specializations) ? $pro->specializations : [];
            $proLangs = is_array($pro->languages) ? $pro->languages : [];

            // 1. Specialization — primary=60, secondary=15, tertiary=5
            $specWeights = [60, 15, 5];
            $specScore   = 0;
            $primaryHit  = false;
            foreach ($targetSpecs as $i => $spec) {
                $matched = collect($proSpecs)->contains(
                    fn($ps) => stripos($ps, $spec) !== false || stripos($spec, $ps) !== false
                );
                if ($matched) {
                    $specScore += $specWeights[$i] ?? 5;
                    if ($i === 0) $primaryHit = true;
                }
            }

            // 2. Rating — 0 if no reviews, never fake-defaulted
            $ratingScore = $pro->rating ? ($pro->rating / 5) * 20 : 0;

            // 3. Experience — weighted higher for severe presentations
            $exp = (int)($pro->years_experience ?? 0);
            if ($isSevere) {
                $expScore = min($exp, 15) / 15 * 15; // up to 15 pts for severe
            } elseif ($isModerate) {
                $expScore = min($exp, 10) / 10 * 12; // up to 12 pts for moderate
            } else {
                $expScore = min($exp, 10) / 10 * 10; // up to 10 pts standard
            }

            // 4. Online availability
            $onlineScore = $pro->is_available_online ? 5 : 0;

            // 5. Language match — patient preference vs professional's listed languages
            $langMatch   = $language && in_array($language, $proLangs);
            $langScore   = $langMatch ? 10 : 0;

            // 6. Gender preference match
            $genderMatch = $genderPref && ($pro->gender === $genderPref);
            $genderScore = $genderMatch ? 5 : 0;

            // 7. Workload — penalise over-capacity professionals
            $cap          = max(1, $pro->max_clients_per_week ?? 20);
            $booked       = (int) ($weeklyBookings[$pro->id] ?? 0);
            $loadFraction = $booked / $cap;
            if ($loadFraction >= 1.0)      $workloadPenalty = 15;
            elseif ($loadFraction >= 0.8)  $workloadPenalty = 8;
            else                           $workloadPenalty = 0;

            $total    = $specScore + $ratingScore + $expScore + $onlineScore + $langScore + $genderScore - $workloadPenalty;
            $matchPct = (int) min(100, round($total / $NORM * 100));

            // ── Match reasons (clear, patient-facing) ──────────────────────────
            $reasons = [];
            $reasons[] = 'KMPDC Verified';
            $reasons[] = 'Accepting new patients';
            if ($primaryHit)              $reasons[] = 'Specializes in your condition';
            elseif ($specScore > 0)       $reasons[] = 'Related specialization';
            if ($pro->is_available_online) $reasons[] = 'Online sessions available';
            if ($pro->rating >= 4.5)       $reasons[] = number_format($pro->rating, 1) . '★ — Excellent rating';
            elseif ($pro->rating >= 4.0)   $reasons[] = number_format($pro->rating, 1) . '★ — Highly rated';
            if ($exp >= 7)                 $reasons[] = $exp . ' yrs experience';
            elseif ($exp >= 3)             $reasons[] = $exp . ' yrs experience';
            if ($langMatch)                $reasons[] = 'Speaks ' . $language;
            if ($genderMatch)              $reasons[] = ucfirst($genderPref) . ' therapist';

            // ── Score breakdown (transparent to frontend) ─────────────────────
            $breakdown = [
                'specialization'  => round($specScore),
                'rating'          => round($ratingScore, 1),
                'experience'      => round($expScore, 1),
                'online'          => $onlineScore,
                'language'        => $langScore,
                'gender'          => $genderScore,
                'workload_penalty'=> -$workloadPenalty,
                'load_pct'        => (int) round($loadFraction * 100),
            ];

            return [
                'id'               => $pro->id,
                'display_name'     => $pro->full_name,
                'avatar'           => null,
                'bio'              => $pro->bio,
                'kmpdc_license'    => $pro->kmpdc_license,
                'rate_per_hour'    => $pro->rate_per_hour,
                'rating'           => $pro->rating,
                'total_reviews'    => $pro->total_reviews,
                'years_experience' => $pro->years_experience,
                'gender'           => $pro->gender,
                'is_available_online' => $pro->is_available_online,
                'specializations'  => $pro->specializations,
                'languages'        => $pro->languages,
                'match_score'      => round($total, 1),
                'match_pct'        => $matchPct,
                'match_reasons'    => array_values($reasons),
                'score_breakdown'  => $breakdown,
                'is_top_match'     => false,
            ];
        })->sortByDesc('match_score')->values();

        if ($scored->count() > 0) {
            $topId = $scored->first()['id'];
            $scored = $scored->map(fn($item) => array_merge($item, ['is_top_match' => $item['id'] === $topId]));
        }

        return response()->json([
            'assessment_type' => $assessmentType,
            'severity'        => $severity,
            'score'           => $score,
            'matches'         => $scored->take(5),
            'total_available' => $scored->count(),
        ]);
    }

    // ─── CRUD ─────────────────────────────────────────────────────────────────

    public function index()
    {
        $user = auth('api')->user();
        $assessments = Assessment::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($assessments);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'assessment_type' => 'required|in:phq9,gad7,audit,pgsi,ftnd',
            'responses'       => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $user = auth('api')->user();
        $engine = new AssessmentEngine();
        $crisisDetector = new CrisisDetector();

        try {
            $result = $engine->run($request->assessment_type, $request->responses);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }

        $assessment = Assessment::create([
            'user_id'         => $user->id,
            'assessment_type' => $request->assessment_type,
            'score'           => $result['score'],
            'severity'        => $result['severity'],
            'interpretation'  => $result['interpretation'],
            'recommendations' => $result['recommendations'],
            'responses'       => $request->responses,
            'is_crisis_flag'  => $result['is_crisis_flag'],
        ]);

        if ($result['is_crisis_flag']) {
            $event = CrisisEvent::create([
                'user_id'           => $user->id,
                'trigger_source'    => 'assessment',
                'content'           => "Assessment: {$request->assessment_type} — Score: {$result['score']}",
                'severity'          => 'critical',
                'keywords_detected' => ['crisis_score'],
                'response_action'   => 'Hotlines provided',
                'resolved'          => false,
            ]);

            // Consistent escalation via the shared service (admins, online
            // professionals, and the patient's assigned therapist).
            $summary = "Scored {$result['score']} on " . strtoupper($request->assessment_type)
                . " ({$result['severity']}); suicidal-ideation item flagged.";
            app(\App\Services\CrisisEscalator::class)->escalate($event, $user, $summary);
        }

        return response()->json([
            'assessment'         => $assessment,
            'crisis'             => $result['is_crisis_flag'],
            'prompt_safety_plan' => (bool) $result['is_crisis_flag'],
        ], 201);
    }

    public function show($id)
    {
        $user = auth('api')->user();
        $assessment = Assessment::where('id', $id)->where('user_id', $user->id)->first();

        if (!$assessment) {
            return response()->json(['error' => 'Assessment not found'], 404);
        }

        return response()->json(['assessment' => $assessment]);
    }

    /** Clinician saves a client risk assessment. */
    public function clientRisk(Request $request)
    {
        $data = $request->all();
        $assessment = \App\Models\ClientRiskAssessment::create([
            'assessor_id'       => auth('api')->id(),
            'client_name'       => $data['client_name'] ?? ($data['name'] ?? null),
            'client_age'        => $data['client_age'] ?? ($data['age'] ?? null),
            'suicidal_ideation' => (int) ($data['suicidal_ideation'] ?? 0),
            'self_harm'         => (int) ($data['self_harm'] ?? 0),
            'substance_abuse'   => (int) ($data['substance_abuse'] ?? 0),
            'violence_risk'     => (int) ($data['violence_risk'] ?? 0),
            'crisis_indicators' => (int) ($data['crisis_indicators'] ?? 0),
            'overall_risk'      => $data['overall_risk'] ?? 'low',
            'payload'           => $data,
        ]);

        return response()->json(['success' => true, 'assessment' => $assessment], 201);
    }

    /** Aggregated clinical dashboard for the logged-in clinician. */
    public function clinicalDashboard(Request $request)
    {
        $assessorId = auth('api')->id();
        $base = \App\Models\ClientRiskAssessment::where('assessor_id', $assessorId);

        $byRisk = (clone $base)->selectRaw('overall_risk, COUNT(*) as n')->groupBy('overall_risk')->pluck('n', 'overall_risk');

        $recent = (clone $base)->orderByDesc('created_at')->limit(20)->get()->map(fn($a) => [
            'id'                => $a->id,
            'client_name'       => $a->client_name ?? 'Anonymous client',
            'overall_risk'      => $a->overall_risk,
            'suicidal_ideation' => $a->suicidal_ideation,
            'self_harm'         => $a->self_harm,
            'substance_abuse'   => $a->substance_abuse,
            'violence_risk'     => $a->violence_risk,
            'crisis_indicators' => $a->crisis_indicators,
            'created_at'        => $a->created_at,
        ]);

        return response()->json([
            'total_clients'      => (int) (clone $base)->distinct('client_name')->count('client_name'),
            'critical_risk'      => (int) ($byRisk['critical'] ?? 0),
            'high_risk'          => (int) ($byRisk['high'] ?? 0),
            'moderate_risk'      => (int) ($byRisk['moderate'] ?? 0),
            'recent_assessments' => $recent,
        ]);
    }
}
