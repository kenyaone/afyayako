<?php
namespace App\Http\Controllers;

use App\Models\Medication;
use App\Models\MedicationLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MedicationController extends Controller
{
    public function index()
    {
        $user = auth('api')->user();
        $meds = Medication::where('user_id', $user->id)
            ->orderByDesc('is_active')->orderByDesc('created_at')->get();
        return response()->json(['medications' => $meds]);
    }

    public function store(Request $request)
    {
        $v = Validator::make($request->all(), [
            'name'       => 'required|string|max:100',
            'dosage'     => 'nullable|string|max:50',
            'frequency'  => 'nullable|string|max:100',
            'start_date' => 'nullable|date',
        ]);
        if ($v->fails()) return response()->json(['error' => $v->errors()->first()], 422);

        $med = Medication::create(array_merge(
            $request->only(['name','dosage','frequency','start_date','end_date','notes']),
            ['user_id' => auth('api')->id(), 'is_active' => true]
        ));
        return response()->json(['message' => 'Medication added.', 'medication' => $med], 201);
    }

    public function update(Request $request, int $id)
    {
        $med = Medication::where('id', $id)->where('user_id', auth('api')->id())->firstOrFail();
        $med->update($request->only(['name','dosage','frequency','start_date','end_date','is_active','notes']));
        return response()->json(['message' => 'Updated.', 'medication' => $med]);
    }

    public function log(Request $request, int $id)
    {
        $med = Medication::where('id', $id)->where('user_id', auth('api')->id())->firstOrFail();
        $log = MedicationLog::create([
            'medication_id' => $med->id,
            'user_id'       => auth('api')->id(),
            'taken'         => $request->boolean('taken', true),
            'side_effects'  => $request->side_effects,
            'mood_after'    => $request->mood_after,
            'logged_at'     => now(),
        ]);
        return response()->json(['message' => 'Dose logged.', 'log' => $log], 201);
    }

    public function logs(int $id)
    {
        $med = Medication::where('id', $id)->where('user_id', auth('api')->id())->firstOrFail();
        $logs = MedicationLog::where('medication_id', $id)->orderByDesc('logged_at')->limit(30)->get();
        return response()->json(['logs' => $logs]);
    }
}
