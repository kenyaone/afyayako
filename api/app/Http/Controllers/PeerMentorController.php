<?php
namespace App\Http\Controllers;

use App\Models\PeerMentorProfile;
use App\Models\User;
use Illuminate\Http\Request;

class PeerMentorController extends Controller
{
    // Patient opts in as a peer mentor — goes for admin review first
    public function apply(Request $request)
    {
        $user = auth('api')->user();

        $existing = PeerMentorProfile::where('user_id', $user->id)->first();

        $profile = PeerMentorProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'bio'               => $request->bio,
                'conditions_helped' => $request->conditions_helped ?? [],
                'years_in_recovery' => $request->years_in_recovery,
                // Keep existing approval status; new applications start pending
                'is_active'         => $existing?->is_active ?? false,
                'is_verified'       => $existing?->is_verified ?? false,
            ]
        );

        return response()->json(['message' => 'Application submitted. Our team will review and approve within 24 hours.', 'profile' => $profile]);
    }

    // Admin approves or rejects a peer mentor application
    public function adminApprove(int $profileId, Request $request)
    {
        $approve = (bool) $request->input('approve', true);

        $profile = PeerMentorProfile::findOrFail($profileId);
        $profile->update([
            'is_active'   => $approve,
            'is_verified' => $approve,
        ]);

        // Notify the user
        \App\Models\Notification::create([
            'user_id'   => $profile->user_id,
            'type'      => 'peer_mentor_review',
            'title'     => $approve ? '✅ Peer Mentor Application Approved' : 'Peer Mentor Application Reviewed',
            'body'      => $approve
                ? 'Your peer mentor application has been approved. You are now listed as an active mentor.'
                : 'Your peer mentor application needs more information. Please update your profile and reapply.',
            'is_urgent' => false,
        ]);

        return response()->json(['message' => $approve ? 'Mentor approved.' : 'Mentor rejected.', 'profile' => $profile]);
    }

    // Admin lists all pending mentor applications
    public function adminList()
    {
        $pending = PeerMentorProfile::with('user:id,display_name,username,email')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($m) => [
                'id'               => $m->id,
                'user_id'          => $m->user_id,
                'display_name'     => $m->user?->display_name,
                'username'         => $m->user?->username,
                'bio'              => $m->bio,
                'conditions_helped'=> $m->conditions_helped,
                'years_in_recovery'=> $m->years_in_recovery,
                'is_active'        => $m->is_active,
                'is_verified'      => $m->is_verified ?? false,
                'created_at'       => $m->created_at,
            ]);

        return response()->json(['mentors' => $pending]);
    }

    // Remove from mentor pool
    public function withdraw()
    {
        PeerMentorProfile::where('user_id', auth('api')->id())
            ->update(['is_active' => false]);
        return response()->json(['message' => 'Removed from peer mentor pool.']);
    }

    // Patient views their own mentor profile
    public function myProfile()
    {
        $profile = PeerMentorProfile::where('user_id', auth('api')->id())->first();
        return response()->json([
            'profile' => $profile ? array_merge($profile->toArray(), ['is_verified' => (bool) ($profile->is_verified ?? false)]) : null,
        ]);
    }

    // List available peer mentors (only admin-approved ones)
    public function index()
    {
        $mentors = PeerMentorProfile::where('is_active', true)
            ->with('user:id,display_name,avatar')
            ->get()
            ->map(fn($m) => [
                'id'               => $m->id,
                'display_name'     => $m->user?->display_name,
                'avatar'           => $m->user?->avatar,
                'bio'              => $m->bio,
                'conditions_helped'=> $m->conditions_helped,
                'years_in_recovery'=> $m->years_in_recovery,
                'is_verified'      => (bool) ($m->is_verified ?? false),
            ]);

        return response()->json(['mentors' => $mentors]);
    }

    // Request to connect with a mentor (sends notification)
    public function connect(int $mentorId)
    {
        $mentor = PeerMentorProfile::where('id', $mentorId)->where('is_active', true)->firstOrFail();
        $requester = auth('api')->user();

        \App\Models\Notification::create([
            'user_id'   => $mentor->user_id,
            'type'      => 'peer_connect_request',
            'title'     => 'Someone wants to connect with you',
            'body'      => "{$requester->display_name} would like to connect with you as a peer mentor. Log in to reach out.",
            'is_urgent' => false,
            'data'      => ['requester_id' => $requester->id],
        ]);

        return response()->json(['message' => 'Connection request sent. The mentor will be notified.']);
    }
}
