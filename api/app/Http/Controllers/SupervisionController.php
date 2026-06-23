<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Professional;
use App\Models\Supervision;
use App\Models\SupervisionSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Supervision of practitioners (MoH Guideline 9).
 */
class SupervisionController extends Controller
{
    // ─── Admin: assign / list / end ───────────────────────────────────────────

    public function adminAssign(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'supervisor_id' => 'required|integer|exists:professionals,id',
            'supervisee_id' => 'required|integer|exists:professionals,id|different:supervisor_id',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        // The supervisor must be an admin-designated eligible supervisor.
        $supervisor = Professional::find($request->supervisor_id);
        if (!$supervisor || !$supervisor->is_eligible_supervisor) {
            return response()->json(['error' => 'The chosen professional is not an eligible supervisor. Mark them eligible first.'], 422);
        }

        $exists = Supervision::where('supervisor_id', $request->supervisor_id)
            ->where('supervisee_id', $request->supervisee_id)
            ->where('status', 'active')
            ->exists();
        if ($exists) {
            return response()->json(['error' => 'This supervision relationship is already active.'], 422);
        }

        $supervision = Supervision::create([
            'supervisor_id' => $request->supervisor_id,
            'supervisee_id' => $request->supervisee_id,
            'assigned_by'   => auth('api')->id(),
            'status'        => 'active',
        ]);

        // Notify both professionals.
        foreach ([$supervision->supervisor, $supervision->supervisee] as $pro) {
            if ($pro?->user_id) {
                Notification::send($pro->user_id, 'supervision', 'Supervision assigned',
                    'A supervision relationship has been set up for you.', ['supervision_id' => $supervision->id]);
            }
        }

        return response()->json(['message' => 'Supervision assigned.', 'supervision' => $supervision], 201);
    }

    public function adminList()
    {
        $list = Supervision::with([
            'supervisor.user:id,display_name',
            'supervisee.user:id,display_name',
        ])->orderByDesc('created_at')->paginate(50);

        return response()->json($list);
    }

    public function end($id)
    {
        $supervision = Supervision::findOrFail($id);
        $supervision->update(['status' => 'ended', 'ended_at' => now()]);
        return response()->json(['message' => 'Supervision ended.', 'supervision' => $supervision]);
    }

    // ─── Professional views ───────────────────────────────────────────────────

    public function mySupervisees()
    {
        $pro = auth('api')->user()->professional;
        if (!$pro) return response()->json(['error' => 'Not a professional'], 403);

        $list = Supervision::with(['supervisee.user:id,display_name', 'sessions'])
            ->where('supervisor_id', $pro->id)
            ->where('status', 'active')
            ->get();

        return response()->json(['supervisees' => $list]);
    }

    public function mySupervisors()
    {
        $pro = auth('api')->user()->professional;
        if (!$pro) return response()->json(['error' => 'Not a professional'], 403);

        $list = Supervision::with(['supervisor.user:id,display_name'])
            ->where('supervisee_id', $pro->id)
            ->where('status', 'active')
            ->get();

        return response()->json(['supervisors' => $list]);
    }

    // ─── Supervision session logging ──────────────────────────────────────────

    public function logSession(Request $request, $supervisionId)
    {
        $pro = auth('api')->user()->professional;
        if (!$pro) return response()->json(['error' => 'Not a professional'], 403);

        $validator = Validator::make($request->all(), [
            'session_date'     => 'required|date',
            'duration_minutes' => 'sometimes|integer|min:1|max:600',
            'notes'            => 'required|string|max:5000',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        // Only the supervisor on an active supervision may log a session.
        $supervision = Supervision::where('id', $supervisionId)
            ->where('supervisor_id', $pro->id)
            ->where('status', 'active')
            ->first();
        if (!$supervision) {
            return response()->json(['error' => 'Supervision not found or you are not the supervisor.'], 403);
        }

        $session = SupervisionSession::create([
            'supervision_id'   => $supervision->id,
            'session_date'     => $request->session_date,
            'duration_minutes' => $request->duration_minutes ?? 60,
            'notes'            => $request->notes,
            'created_by'       => auth('api')->id(),
        ]);

        return response()->json(['message' => 'Supervision session logged.', 'session' => $session], 201);
    }

    public function sessions($supervisionId)
    {
        $pro = auth('api')->user()->professional;
        if (!$pro) return response()->json(['error' => 'Not a professional'], 403);

        $supervision = Supervision::where('id', $supervisionId)
            ->where(function ($q) use ($pro) {
                $q->where('supervisor_id', $pro->id)->orWhere('supervisee_id', $pro->id);
            })->first();
        if (!$supervision) {
            return response()->json(['error' => 'Supervision not found.'], 404);
        }

        return response()->json([
            'sessions' => $supervision->sessions()->orderByDesc('session_date')->get(),
        ]);
    }
}
