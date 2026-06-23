<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use App\Models\Assessment;
use Illuminate\Http\Request;

// ICD-10 codes by assessment type
const ICD10_MAP = [
    'phq9'   => ['code' => 'F32.9',  'description' => 'Depressive episode, unspecified'],
    'gad7'   => ['code' => 'F41.1',  'description' => 'Generalized anxiety disorder'],
    'audit'  => ['code' => 'F10.10', 'description' => 'Alcohol use disorder, uncomplicated'],
    'dast10' => ['code' => 'F19.10', 'description' => 'Other psychoactive substance use disorder'],
    'pgsi'   => ['code' => 'F63.0',  'description' => 'Pathological gambling'],
    'default'=> ['code' => 'Z04.6',  'description' => 'Mental health consultation'],
];

class ClinicalReceiptController extends Controller
{
    public function generate(Request $request, string $consultationId)
    {
        $user = auth('api')->user();

        $consultation = Consultation::with(['professional.user', 'user'])
            ->where('consultation_id', $consultationId)
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereHas('professional', fn($q2) => $q2->where('user_id', $user->id));
            })
            ->firstOrFail();

        if (!in_array($consultation->status, ['confirmed', 'completed', 'in_progress'])) {
            return response()->json(['error' => 'Receipt only available for confirmed or completed sessions'], 422);
        }

        // Get user's latest assessment for ICD-10 code
        $assessment = Assessment::where('user_id', $consultation->user_id)
            ->orderByDesc('created_at')
            ->first();

        $icd = ICD10_MAP[$assessment?->type ?? 'default'] ?? ICD10_MAP['default'];
        $pro  = $consultation->professional;
        $patient = $consultation->user;

        $data = [
            'receipt_number'    => 'RCT-' . strtoupper(substr($consultation->consultation_id, 0, 8)),
            'consultation_id'   => $consultation->consultation_id,
            'issue_date'        => now()->setTimezone('Africa/Nairobi')->format('d M Y'),
            'session_date'      => \Carbon\Carbon::parse($consultation->scheduled_at)
                                    ->setTimezone('Africa/Nairobi')
                                    ->format('d M Y, h:i A'),
            'duration_minutes'  => $consultation->duration_minutes,
            'amount_kes'        => number_format($consultation->amount, 2),
            'patient_name'      => $patient->display_name ?? $patient->username,
            'therapist_name'    => $pro->full_name ?? 'Therapist',
            'kmpdc_license'     => $pro->kmpdc_license ?? 'N/A',
            'years_experience'  => $pro->years_experience ?? 0,
            'icd10_code'        => $icd['code'],
            'icd10_description' => $icd['description'],
            'service_type'      => 'Outpatient Mental Health Consultation (Telehealth)',
            'platform'          => 'Afya Yako Siri Yako',
            'platform_url'      => 'mhapke.com',
        ];

        return response()->json(['receipt' => $data]);
    }
}
