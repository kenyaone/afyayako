<?php

namespace App\Http\Controllers;

use App\Models\BurnoutAssessment;
use App\Models\Payment;
use App\Services\BurnoutService;
use App\Services\MpesaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class BurnoutController extends Controller
{
    private BurnoutService $burnoutService;
    private MpesaService $mpesaService;

    public function __construct(BurnoutService $burnoutService, MpesaService $mpesaService)
    {
        $this->burnoutService = $burnoutService;
        $this->mpesaService = $mpesaService;
    }

    public function questions()
    {
        $questions = [
            'q1' => 'I am able to accomplish goals I set for myself in this job.',
            'q2' => 'I am happy in my work.',
            'q3' => 'I find it helpful to talk with other colleagues about the pain I hear in my work.',
            'q4' => 'I find my work emotionally draining.',
            'q5' => 'I believe I can make a difference through my work.',
            'q6' => 'I feel overwhelmed because my work load seems endless.',
            'q7' => 'I feel hopeful about the future.',
            'q8' => 'Working with people who have experienced trauma is rewarding.',
            'q9' => 'I feel exhausted from my work.',
            'q10' => 'Because of my work, I have beliefs about people that interfere with my ability to help.',
            'q11' => 'I am confident in my ability to work with other clinicians.',
            'q12' => 'I feel as though caring for traumatized people is emotionally draining.',
            'q13' => 'I feel trapped in my job.',
            'q14' => 'I often feel energized after working with the people I serve.',
            'q15' => 'I think I am a caring person.',
            'q16' => 'I am burned out from my work.',
            'q17' => 'I find it difficult to match my expectations of helping the people in my work with the reality of my limited resources and support.',
            'q18' => 'I experience nightmares or intrusive thoughts about my work.',
            'q19' => 'I am satisfied with how I am able to help the people who come to me.',
            'q20' => 'I experience intrusive thoughts about interactions I have had with clients.',
            'q21' => 'I am losing sleep over work-related stress.',
            'q22' => 'I am not as productive at work as I used to be.',
            'q23' => 'I feel called to do this work.',
            'q24' => 'I want to help people, but I feel discouraged.',
            'q25' => 'I feel as though I work with people in crisis all the time.',
            'q26' => 'My work is meaningful and makes a difference.',
            'q27' => 'I cannot recall things I have learned about helping in my professional development activities.',
            'q28' => 'I fear I may harm someone in my care.',
            'q29' => 'I feel good about my ability to help my clients.',
            'q30' => 'I avoid certain activities or situations because they remind me of frightening experiences of the people I help.',
        ];

        return response()->json([
            'assessment_type' => 'proquol5',
            'title' => 'ProQOL-5: Professional Quality of Life Scale',
            'description' => 'A validated assessment tool to measure compassion satisfaction, burnout, and secondary traumatic stress in healthcare professionals.',
            'total_questions' => 30,
            'scale' => 'Never (0), Rarely (1), Sometimes (2), Often (3), Very Often (4)',
            'estimated_time' => '10 minutes',
            'price_kes' => 500,
            'questions' => $questions,
        ]);
    }

    public function initiatePayment(Request $request)
    {
        $request->validate([
            'phone' => 'required|regex:/^254\d{9}$/',
        ]);

        try {
            $response = $this->mpesaService->stkPush(
                $request->phone,
                config('services.burnout_fee', 500),
                'Burnout Assessment',
                'BURNOUT'
            );

            return response()->json([
                'success' => true,
                'message' => 'M-Pesa prompt sent. Enter PIN to authorize.',
                'checkout_id' => $response['CheckoutRequestID'] ?? null,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment initiation failed: ' . $e->getMessage(),
            ], 400);
        }
    }

    public function assess(Request $request)
    {
        $request->validate([
            'responses' => 'required|array|size:30',
            'assessor_type' => 'required|string|in:counsellor,psychologist,nurse,social_worker,doctor',
            'specialization' => 'nullable|string',
            'years_experience' => 'nullable|integer|min:0',
            'age' => 'nullable|integer|min:18|max:100',
            'gender' => 'nullable|string|in:male,female,other',
            'caseload_size' => 'nullable|integer|min:0',
            'payment_id' => 'required|exists:payments,id',
        ]);

        $payment = Payment::findOrFail($request->payment_id);

        if ($payment->status !== 'completed' || $payment->payment_type !== 'burnout_assessment') {
            return response()->json([
                'success' => false,
                'message' => 'Payment not completed or invalid payment type.',
            ], 422);
        }

        $csScore = $this->calculateCompassionSatisfaction($request->responses);
        $boScore = $this->calculateBurnout($request->responses);
        $stsScore = $this->calculateSecondaryTraumaticStress($request->responses);

        $zones = $this->burnoutService->calculateZones($csScore, $boScore, $stsScore);

        $assessment = BurnoutAssessment::create([
            'assessor_id' => Auth::id(),
            'assessor_type' => $request->assessor_type,
            'specialization' => $request->specialization,
            'years_experience' => $request->years_experience,
            'age' => $request->age,
            'gender' => $request->gender,
            'caseload_size' => $request->caseload_size,
            'responses' => $request->responses,
            'cs_score' => $csScore,
            'bo_score' => $boScore,
            'sts_score' => $stsScore,
            'cs_zone' => $zones['cs_zone'],
            'bo_zone' => $zones['bo_zone'],
            'sts_zone' => $zones['sts_zone'],
            'overall_zone' => $zones['overall_zone'],
            'payment_id' => $payment->id,
            'paid_at' => now(),
        ]);

        $aiReport = $this->burnoutService->generateReport($assessment);
        $assessment->update(['ai_report' => $aiReport]);

        return response()->json([
            'success' => true,
            'assessment_id' => $assessment->id,
            'cs_score' => $csScore,
            'bo_score' => $boScore,
            'sts_score' => $stsScore,
            'overall_zone' => $zones['overall_zone'],
            'report' => $aiReport,
        ]);
    }

    public function sendReport(Request $request, $id)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $assessment = BurnoutAssessment::findOrFail($id);

        if (Auth::id() !== $assessment->assessor_id && !Auth::user()->can('admin')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        try {
            Mail::send('emails.burnout_report', ['assessment' => $assessment], function ($m) use ($request, $assessment) {
                $m->to($request->email)
                    ->subject("Your Confidential Burnout Assessment Report — Afya Yako Siri Yako");
            });

            $assessment->update([
                'report_sent_to' => $request->email,
                'report_sent_at' => now(),
            ]);

            return response()->json(['success' => true, 'message' => 'Report sent successfully.']);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send report: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function myReports()
    {
        $reports = BurnoutAssessment::where('assessor_id', Auth::id())
            ->select('id', 'assessor_type', 'overall_zone', 'cs_score', 'bo_score', 'sts_score', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'reports' => $reports]);
    }

    /** View a single burnout report (owner only). */
    public function report($id)
    {
        $r = BurnoutAssessment::where('assessor_id', Auth::id())->find($id);
        if (!$r) {
            return response()->json(['error' => 'Report not found'], 404);
        }

        return response()->json([
            'id'         => $r->id,
            'zone'       => $r->overall_zone,
            'cs_score'   => $r->cs_score,
            'bo_score'   => $r->bo_score,
            'sts_score'  => $r->sts_score,
            'cs_zone'    => $r->cs_zone,
            'bo_zone'    => $r->bo_zone,
            'sts_zone'   => $r->sts_zone,
            'ai_report'  => $r->ai_report,
            'created_at' => $r->created_at,
        ]);
    }

    /** Download a burnout report as a printable HTML document (no PDF lib installed). */
    public function reportPdf($id)
    {
        $r = BurnoutAssessment::where('assessor_id', Auth::id())->find($id);
        if (!$r) {
            return response()->json(['error' => 'Report not found'], 404);
        }

        $esc = fn($v) => htmlspecialchars((string) $v, ENT_QUOTES);
        $aiHtml = nl2br($esc($r->ai_report ?? 'No AI summary available.'));
        $created = $r->created_at ? $r->created_at->format('d M Y') : '';
        $html = <<<HTML
<!doctype html><html><head><meta charset="utf-8"><title>Burnout Report #{$r->id}</title>
<style>body{font-family:Arial,sans-serif;max-width:760px;margin:30px auto;color:#222;line-height:1.5}
h1{color:#1a7f6b}.zone{font-size:18px;font-weight:bold}.scores{margin:16px 0}
.scores td{padding:6px 18px 6px 0}.ai{margin-top:20px;padding:16px;background:#f6f8f7;border-radius:8px}</style></head>
<body>
<h1>Professional Wellbeing (ProQOL) Report</h1>
<p>Report #{$r->id} · Generated {$created}</p>
<p class="zone">Overall zone: {$esc($r->overall_zone)}</p>
<table class="scores">
<tr><td>Compassion Satisfaction</td><td>{$esc($r->cs_score)} ({$esc($r->cs_zone)})</td></tr>
<tr><td>Burnout</td><td>{$esc($r->bo_score)} ({$esc($r->bo_zone)})</td></tr>
<tr><td>Secondary Traumatic Stress</td><td>{$esc($r->sts_score)} ({$esc($r->sts_zone)})</td></tr>
</table>
<div class="ai"><strong>Summary &amp; recommendations</strong><br>{$aiHtml}</div>
</body></html>
HTML;

        return response($html, 200, [
            'Content-Type'        => 'text/html; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="Burnout-Report-' . $r->id . '.pdf"',
        ]);
    }

    public function allReports()
    {
        $this->authorize('admin');

        $reports = BurnoutAssessment::with('assessor:id,username,display_name')
            ->select('id', 'assessor_id', 'assessor_type', 'overall_zone', 'cs_score', 'bo_score', 'sts_score', 'created_at')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json(['success' => true, 'reports' => $reports]);
    }

    private function calculateCompassionSatisfaction(array $responses): int
    {
        $csItems = [1, 3, 5, 7, 8, 11, 14, 15, 19, 23, 26, 29];
        $score = 0;
        foreach ($csItems as $item) {
            $score += (int) ($responses["q{$item}"] ?? 0);
        }
        return $score;
    }

    private function calculateBurnout(array $responses): int
    {
        $boItems = [2, 4, 6, 9, 10, 13, 16, 17, 21, 22, 24, 27];
        $score = 0;
        foreach ($boItems as $item) {
            $key = "q{$item}";
            $value = (int) ($responses[$key] ?? 0);
            $score += (4 - $value);
        }
        return $score;
    }

    private function calculateSecondaryTraumaticStress(array $responses): int
    {
        $stsItems = [3, 12, 18, 20, 25, 28, 30];
        $score = 0;
        foreach ($stsItems as $item) {
            $key = "q{$item}";
            $value = (int) ($responses[$key] ?? 0);
            $score += (4 - $value);
        }
        return $score;
    }
}
