<?php
namespace App\Http\Controllers;

use App\Models\RecoveryGoal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class GoalController extends Controller
{
    public function index()
    {
        $user = auth('api')->user();
        $goals = RecoveryGoal::where('user_id', $user->id)
            ->with('professional.user:id,display_name')
            ->orderByRaw("FIELD(status,'active','paused','completed','abandoned')")
            ->orderByDesc('created_at')
            ->get();
        return response()->json(['goals' => $goals]);
    }

    public function store(Request $request)
    {
        $v = Validator::make($request->all(), [
            'title'       => 'required|string|max:200',
            'description' => 'nullable|string',
            'category'    => 'in:sobriety,mental_health,relationships,work,physical,other',
            'target_date' => 'nullable|date|after:today',
            'milestones'  => 'nullable|array',
        ]);
        if ($v->fails()) return response()->json(['error' => $v->errors()->first()], 422);

        $user = auth('api')->user();
        $goal = RecoveryGoal::create([
            'user_id'       => $user->id,
            'professional_id'=> $request->professional_id,
            'title'         => $request->title,
            'description'   => $request->description,
            'category'      => $request->category ?? 'mental_health',
            'target_date'   => $request->target_date,
            'status'        => 'active',
            'progress'      => 0,
            'milestones'    => $request->milestones ?? [],
            'notes'         => $request->notes,
        ]);
        return response()->json(['message' => 'Goal created.', 'goal' => $goal], 201);
    }

    public function update(Request $request, int $id)
    {
        $user = auth('api')->user();
        $goal = RecoveryGoal::where('id', $id)
            ->where(function($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereHas('professional', fn($q2) => $q2->where('user_id', $user->id));
            })->firstOrFail();

        $goal->update($request->only([
            'title','description','category','target_date',
            'status','progress','milestones','notes'
        ]));
        return response()->json(['message' => 'Goal updated.', 'goal' => $goal]);
    }

    public function destroy(int $id)
    {
        $user = auth('api')->user();
        RecoveryGoal::where('id', $id)->where('user_id', $user->id)->firstOrFail()->delete();
        return response()->json(['message' => 'Goal deleted.']);
    }

    // Professional view of patient goals
    public function patientGoals(int $patientId)
    {
        $pro = auth('api')->user()->professional;
        if (!$pro) return response()->json(['error' => 'Not a professional'], 403);

        $hasConsult = \App\Models\Consultation::where('professional_id', $pro->id)
            ->where('user_id', $patientId)->exists();
        if (!$hasConsult) return response()->json(['error' => 'No consultation relationship'], 403);

        $goals = RecoveryGoal::where('user_id', $patientId)->get();
        return response()->json(['goals' => $goals]);
    }

    // Professional updates progress on a patient goal
    public function updateProgress(Request $request, int $id)
    {
        $pro = auth('api')->user()->professional;
        if (!$pro) return response()->json(['error' => 'Not a professional'], 403);

        $goal = RecoveryGoal::where('id', $id)->where('professional_id', $pro->id)->firstOrFail();
        $goal->update([
            'progress' => min(100, max(0, (int) $request->progress)),
            'status'   => $request->status ?? $goal->status,
            'notes'    => $request->notes ?? $goal->notes,
        ]);
        return response()->json(['message' => 'Progress updated.', 'goal' => $goal]);
    }
}
