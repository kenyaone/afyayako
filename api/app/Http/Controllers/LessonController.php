<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use App\Models\Lesson;
use App\Models\LessonProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LessonController extends Controller
{
    private function hasLessonAccess(): bool
    {
        $user = auth('api')->user();
        if (in_array($user->role, ['professional', 'admin'])) {
            return true;
        }
        return Consultation::where('user_id', $user->id)
            ->whereIn('status', ['confirmed', 'in_progress', 'completed'])
            ->exists();
    }

    public function index(Request $request)
    {
        if (!$this->hasLessonAccess()) {
            return response()->json([
                'error'   => 'lessons_locked',
                'message' => 'Lessons are unlocked after your first paid session.',
            ], 403);
        }

        $query = Lesson::where('is_published', true);

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('language')) {
            $query->where('language', $request->language);
        }

        if ($request->filled('level')) {
            $query->where('level', $request->level);
        }

        $lessons = $query->orderBy('order')->orderBy('id')->paginate(20);

        // Attach user progress
        $userId = auth('api')->id();
        $lessons->getCollection()->transform(function ($lesson) use ($userId) {
            $lesson->user_progress = LessonProgress::where('user_id', $userId)
                ->where('lesson_id', $lesson->id)
                ->first();
            return $lesson;
        });

        return response()->json($lessons);
    }

    public function show($slug)
    {
        if (!$this->hasLessonAccess()) {
            return response()->json([
                'error'   => 'lessons_locked',
                'message' => 'Lessons are unlocked after your first paid session.',
            ], 403);
        }

        $lesson = Lesson::where('slug', $slug)->where('is_published', true)->first();

        if (!$lesson) {
            return response()->json(['error' => 'Lesson not found'], 404);
        }

        $userId = auth('api')->id();
        $lesson->user_progress = LessonProgress::where('user_id', $userId)
            ->where('lesson_id', $lesson->id)
            ->first();

        // Track start
        if (!$lesson->user_progress) {
            $lesson->user_progress = LessonProgress::create([
                'user_id'    => $userId,
                'lesson_id'  => $lesson->id,
                'started_at' => now(),
            ]);
        }

        return response()->json(['lesson' => $lesson]);
    }

    public function progress($id, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'progress_pct' => 'required|integer|between:0,100',
            'completed'    => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $userId = auth('api')->id();
        $lesson = Lesson::find($id);

        if (!$lesson) {
            return response()->json(['error' => 'Lesson not found'], 404);
        }

        $completed = $request->boolean('completed', false) || $request->progress_pct >= 100;

        $progress = LessonProgress::updateOrCreate(
            ['user_id' => $userId, 'lesson_id' => $id],
            [
                'progress_pct' => $request->progress_pct,
                'completed'    => $completed,
                'completed_at' => $completed ? now() : null,
            ]
        );

        return response()->json(['message' => 'Progress updated', 'progress' => $progress]);
    }
}
