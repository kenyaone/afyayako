<?php

namespace App\Http\Controllers;

use App\Models\FollowUpSurvey;
use Illuminate\Http\Request;

class SurveyController extends Controller
{
    // Return the oldest pending (due, not completed) follow-up survey for this user
    public function pending()
    {
        $user = auth('api')->user();

        $survey = FollowUpSurvey::with('consultation:id,consultation_id,scheduled_at,professional_id')
            ->where('user_id', $user->id)
            ->whereNull('completed_at')
            ->where('due_at', '<=', now())
            ->orderBy('due_at')
            ->first();

        if (!$survey) {
            return response()->json(['survey' => null]);
        }

        return response()->json(['survey' => $survey]);
    }

    // Patient submits a follow-up survey response
    public function store(Request $request, int $surveyId)
    {
        $user   = auth('api')->user();
        $survey = FollowUpSurvey::where('id', $surveyId)
            ->where('user_id', $user->id)
            ->whereNull('completed_at')
            ->first();

        if (!$survey) {
            return response()->json(['error' => 'Survey not found.'], 404);
        }

        $request->validate([
            'responses'       => 'required|array',
            'wellbeing_score' => 'required|integer|min:0|max:10',
        ]);

        $survey->update([
            'responses'       => $request->responses,
            'wellbeing_score' => $request->wellbeing_score,
            'completed_at'    => now(),
        ]);

        return response()->json(['message' => 'Survey completed. Thank you.']);
    }
}
