<?php

namespace App\Http\Controllers;

use App\Models\CravingLog;
use App\Models\CrisisEvent;
use App\Models\MoodLog;
use App\Models\SobrietyTracker;
use App\Services\CrisisDetector;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PHRController extends Controller
{
    // ---- MOOD ----

    public function moodIndex()
    {
        $user = auth('api')->user();
        $logs = MoodLog::where('user_id', $user->id)
            ->orderByDesc('logged_at')
            ->paginate(30);

        return response()->json($logs);
    }

    public function moodStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'mood'            => 'required|in:excellent,good,neutral,sad,terrible',
            'mood_score'      => 'required|integer|between:1,10',
            'energy_level'    => 'required|integer|between:1,10',
            'sleep_quality'   => 'required|integer|between:1,10',
            'triggers'        => 'sometimes|nullable|string',
            'coping_strategy' => 'sometimes|nullable|string',
            'notes'           => 'sometimes|nullable|string',
            'logged_at'       => 'sometimes|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $user = auth('api')->user();
        $crisisDetector = new CrisisDetector();

        $log = MoodLog::create([
            'user_id'         => $user->id,
            'mood'            => $request->mood,
            'mood_score'      => $request->mood_score,
            'energy_level'    => $request->energy_level,
            'sleep_quality'   => $request->sleep_quality,
            'triggers'        => $request->triggers,
            'coping_strategy' => $request->coping_strategy,
            'notes'           => $request->notes,
            'logged_at'       => $request->logged_at ?? now(),
        ]);

        // Crisis check on notes/triggers
        $textToCheck = implode(' ', array_filter([
            $request->triggers ?? '',
            $request->notes ?? '',
        ]));

        $isCrisis = $crisisDetector->checkText($textToCheck);
        if ($isCrisis) {
            $keywords = $crisisDetector->getDetectedKeywords($textToCheck);
            $severity = $crisisDetector->detectSeverity(true, 'mood_log');

            CrisisEvent::create([
                'user_id'           => $user->id,
                'trigger_source'    => 'mood_log',
                'content'           => $textToCheck,
                'severity'          => $severity,
                'keywords_detected' => $keywords,
                'response_action'   => 'Hotlines provided',
                'resolved'          => false,
            ]);
        }

        return response()->json([
            'log'    => $log,
            'crisis' => $isCrisis,
        ], 201);
    }

    public function moodStats()
    {
        $user = auth('api')->user();

        $stats7 = MoodLog::where('user_id', $user->id)
            ->where('logged_at', '>=', now()->subDays(7))
            ->selectRaw('AVG(mood_score) as avg_mood, AVG(energy_level) as avg_energy, AVG(sleep_quality) as avg_sleep, COUNT(*) as entries')
            ->first();

        $stats30 = MoodLog::where('user_id', $user->id)
            ->where('logged_at', '>=', now()->subDays(30))
            ->selectRaw('AVG(mood_score) as avg_mood, AVG(energy_level) as avg_energy, AVG(sleep_quality) as avg_sleep, COUNT(*) as entries')
            ->first();

        $trend = MoodLog::where('user_id', $user->id)
            ->where('logged_at', '>=', now()->subDays(7))
            ->orderBy('logged_at')
            ->get(['logged_at', 'mood', 'mood_score']);

        return response()->json([
            'last_7_days'  => $stats7,
            'last_30_days' => $stats30,
            'trend'        => $trend,
        ]);
    }

    // ---- CRAVINGS ----

    public function cravingIndex()
    {
        $user = auth('api')->user();
        $logs = CravingLog::where('user_id', $user->id)
            ->orderByDesc('logged_at')
            ->paginate(30);

        return response()->json($logs);
    }

    public function cravingStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'substance'        => 'required|in:alcohol,gambling,tobacco,cannabis,miraa,other',
            'intensity'        => 'required|integer|between:1,10',
            'duration_minutes' => 'sometimes|nullable|integer|min:0',
            'trigger'          => 'sometimes|nullable|string',
            'coping_strategy'  => 'sometimes|nullable|string',
            'resisted'         => 'sometimes|boolean',
            'notes'            => 'sometimes|nullable|string',
            'logged_at'        => 'sometimes|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $user = auth('api')->user();
        $crisisDetector = new CrisisDetector();

        $log = CravingLog::create([
            'user_id'          => $user->id,
            'substance'        => $request->substance,
            'intensity'        => $request->intensity,
            'duration_minutes' => $request->duration_minutes,
            'trigger'          => $request->trigger,
            'coping_strategy'  => $request->coping_strategy,
            'resisted'         => $request->boolean('resisted', true),
            'notes'            => $request->notes,
            'logged_at'        => $request->logged_at ?? now(),
        ]);

        $textToCheck = implode(' ', array_filter([
            $request->trigger ?? '',
            $request->notes ?? '',
        ]));

        $isCrisis = $crisisDetector->checkText($textToCheck);
        if ($isCrisis) {
            $keywords = $crisisDetector->getDetectedKeywords($textToCheck);
            CrisisEvent::create([
                'user_id'           => $user->id,
                'trigger_source'    => 'craving_log',
                'content'           => $textToCheck,
                'severity'          => $crisisDetector->detectSeverity(true, 'craving_log'),
                'keywords_detected' => $keywords,
                'response_action'   => 'Hotlines provided',
                'resolved'          => false,
            ]);
        }

        return response()->json([
            'log'    => $log,
            'crisis' => $isCrisis,
        ], 201);
    }

    // ---- SOBRIETY ----

    public function sobrietyIndex()
    {
        $user = auth('api')->user();
        $trackers = SobrietyTracker::where('user_id', $user->id)->get();

        return response()->json(['trackers' => $trackers]);
    }

    public function sobrietyStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'substance'  => 'required|in:alcohol,gambling,tobacco,cannabis,miraa,other',
            'start_date' => 'required|date|before_or_equal:today',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $user = auth('api')->user();

        $tracker = SobrietyTracker::updateOrCreate(
            ['user_id' => $user->id, 'substance' => $request->substance],
            [
                'start_date'     => $request->start_date,
                'current_streak' => now()->diffInDays($request->start_date),
                'is_active'      => true,
            ]
        );

        if ($tracker->current_streak > $tracker->longest_streak) {
            $tracker->update(['longest_streak' => $tracker->current_streak]);
        }

        return response()->json(['tracker' => $tracker], 201);
    }

    public function sobrietyRefresh($id)
    {
        $user = auth('api')->user();
        $tracker = SobrietyTracker::where('id', $id)->where('user_id', $user->id)->first();
        if (!$tracker) return response()->json(['error' => 'Not found'], 404);

        $streak = max(0, now()->diffInDays($tracker->start_date));
        $tracker->update([
            'current_streak' => $streak,
            'longest_streak' => max($tracker->longest_streak, $streak),
        ]);
        return response()->json(['tracker' => $tracker->fresh()]);
    }

    public function sobrietyRelapse($id)
    {
        $user = auth('api')->user();
        $tracker = SobrietyTracker::where('id', $id)->where('user_id', $user->id)->first();

        if (!$tracker) {
            return response()->json(['error' => 'Tracker not found'], 404);
        }

        $tracker->increment('total_relapses');
        $tracker->update([
            'current_streak' => 0,
            'start_date'     => now()->toDateString(),
        ]);

        return response()->json([
            'message' => 'Relapse recorded. Starting streak from today.',
            'tracker' => $tracker->fresh(),
        ]);
    }
}
