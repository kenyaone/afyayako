<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\EapInviteLink;
use App\Models\CorporateEmployee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EapController extends Controller
{
    /**
     * Generate a new EAP invite link (HR creates this)
     */
    public function generateInviteLink(Request $request)
    {
        $user = auth('api')->user();

        // Verify user is HR/admin for this company
        $company = Company::where('contact_email', $user->email)->first();
        if (!$company) {
            return response()->json(['error' => 'Not authorized'], 403);
        }

        // Only expires_in_days is HR-configurable. Anonymity by design:
        // no per-employee email (would let HR correlate joiner → person),
        // no max_uses (single-use links would give the same correlation).
        // One reusable link per company, posted publicly to staff.
        $validator = Validator::make($request->all(), [
            'expires_in_days' => 'nullable|integer|min:7|max:365',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $expiresAt = now()->addDays((int) ($request->expires_in_days ?? 90));

        $inviteLink = EapInviteLink::create([
            'company_id' => $company->id,
            'token'      => EapInviteLink::generateToken(),
            'email'      => null,   // never store per-person email
            'max_uses'   => null,   // unlimited — reusable by all staff
            'expires_at' => $expiresAt,
        ]);

        return response()->json([
            'message' => 'Invite link generated',
            'invite_link' => [
                'token'       => $inviteLink->token,
                'url'         => route('eap.join', $inviteLink->token),
                'expires_at'  => $inviteLink->expires_at,
                'reusable'    => true,
                'privacy_note'=> 'Reusable — post publicly to staff. Do not DM to a single employee.',
            ]
        ], 201);
    }

    /**
     * Get list of invite links for a company (HR dashboard)
     */
    public function getInviteLinks(Request $request)
    {
        $user = auth('api')->user();
        $company = Company::where('contact_email', $user->email)->first();

        if (!$company) {
            return response()->json(['error' => 'Not authorized'], 403);
        }

        $links = $company->inviteLinks()
            ->withCount('employees')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($link) {
                return [
                    'id' => $link->id,
                    'token' => substr($link->token, 0, 8) . '...',
                    'full_token' => $link->token,
                    'email' => $link->email,
                    'created_at' => $link->created_at,
                    'expires_at' => $link->expires_at,
                    'max_uses' => $link->max_uses,
                    'current_uses' => $link->current_uses,
                    'uses_remaining' => $link->max_uses ? $link->max_uses - $link->current_uses : null,
                    'employees_joined' => $link->employees_count,
                    'is_active' => $link->isValid(),
                ];
            });

        return response()->json(['invite_links' => $links]);
    }

    /**
     * Join EAP via invite link (public, no auth required)
     */
    public function joinViaLink(Request $request, $token)
    {
        // Verify the invite link
        $inviteLink = EapInviteLink::where('token', $token)->first();

        if (!$inviteLink || !$inviteLink->isValid()) {
            return response()->json(['error' => 'Invalid or expired invite link'], 404);
        }

        $company = $inviteLink->company;

        $validator = Validator::make($request->all(), [
            'username' => 'required|string|min:5|unique:users,username',
            'display_name' => 'required|string|max:100',
            'password' => 'required|string|min:8',
            'password_confirm' => 'required|string|same:password',
            'date_of_birth' => 'required|date|before:today',
            // Optional PERSONAL email (never a work email) for delivering
            // the anonymous EMP-XXXXX code. HR/company can never see this.
            'personal_email' => 'nullable|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        // Create anonymous user account.
        // We DO store the personal email on the user record because Laravel
        // auth flows (password reset, session emails) need it — but there
        // is no path in the system that exposes it to HR/company.
        $user = User::create([
            'username'          => $request->username,
            'display_name'      => $request->display_name,
            'password'          => $request->password,
            'email'             => $request->personal_email, // may be null
            'date_of_birth'     => $request->date_of_birth,
            'role'              => 'user',
            'is_anonymous_mode' => true,
        ]);

        // Create corporate employee record
        $corporateEmployee = CorporateEmployee::create([
            'company_id'     => $company->id,
            'user_id'        => $user->id,
            'invite_link_id' => $inviteLink->id,
            'employee_code'  => CorporateEmployee::generateEmployeeCode(),
        ]);

        // Increment invite link usage
        $inviteLink->incrementUses();

        // Send welcome email if the employee gave a personal email.
        // Fires-and-forgets — email failure never breaks the signup response.
        if ($user->email) {
            try {
                \Illuminate\Support\Facades\Mail::to($user->email)->send(
                    new \App\Mail\EapEmployeeJoined(
                        $corporateEmployee,
                        $company->name,
                        $user->display_name
                    )
                );
            } catch (\Throwable $e) {
                \Log::warning('EAP welcome email failed: '.$e->getMessage());
            }
        }

        // Generate JWT tokens
        $token = \Tymon\JWTAuth\Facades\JWTAuth::fromUser($user);
        $refreshToken = \Tymon\JWTAuth\Facades\JWTAuth::fromUser($user, ['type' => 'refresh']);

        return response()->json([
            'message' => 'Successfully joined EAP',
            'user' => $user,
            'company' => [
                'id' => $company->id,
                'name' => $company->name,
            ],
            'employee_code' => $corporateEmployee->employee_code,
            'access' => $token,
            'refresh' => $refreshToken,
        ], 201);
    }

    /**
     * Revoke an invite link (HR)
     */
    public function revokeInviteLink(Request $request, $id)
    {
        $user = auth('api')->user();
        $company = Company::where('contact_email', $user->email)->first();

        if (!$company) {
            return response()->json(['error' => 'Not authorized'], 403);
        }

        $inviteLink = EapInviteLink::where('id', $id)
            ->where('company_id', $company->id)
            ->first();

        if (!$inviteLink) {
            return response()->json(['error' => 'Invite link not found'], 404);
        }

        $inviteLink->delete();

        return response()->json(['message' => 'Invite link revoked']);
    }

    /**
     * Get EAP employees for company (HR dashboard)
     */
    public function getEmployees(Request $request)
    {
        $user = auth('api')->user();
        $company = Company::where('contact_email', $user->email)->first();

        if (!$company) {
            return response()->json(['error' => 'Not authorized'], 403);
        }

        $employees = $company->employees()
            ->with('user')
            ->orderByDesc('joined_at')
            ->get()
            ->map(function ($emp) {
                return [
                    'id' => $emp->id,
                    'employee_code' => $emp->employee_code,
                    'joined_at' => $emp->joined_at,
                    'consultations' => $emp->consultations()->count(),
                ];
            });

        return response()->json([
            'total_employees' => $employees->count(),
            'employees' => $employees,
        ]);
    }

    /**
     * HR uploads a list of employee emails once. The system BCC's each of
     * them with the reusable invite link. The list is NEVER stored — HR
     * receives an aggregate count only ("sent to 45 employees"), so cannot
     * later correlate any joiner (EMP-XXXXX) with a specific person.
     */
    public function broadcastInvite(Request $request)
    {
        $user    = auth('api')->user();
        $company = Company::where('contact_email', $user->email)->first();
        if (!$company) {
            return response()->json(['error' => 'Not authorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'token'          => 'required|string|exists:eap_invite_links,token',
            'emails'         => 'required|array|min:1|max:5000',
            'emails.*'       => 'required|email|max:255',
            'custom_message' => 'nullable|string|max:1200',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $link = EapInviteLink::where('token', $request->token)
            ->where('company_id', $company->id)
            ->first();
        if (!$link || !$link->isValid()) {
            return response()->json(['error' => 'Invite link is invalid or expired'], 422);
        }

        $inviteUrl = rtrim(env('FRONTEND_URL', 'https://afyayako.co.ke'), '/')
            . '/eap/join/' . $link->token;

        $sent   = 0;
        $failed = 0;
        // Dedupe + trim; never log addresses.
        $emails = collect($request->emails)->map(fn ($e) => strtolower(trim($e)))->unique();

        foreach ($emails as $email) {
            try {
                \Illuminate\Support\Facades\Mail::to($email)->send(new \App\Mail\EapBroadcastToStaff(
                    company:       $company,
                    inviteUrl:     $inviteUrl,
                    customMessage: $request->custom_message,
                ));
                $sent++;
            } catch (\Throwable $e) {
                $failed++;
                \Log::warning('EAP broadcast delivery failed', ['company_id' => $company->id]);
            }
        }

        // Deliberately NOT returning which emails were used — just counts.
        return response()->json([
            'message' => 'Invitations sent',
            'sent'    => $sent,
            'failed'  => $failed,
            'note'    => 'Email list was not stored. HR can never see who opened or joined.',
        ]);
    }
}
