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

        $validator = Validator::make($request->all(), [
            'max_uses' => 'nullable|integer|min:1',
            'expires_in_days' => 'nullable|integer|min:1|max:365',
            'email' => 'nullable|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $expiresAt = null;
        if ($request->expires_in_days) {
            $expiresAt = now()->addDays((int) $request->expires_in_days);
        }

        $inviteLink = EapInviteLink::create([
            'company_id' => $company->id,
            'token' => EapInviteLink::generateToken(),
            'email' => $request->email,
            'max_uses' => $request->max_uses,
            'expires_at' => $expiresAt,
        ]);

        return response()->json([
            'message' => 'Invite link generated',
            'invite_link' => [
                'token' => $inviteLink->token,
                'url' => route('eap.join', $inviteLink->token),
                'max_uses' => $inviteLink->max_uses,
                'expires_at' => $inviteLink->expires_at,
                'uses_remaining' => $inviteLink->max_uses ? $inviteLink->max_uses - $inviteLink->current_uses : 'Unlimited',
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
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        // Create anonymous user account
        $user = User::create([
            'username' => $request->username,
            'display_name' => $request->display_name,
            'password' => $request->password,
            'email' => null, // No email for corporate employees (privacy)
            'date_of_birth' => $request->date_of_birth,
            'role' => 'user',
            'is_anonymous_mode' => true,
        ]);

        // Create corporate employee record
        $corporateEmployee = CorporateEmployee::create([
            'company_id' => $company->id,
            'user_id' => $user->id,
            'invite_link_id' => $inviteLink->id,
            'employee_code' => CorporateEmployee::generateEmployeeCode(),
        ]);

        // Increment invite link usage
        $inviteLink->incrementUses();

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
}
