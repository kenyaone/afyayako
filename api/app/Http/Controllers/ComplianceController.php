<?php

namespace App\Http\Controllers;

use App\Models\ComplianceReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ComplianceController extends Controller
{
    /** Patient/user files an incident or complaint. */
    public function reportIncident(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type'            => 'required|in:complaint,incident',
            'title'           => 'required|string|max:255',
            'description'     => 'nullable|string|max:5000',
            'severity'        => 'nullable|string|max:30',
            'professional_id' => 'nullable|integer',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $report = ComplianceReport::create([
            'user_id'         => auth('api')->id(),
            'type'            => $request->type,
            'title'           => $request->title,
            'description'     => $request->description,
            'severity'        => $request->severity ?: 'normal',
            'professional_id' => $request->professional_id,
            'status'          => 'filed',
        ]);

        return response()->json(['success' => true, 'report' => $report], 201);
    }

    public function myIncidents()
    {
        $incidents = ComplianceReport::where('user_id', auth('api')->id())
            ->where('type', 'incident')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['incidents' => $incidents]);
    }

    public function myComplaints()
    {
        $complaints = ComplianceReport::where('user_id', auth('api')->id())
            ->where('type', 'complaint')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['complaints' => $complaints]);
    }
}
