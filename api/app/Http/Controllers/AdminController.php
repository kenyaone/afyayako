<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use App\Models\CrisisEvent;
use App\Models\GroupMessage;
use App\Models\Payment;
use App\Models\Professional;
use App\Models\SupportGroup;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    public function stats()
    {
        $totalUsers = User::where('role', 'user')->count();
        $totalProfessionals = Professional::where('status', 'verified')->count();
        $totalConsultations = Consultation::count();
        $totalRevenue = Payment::where('status', 'completed')->sum('amount');
        $crisisEvents = CrisisEvent::count();
        $unresolvedCrisis = CrisisEvent::where('resolved', false)->count();

        return response()->json([
            'total_users'          => $totalUsers,
            'total_professionals'  => $totalProfessionals,
            'total_consultations'  => $totalConsultations,
            'total_revenue_kes'    => (float) $totalRevenue,
            'crisis_events_total'  => $crisisEvents,
            'crisis_events_unresolved' => $unresolvedCrisis,
        ]);
    }

    // ─── Supervisor eligibility (MoH Guideline 9) ────────────────────────────

    public function setSupervisorEligibility(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'eligible' => 'required|boolean',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $pro = Professional::find($id);
        if (!$pro) {
            return response()->json(['error' => 'Professional not found'], 404);
        }
        if ($request->boolean('eligible') && $pro->status !== 'verified') {
            return response()->json(['error' => 'Only verified professionals can be made eligible supervisors.'], 422);
        }

        $pro->update(['is_eligible_supervisor' => $request->boolean('eligible')]);
        \App\Models\AuditLog::record('set_supervisor_eligibility', 'professional', $pro->id, ['eligible' => $request->boolean('eligible')]);

        return response()->json(['message' => 'Updated.', 'professional' => $pro->only(['id', 'is_eligible_supervisor'])]);
    }

    public function eligibleSupervisors()
    {
        $list = Professional::where('status', 'verified')
            ->where('is_eligible_supervisor', true)
            ->get()
            ->map(fn($p) => ['id' => $p->id, 'name' => $p->full_name ?? 'Professional', 'kmpdc_license' => $p->kmpdc_license]);

        return response()->json(['supervisors' => $list]);
    }

    // ─── Audit trail (MoH Guideline 4 — Data Management) ──────────────────────

    public function auditLogs(Request $request)
    {
        $query = \App\Models\AuditLog::orderByDesc('created_at');

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        return response()->json($query->paginate(50));
    }

    // ─── Crisis queue (MoH Guideline 7) ──────────────────────────────────────

    public function crisisEvents(Request $request)
    {
        $query = CrisisEvent::with('user:id,display_name,username,phone,email')
            ->orderByDesc('created_at');

        if ($request->input('status') === 'unresolved') {
            $query->where('resolved', false);
        } elseif ($request->input('status') === 'resolved') {
            $query->where('resolved', true);
        }

        return response()->json($query->paginate(30));
    }

    public function resolveCrisis(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'resolution_notes' => 'required|string|max:2000',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $event = CrisisEvent::find($id);
        if (!$event) {
            return response()->json(['error' => 'Crisis event not found'], 404);
        }

        $event->update([
            'resolved'         => true,
            'resolved_at'      => now(),
            'resolved_by'      => auth('api')->id(),
            'resolution_notes' => $request->resolution_notes,
        ]);

        return response()->json(['message' => 'Crisis event resolved.', 'event' => $event]);
    }

    public function professionals(Request $request)
    {
        $query = Professional::orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $professionals = $query->paginate(50);

        // The admin dashboard was written against an older user-linked model.
        // The current model stores applicant details flat on the row and keeps
        // specializations/languages as JSON arrays, so reshape to the expected form.
        $toObjects = function ($items) {
            $items = is_array($items) ? $items : [];
            $out = [];
            foreach (array_values($items) as $i => $v) {
                $out[] = is_array($v)
                    ? ['id' => $v['id'] ?? $i, 'name' => $v['name'] ?? '']
                    : ['id' => $i, 'name' => (string) $v];
            }
            return $out;
        };

        $professionals->getCollection()->transform(function ($p) use ($toObjects) {
            $arr = $p->toArray();
            $arr['user'] = [
                'display_name' => $p->full_name,
                'username'     => null,
                'email'        => $p->email,
                'phone'        => $p->phone,
            ];
            $arr['specializations'] = $toObjects($p->specializations);
            $arr['languages']       = $toObjects($p->languages);
            $arr['has_photo']       = (bool) $p->professional_photo_path;
            $arr['total_sessions']  = \App\Models\Consultation::where('professional_id', $p->id)
                ->where('status', 'completed')->count();
            $arr['rating']          = null;
            return $arr;
        });

        return response()->json($professionals);
    }

    /**
     * Stream a professional's application photo to authenticated admins.
     * Photos live on the private 'uploads' disk, so they are not publicly
     * reachable — this endpoint is the only way to view them.
     */
    public function professionalPhoto($id)
    {
        $pro = Professional::find($id);
        if (!$pro || !$pro->professional_photo_path) {
            abort(404);
        }

        $disk = Storage::disk('uploads');
        if (!$disk->exists($pro->professional_photo_path)) {
            abort(404);
        }

        return response($disk->get($pro->professional_photo_path), 200, [
            'Content-Type'  => $disk->mimeType($pro->professional_photo_path) ?: 'image/jpeg',
            'Cache-Control' => 'private, max-age=300',
        ]);
    }

    // ─── Manually confirm a consultation payment (for testing / support) ────────
    public function confirmConsultation(int $id)
    {
        $consultation = Consultation::find($id);
        if (!$consultation) {
            return response()->json(['error' => 'Consultation not found'], 404);
        }
        $consultation->update(['status' => 'confirmed']);
        return response()->json(['message' => 'Consultation confirmed', 'consultation' => $consultation]);
    }

    // ─── List all consultations ───────────────────────────────────────────────
    public function consultations(Request $request)
    {
        $consultations = Consultation::with(['user:id,display_name,username', 'professional.user:id,display_name'])
            ->orderByDesc('created_at')
            ->paginate(30);
        return response()->json($consultations);
    }

    public function verifyProfessional($id, Request $request)
    {
        $professional = Professional::find($id);

        if (!$professional) {
            return response()->json(['error' => 'Professional not found'], 404);
        }

        $action = $request->input('action');
        $statusMap = ['approve' => 'verified', 'reject' => 'rejected', 'pending' => 'pending'];

        $newStatus = $statusMap[$action] ?? $request->input('verification_status');

        if (!in_array($newStatus, ['verified', 'rejected', 'pending'])) {
            return response()->json(['error' => 'Invalid action. Use approve, reject, or pending.'], 422);
        }

        // Competence floor (MoH: minimum a diploma + at least 3 years supervised
        // experience). A professional cannot be VERIFIED without meeting it.
        // Note: Email and license are optional for counselors (per recent policy).
        if ($newStatus === 'verified') {
            $missing = [];
            if ((int) $professional->years_experience < 3) {
                $missing[] = 'at least 3 years of experience';
            }
            if (empty($professional->qualification)) {
                $missing[] = 'a stated qualification (minimum diploma)';
            }
            if ($missing) {
                return response()->json([
                    'error' => 'Cannot verify — competence floor not met: ' . implode(', ', $missing) . '.',
                ], 422);
            }
        }

        $updates = [
            'status'      => $newStatus,
            'verified_at' => $newStatus === 'verified' ? now() : null,
        ];

        // Auto-verify KMPDC when approving (license verification is optional)
        if ($newStatus === 'verified') {
            $updates['kmpdc_verified'] = true;
            $updates['kmpdc_verified_at'] = now();
        }

        $professional->update($updates);
        \App\Models\AuditLog::record('verify_professional', 'professional', $professional->id, ['status' => $newStatus]);

        return response()->json([
            'message'      => 'Status updated to ' . $newStatus,
            'professional' => $professional,
        ]);
    }

    public function verifyKmpdcLicense(Request $request, $id)
    {
        $professional = Professional::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'verified' => 'required|boolean',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $verified = $request->boolean('verified');
        $professional->update([
            'kmpdc_verified'    => $verified,
            'kmpdc_verified_at' => $verified ? now() : null,
        ]);
        \App\Models\AuditLog::record('verify_kmpdc', 'professional', $professional->id, ['kmpdc_verified' => $verified]);

        return response()->json([
            'message' => 'KMPDC License ' . ($verified ? 'verified' : 'unverified'),
            'professional' => $professional,
        ]);
    }

    public function workload()
    {
        $weekStart = now()->startOfWeek();
        $weekEnd   = now()->endOfWeek();

        $professionals = \App\Models\Professional::where('status', 'verified')
            ->get()
            ->map(function ($pro) use ($weekStart, $weekEnd) {
                $bookings = \App\Models\Consultation::where('professional_id', $pro->id)
                    ->whereBetween('scheduled_at', [$weekStart, $weekEnd])
                    ->whereIn('status', ['confirmed', 'in_progress'])
                    ->count();
                $cap = $pro->max_clients_per_week ?: 20;
                return [
                    'id'                    => $pro->id,
                    'display_name'          => $pro->full_name ?? 'Unknown',
                    'bookings_this_week'    => $bookings,
                    'max_clients_per_week'  => $cap,
                    'load_pct'              => (int) min(100, round($bookings / $cap * 100)),
                    'is_overloaded'         => $bookings >= $cap,
                ];
            })->sortByDesc('load_pct')->values();

        return response()->json(['workload' => $professionals]);
    }

    // ─── Support Group Management ─────────────────────────────────────────────

    public function listGroups()
    {
        $groups = SupportGroup::orderBy('name')->get();
        return response()->json(['groups' => $groups]);
    }

    public function createGroup(Request $request)
    {
        $v = Validator::make($request->all(), [
            'name'        => 'required|string|max:100',
            'description' => 'required|string',
            'category'    => 'required|string|max:50',
            'icon'        => 'nullable|string|max:10',
            'is_active'   => 'boolean',
        ]);
        if ($v->fails()) return response()->json(['error' => $v->errors()->first()], 422);

        $slug = \Illuminate\Support\Str::slug($request->name);
        $base = $slug;
        $i = 1;
        while (SupportGroup::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }

        $group = SupportGroup::create([
            'name'        => $request->name,
            'slug'        => $slug,
            'description' => $request->description,
            'category'    => $request->category,
            'icon'        => $request->icon ?? '💬',
            'is_active'   => $request->boolean('is_active', true),
            'member_count'=> 0,
        ]);

        return response()->json(['message' => 'Group created.', 'group' => $group], 201);
    }

    public function updateGroup(Request $request, int $id)
    {
        $group = SupportGroup::findOrFail($id);
        $group->update($request->only(['name', 'description', 'category', 'icon', 'is_active']));
        return response()->json(['message' => 'Group updated.', 'group' => $group]);
    }

    public function deleteGroup(int $id)
    {
        $group = SupportGroup::findOrFail($id);
        $group->update(['is_active' => false]);
        return response()->json(['message' => 'Group deactivated.']);
    }

    // ─── Moderation Queue ─────────────────────────────────────────────────────

    public function flaggedMessages(Request $request)
    {
        // SQLite has no REGEXP operator, so match risk terms with LIKE (works on both sqlite & mysql).
        $terms = ['kill', 'suicide', 'overdose', 'end my life', 'hurt myself', 'self harm', 'self-harm', 'die', 'dead'];
        $messages = GroupMessage::with(['group:id,name', 'user:id,display_name,username'])
            ->where('is_moderated', false)
            ->where(function ($q) use ($terms) {
                foreach ($terms as $t) {
                    $q->orWhere('content', 'like', '%' . $t . '%');
                }
            })
            ->orderByDesc('created_at')
            ->paginate(30);

        return response()->json($messages);
    }

    public function moderateMessage(int $groupId, int $msgId)
    {
        $msg = GroupMessage::where('id', $msgId)->where('group_id', $groupId)->firstOrFail();
        $msg->update(['is_moderated' => true, 'moderated_at' => now()]);
        return response()->json(['message' => 'Message hidden.']);
    }

    // ─── User Management ─────────────────────────────────────────────────────

    public function listUsers(Request $request)
    {
        $q = $request->query('q');
        $users = \App\Models\User::when($q, fn($query) =>
                $query->where('username', 'like', "%{$q}%")
                      ->orWhere('display_name', 'like', "%{$q}%")
                      ->orWhere('email', 'like', "%{$q}%")
            )
            ->select('id', 'username', 'display_name', 'email', 'role', 'is_banned', 'created_at')
            ->orderByDesc('created_at')
            ->paginate(30);

        return response()->json($users);
    }

    public function banUser(int $id)
    {
        $user = \App\Models\User::findOrFail($id);
        if ($user->role === 'admin') return response()->json(['error' => 'Cannot ban an admin.'], 403);
        $user->update(['is_banned' => true]);
        return response()->json(['message' => "User {$user->display_name} banned."]);
    }

    public function unbanUser(int $id)
    {
        $user = \App\Models\User::findOrFail($id);
        $user->update(['is_banned' => false]);
        return response()->json(['message' => "User {$user->display_name} unbanned."]);
    }

    // ─── SHA Accreditation Report ─────────────────────────────────────────────

    public function shaReport(Request $request)
    {
        \App\Models\AuditLog::record('view_sha_report');
        $from = $request->query('from', now()->subMonths(3)->toDateString());
        $to   = $request->query('to', now()->toDateString());

        $consultations = \App\Models\Consultation::with(['user:id,display_name', 'professional:id,user_id,kmpdc_license', 'professional.user:id,display_name'])
            ->where('status', 'completed')
            ->whereBetween('scheduled_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->orderBy('scheduled_at')
            ->get();

        // ICD-10 mapping from last assessment
        $icd10Map = [
            'phq9'  => 'F32.9',
            'gad7'  => 'F41.1',
            'audit' => 'F10.10',
            'dast10'=> 'F19.10',
            'pgsi'  => 'F63.0',
        ];

        $rows = $consultations->map(function ($c) use ($icd10Map) {
            $assessment = \App\Models\Assessment::where('user_id', $c->user_id)
                ->where('created_at', '<=', $c->scheduled_at)
                ->orderByDesc('created_at')->first();

            return [
                'date'          => $c->scheduled_at->toDateString(),
                'session_id'    => $c->consultation_id,
                'patient'       => $c->user?->display_name ?? 'N/A',
                'therapist'     => $c->professional?->user?->display_name ?? 'N/A',
                'kmpdc_license' => $c->professional?->kmpdc_license ?? 'N/A',
                'icd10_code'    => $icd10Map[$assessment?->assessment_type] ?? 'Z04.6',
                'diagnosis'     => $assessment?->severity ?? 'N/A',
                'duration_mins' => 60,
                'platform'      => 'Afya Yako Siri Yako — mhapke.com',
            ];
        });

        $csv = implode("\n", array_merge(
            [implode(',', ['Date', 'Session ID', 'Patient', 'Therapist', 'KMPDC License', 'ICD-10', 'Diagnosis', 'Duration (mins)', 'Platform'])],
            $rows->map(fn($r) => implode(',', array_values($r)))->toArray()
        ));

        return response($csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="sha_report_' . $from . '_' . $to . '.csv"',
        ]);
    }

    public function exportSessions()
    {
        \App\Models\AuditLog::record('export_sessions');
        $rows = \App\Models\Consultation::with(['user:id,display_name,username', 'professional.user:id,display_name'])
            ->orderByDesc('scheduled_at')
            ->get()
            ->map(fn($c) => [
                $c->consultation_id,
                \Carbon\Carbon::parse($c->scheduled_at)->setTimezone('Africa/Nairobi')->format('Y-m-d H:i'),
                $c->status,
                $c->user?->display_name ?? $c->user?->username ?? '',
                $c->professional?->user?->display_name ?? '',
                $c->duration_minutes,
                $c->amount,
            ]);

        $csv = collect([['Session ID', 'Scheduled (EAT)', 'Status', 'Patient', 'Professional', 'Duration (min)', 'Amount (KES)']])
            ->concat($rows)
            ->map(fn($r) => implode(',', array_map(fn($v) => '"' . str_replace('"', '""', $v) . '"', $r)))
            ->implode("\n");

        return response($csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="sessions_export.csv"',
        ]);
    }

    public function exportUsers()
    {
        \App\Models\AuditLog::record('export_users');
        $rows = \App\Models\User::orderByDesc('created_at')
            ->get()
            ->map(fn($u) => [
                $u->id,
                $u->username,
                $u->display_name,
                $u->email ?? '',
                $u->role,
                $u->created_at?->toDateString(),
                $u->is_banned ? 'banned' : 'active',
            ]);

        $csv = collect([['ID', 'Username', 'Display Name', 'Email', 'Role', 'Joined', 'Status']])
            ->concat($rows)
            ->map(fn($r) => implode(',', array_map(fn($v) => '"' . str_replace('"', '""', $v) . '"', $r)))
            ->implode("\n");

        return response($csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="users_export.csv"',
        ]);
    }

    public function treatmentPlans(Request $request)
    {
        $query = \App\Models\TreatmentPlan::with([
            'professional:id,user_id',
            'professional.user:id,display_name',
            'user:id,display_name,username',
        ]);

        // Filter by professional
        if ($request->filled('professional_id')) {
            $query->where('professional_id', $request->professional_id);
        }

        // Filter by status (draft, active, completed, cancelled)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Filter by patient
        if ($request->filled('patient_id')) {
            $query->where('user_id', $request->patient_id);
        }

        $plans = $query->orderByDesc('created_at')->paginate(20);

        return response()->json($plans);
    }

    public function treatmentPlanDetail($id)
    {
        $plan = \App\Models\TreatmentPlan::with([
            'professional.user:id,display_name,email,phone',
            'user:id,display_name,username,email,phone',
            'consultation:id,scheduled_at,status',
        ])->findOrFail($id);

        return response()->json(['plan' => $plan]);
    }

    public function treatmentPlanAudit(Request $request)
    {
        // Get all treatment plans with audit trail
        $plans = \App\Models\TreatmentPlan::with([
            'professional.user:id,display_name',
            'user:id,display_name',
        ])
        ->orderByDesc('updated_at')
        ->get(['id', 'professional_id', 'user_id', 'description', 'total_cost', 'status', 'created_at', 'updated_at']);

        // Group by professional for accountability report
        $byProfessional = $plans->groupBy('professional_id')->map(function ($group) {
            return [
                'professional' => $group->first()->professional->user->display_name ?? 'Unknown',
                'professional_id' => $group->first()->professional_id,
                'total_plans' => $group->count(),
                'active_plans' => $group->where('status', 'active')->count(),
                'draft_plans' => $group->where('status', 'draft')->count(),
                'total_value_kes' => (int) $group->sum('total_cost'),
                'last_updated' => $group->first()->updated_at,
            ];
        })
        ->sortByDesc('total_plans')
        ->values();

        return response()->json([
            'total_plans' => $plans->count(),
            'by_professional' => $byProfessional,
            'all_plans' => $plans,
        ]);
    }

    // ── Admin account management / password reset ──────────────────────────

    /** List accounts so an admin can reset passwords / manage them. */
    public function testAccounts(Request $request)
    {
        $accounts = User::orderByDesc('created_at')
            ->get(['id', 'username', 'display_name', 'email', 'role', 'is_banned', 'is_test'])
            ->map(fn($u) => [
                'id'           => $u->id,
                'username'     => $u->username,
                'display_name' => $u->display_name,
                'email'        => $u->email,
                'role'         => $u->role,
                'is_banned'    => (bool) $u->is_banned,
                'is_test'      => (bool) $u->is_test,
            ]);

        return response()->json(['accounts' => $accounts]);
    }

    /** Create a (test) account. */
    public function createTestAccount(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username'     => 'required|string|max:50|unique:users,username',
            'password'     => 'required|string|min:6',
            'display_name' => 'nullable|string|max:100',
            'email'        => 'nullable|email|unique:users,email',
            'role'         => 'nullable|in:user,professional,admin',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $user = new User();
        $user->username     = $request->username;
        $user->password     = $request->password;          // hashed via model cast
        $user->display_name = $request->display_name ?: $request->username;
        $user->email        = $request->email;
        $user->role         = $request->role ?: 'user';
        $user->is_test      = true;
        $user->save();

        return response()->json([
            'message'  => 'Account created.',
            'id'       => $user->id,
            'username' => $user->username,
        ], 201);
    }

    /** Reset any user's password to an admin-supplied value. */
    public function resetUserPassword(Request $request, int $id)
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:6',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $user = User::findOrFail($id);
        $user->password = $request->password;              // hashed via model cast
        $user->save();

        return response()->json([
            'message'  => "Password reset for {$user->username}.",
            'username' => $user->username,
        ]);
    }

    /** Delete a test account (real accounts are protected). */
    public function deleteTestAccount(int $id)
    {
        $user = User::findOrFail($id);
        if ($user->role === 'admin') {
            return response()->json(['error' => 'Cannot delete an admin account.'], 403);
        }
        if (!$user->is_test) {
            return response()->json(['error' => 'Only test accounts can be deleted here.'], 422);
        }
        $user->delete();
        return response()->json(['message' => 'Account deleted.']);
    }

    // ── Revenue dashboard ──────────────────────────────────────────────────

    public function revenue(Request $request)
    {
        // Realised session revenue = booked/paid consultations (payment happens at booking).
        $paidStatuses = ['confirmed', 'in_progress', 'completed'];
        $sessions      = Consultation::whereIn('status', $paidStatuses);
        $sessionCount  = (clone $sessions)->count();
        $sessionTotal  = (float) (clone $sessions)->sum('amount');
        $platformShare = round($sessionTotal * 0.35, 2);
        $proShare      = round($sessionTotal * 0.65, 2);

        // Subscriptions (active = not expired and status active).
        $subQuery       = \App\Models\Subscription::where('status', 'active');
        $subActiveCount = (clone $subQuery)->count();
        $subRevenue     = (float) (clone $subQuery)->sum('amount_paid');

        // Corporate / EAP — feature not yet built (no table); report zeros.
        $eapRevenue = 0.0;
        $eapActive  = 0;

        // Pending professional payouts.
        $pendingPayouts = \App\Models\ProfessionalPayout::where('status', 'pending')->count();

        return response()->json([
            'total_platform_revenue' => round($platformShare + $subRevenue + $eapRevenue, 2),
            'sessions' => [
                'count'              => $sessionCount,
                'total_revenue'      => round($sessionTotal, 2),
                'platform_share'     => $platformShare,
                'professional_share' => $proShare,
            ],
            'subscriptions' => [
                'revenue'      => round($subRevenue, 2),
                'active_count' => $subActiveCount,
            ],
            'corporate_eap' => [
                'revenue'      => $eapRevenue,
                'active_count' => $eapActive,
            ],
            'payouts' => [
                'pending_count' => $pendingPayouts,
            ],
        ]);
    }

    // ── Compliance & quality dashboard ─────────────────────────────────────

    /** Safety incidents, derived from crisis events. */
    public function complianceIncidents(Request $request)
    {
        $query = CrisisEvent::orderByDesc('created_at');
        if ($request->filled('status')) {
            $resolved = $request->status === 'resolved';
            $query->where('resolved', $resolved);
        }

        $data = $query->limit(200)->get()->map(fn($e) => [
            'id'          => $e->id,
            'title'       => $e->trigger_source ? ucfirst(str_replace('_', ' ', $e->trigger_source)) . ' alert' : 'Crisis alert',
            'type'        => $e->trigger_source ?: 'crisis',
            'description' => $e->content,
            'severity'    => $e->severity ?: 'medium',
            'status'      => $e->resolved ? 'resolved' : 'open',
            'escalated'   => (bool) $e->escalated,
            'created_at'  => $e->created_at,
            'resolved_at' => $e->resolved_at,
        ]);

        return response()->json(['data' => $data]);
    }

    /** Complaints, derived from flagged session feedback. */
    public function complianceComplaints(Request $request)
    {
        $data = \App\Models\SessionFeedback::with(['consultation.professional:id,full_name'])
            ->whereNotNull('flag_status')
            ->where('flag_status', '!=', 'none')
            ->orderByDesc('flagged_at')
            ->limit(200)
            ->get()
            ->map(fn($f) => [
                'id'           => $f->id,
                'title'        => $f->flag_reason ?: 'Flagged session feedback',
                'detail'       => $f->comment,
                'professional' => $f->consultation?->professional?->full_name ?? 'Unknown',
                'severity'     => ($f->overall_rating !== null && $f->overall_rating <= 2) ? 'critical' : 'normal',
                'status'       => 'filed',
                'created_at'   => $f->flagged_at ?? $f->created_at,
            ]);

        return response()->json(['data' => $data]);
    }

    /** Quality metrics: per-professional average session ratings. */
    public function complianceQualityMetrics(Request $request)
    {
        $rows = \App\Models\SessionFeedback::query()
            ->join('consultations', 'session_feedback.consultation_id', '=', 'consultations.id')
            ->join('professionals', 'consultations.professional_id', '=', 'professionals.id')
            ->groupBy('professionals.id', 'professionals.full_name')
            ->selectRaw('professionals.full_name as professional, AVG(session_feedback.overall_rating) as avg_rating, COUNT(*) as n')
            ->get();

        $data = $rows->map(fn($r) => [
            'professional' => $r->professional ?? 'Unknown',
            'metric_type'  => 'Avg session rating',
            // UI renders metric_value with a "%" suffix, so express the 0–5 rating as a 0–100 score.
            'metric_value' => round(((float) $r->avg_rating) / 5 * 100, 1),
            'sample_size'  => (int) $r->n,
        ]);

        return response()->json(['data' => $data]);
    }
}
