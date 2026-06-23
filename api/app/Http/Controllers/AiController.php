<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\MoodLog;
use App\Models\Professional;
use App\Models\SobrietyTracker;
use App\Services\AiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AiController extends Controller
{
    private AiService $ai;

    public function __construct(AiService $ai)
    {
        $this->ai = $ai;
    }

    // ─── Between-session chat ─────────────────────────────────────────────────

    public function chat(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'messages'          => 'required|array|min:1|max:20',
            'messages.*.role'   => 'required|in:user,assistant',
            'messages.*.content'=> 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $user = auth('api')->user();

        // Hard crisis check before calling AI
        $lastMsg = collect($request->messages)->where('role', 'user')->last();
        if ($lastMsg && $this->ai->isCrisis($lastMsg['content'] ?? '')) {
            return response()->json([
                'reply'       => $this->ai->getCrisisResponse(),
                'is_crisis'   => true,
                'end_session' => true,
            ]);
        }

        // Build user context from their stored data
        $userContext = $this->buildUserContext($user->id);

        // MoH Guideline 1: if the user's latest assessment is severe, the AI
        // companion must steer toward a human professional rather than act as
        // ongoing support.
        $requiresReferral = \App\Support\Severity::isSevere(
            $userContext['latest_assessment']['severity'] ?? null
        );

        $reply = $this->ai->chat($request->messages, $userContext, $requiresReferral);

        return response()->json([
            'reply'                  => $reply,
            'is_crisis'              => false,
            'requires_human_referral'=> $requiresReferral,
        ]);
    }

    // ─── Assessment AI insight ────────────────────────────────────────────────

    public function assessmentInsight(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'assessment_type' => 'required|in:phq9,gad7,audit,pgsi,ftnd',
            'score'           => 'required|integer',
            'severity'        => 'required|string',
            'interpretation'  => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $user = auth('api')->user();

        // Get prior scores for trend analysis
        $priorScores = Assessment::where('user_id', $user->id)
            ->where('assessment_type', $request->assessment_type)
            ->orderByDesc('created_at')
            ->take(5)
            ->pluck('score')
            ->reverse()
            ->values()
            ->toArray();

        $requiresReferral = \App\Support\Severity::isSevere($request->severity);

        $insight = $this->ai->interpretAssessment(
            $request->assessment_type,
            $request->score,
            $request->severity,
            $request->interpretation,
            $priorScores,
            $requiresReferral
        );

        // MoH Guideline 1: severe presentations are routed to a human specialist,
        // not handled by AI. We enforce this in the response, independent of the
        // model's text.
        $response = [
            'insight'                => $insight,
            'requires_human_referral'=> $requiresReferral,
        ];
        if ($requiresReferral) {
            $response['referral'] = [
                'message'   => 'Your result suggests you would benefit from speaking with a qualified mental health professional. AI support is not a substitute for specialist care.',
                'action'    => 'find_therapist',
                'hotlines'  => \App\Support\Hotlines::safetyPlanDefaults(),
            ];
        }

        return response()->json($response);
    }

    // ─── Professional match explanation ──────────────────────────────────────

    public function matchExplain(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'professional_id'  => 'required|integer|exists:professionals,id',
            'assessment_type'  => 'required|in:phq9,gad7,audit,pgsi,ftnd',
            'match_pct'        => 'required|integer',
            'match_reasons'    => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $pro = Professional::find($request->professional_id);
        if (!$pro) {
            return response()->json(['error' => 'Professional not found'], 404);
        }

        $specs = implode(', ', is_array($pro->specializations) ? $pro->specializations : []);

        $explanation = $this->ai->explainMatch(
            $pro->full_name ?? 'This professional',
            $specs,
            $request->match_pct,
            $request->assessment_type,
            $request->match_reasons
        );

        return response()->json([
            'professional_id' => $request->professional_id,
            'explanation'     => $explanation,
        ]);
    }

    // ─── Progress insight ─────────────────────────────────────────────────────

    public function progressInsight()
    {
        $user = auth('api')->user();

        $assessments = Assessment::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->take(10)
            ->get(['assessment_type', 'score', 'severity', 'created_at'])
            ->map(fn($a) => [
                'assessment_type' => $a->assessment_type,
                'score'           => $a->score,
                'severity'        => $a->severity,
                'date'            => $a->created_at->format('M d'),
            ])
            ->toArray();

        $avgMood = MoodLog::where('user_id', $user->id)
            ->where('created_at', '>=', now()->subDays(7))
            ->avg('mood_score') ?? 0;

        $sobriety = SobrietyTracker::where('user_id', $user->id)
            ->where('is_active', true)
            ->first();
        $sobrietyDays = $sobriety
            ? now()->diffInDays($sobriety->start_date)
            : 0;

        $insight = $this->ai->progressInsight($assessments, round($avgMood, 1), $sobrietyDays);

        return response()->json(['insight' => $insight]);
    }

    // ─── SOAP notes (professionals only) ─────────────────────────────────────

    public function soapNotes(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'notes'   => 'required|string|min:10|max:2000',
            'context' => 'sometimes|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $user = auth('api')->user();
        if ($user->role !== 'professional' && $user->role !== 'admin') {
            return response()->json(['error' => 'Professional access required'], 403);
        }

        $soap = $this->ai->generateSoapNotes($request->notes, $request->context ?? '');

        return response()->json(['soap_notes' => $soap]);
    }

    // ─── User context builder ─────────────────────────────────────────────────

    private function buildUserContext(int $userId): array
    {
        $context = [];

        $latest = Assessment::where('user_id', $userId)
            ->latest()->first(['assessment_type', 'score', 'severity']);

        if ($latest) {
            $context['latest_assessment'] = [
                'type'     => strtoupper($latest->assessment_type),
                'score'    => $latest->score,
                'severity' => $latest->severity,
            ];
        }

        $avgMood = MoodLog::where('user_id', $userId)
            ->where('created_at', '>=', now()->subDays(7))
            ->avg('mood_score');

        if ($avgMood) {
            $context['avg_mood'] = round($avgMood, 1);
        }

        $sobriety = SobrietyTracker::where('user_id', $userId)
            ->where('is_active', true)->first();
        if ($sobriety) {
            $context['sobriety_days'] = now()->diffInDays($sobriety->start_date);
        }

        return $context;
    }
}
