<?php

namespace App\Http\Controllers;

use App\Models\GroupMembership;
use App\Models\GroupMessage;
use App\Models\SupportGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SupportGroupController extends Controller
{
    // List all active groups with membership status for current user
    public function index()
    {
        $user   = auth('api')->user();
        $groups = SupportGroup::where('is_active', true)->orderBy('name')->get();

        $myGroupIds = GroupMembership::where('user_id', $user->id)->pluck('group_id')->toArray();

        return response()->json([
            'groups'      => $groups->map(fn($g) => array_merge($g->toArray(), [
                'is_member' => in_array($g->id, $myGroupIds),
            ])),
            'my_group_ids' => $myGroupIds,
        ]);
    }

    // Join a group (anonymous by default)
    public function join(Request $request, int $groupId)
    {
        $user  = auth('api')->user();
        $group = SupportGroup::findOrFail($groupId);

        $exists = GroupMembership::where('group_id', $groupId)->where('user_id', $user->id)->exists();
        if ($exists) return response()->json(['message' => 'Already a member.']);

        // Generate an anonymous alias like "Hopeful Member #42"
        $aliases = ['Hopeful','Brave','Healing','Rising','Strong','Resilient','Peaceful','Steady','Gentle','Kind'];
        $alias   = $aliases[array_rand($aliases)] . ' Member #' . rand(10, 999);

        GroupMembership::create([
            'group_id'     => $groupId,
            'user_id'      => $user->id,
            'display_name' => $request->boolean('reveal_name') ? $user->display_name : $alias,
            'is_anonymous' => !$request->boolean('reveal_name'),
            'joined_at'    => now(),
        ]);

        $group->increment('member_count');

        return response()->json(['message' => 'Joined group.', 'alias' => $alias]);
    }

    // Leave a group
    public function leave(int $groupId)
    {
        $user = auth('api')->user();
        GroupMembership::where('group_id', $groupId)->where('user_id', $user->id)->delete();
        SupportGroup::where('id', $groupId)->decrement('member_count');
        return response()->json(['message' => 'Left group.']);
    }

    // Fetch messages (paginated, newest-first, exclude moderated)
    public function messages(int $groupId, Request $request)
    {
        $user = auth('api')->user();
        $isMember = GroupMembership::where('group_id', $groupId)->where('user_id', $user->id)->exists();
        if (!$isMember) return response()->json(['error' => 'Join the group first.'], 403);

        $since = $request->input('since');   // ISO timestamp for polling
        $query = GroupMessage::where('group_id', $groupId)
            ->where('is_moderated', false);

        if ($since) {
            $query->where('created_at', '>', $since);
        }

        $messages = $query->orderBy('created_at')->limit(100)->get()
            ->map(fn($m) => [
                'id'           => $m->id,
                'display_name' => $m->display_name,
                'content'      => $m->content,
                'is_pinned'    => $m->is_pinned,
                'is_mine'      => $m->user_id === $user->id,
                'created_at'   => $m->created_at->toISOString(),
            ]);

        return response()->json(['messages' => $messages]);
    }

    // Post a message to a group
    public function postMessage(Request $request, int $groupId)
    {
        $user = auth('api')->user();
        $membership = GroupMembership::where('group_id', $groupId)->where('user_id', $user->id)->first();
        if (!$membership) return response()->json(['error' => 'Join the group first.'], 403);

        $request->validate(['content' => 'required|string|max:1000']);

        // Basic crisis keyword filter — flag for admin review
        $keywords = ['kill myself', 'end my life', 'suicide', 'self harm', 'cut myself'];
        $flagged  = collect($keywords)->some(fn($k) => str_contains(strtolower($request->content), $k));

        $msg = GroupMessage::create([
            'group_id'     => $groupId,
            'user_id'      => $user->id,
            'content'      => $flagged ? $request->content : $request->content,
            'display_name' => $membership->display_name,
            'is_moderated' => false,
        ]);

        if ($flagged) {
            \App\Models\Notification::sendToAdmins(
                'crisis_alert',
                'Crisis keyword in group message',
                "User in group #{$groupId} posted: \"{$request->content}\"",
                ['group_id' => $groupId, 'user_id' => $user->id, 'message_id' => $msg->id],
                true
            );
        }

        return response()->json([
            'message' => [
                'id'           => $msg->id,
                'display_name' => $msg->display_name,
                'content'      => $msg->content,
                'is_pinned'    => false,
                'is_mine'      => true,
                'created_at'   => $msg->created_at->toISOString(),
            ]
        ], 201);
    }

    // Admin: moderate (hide) a message
    public function moderate(int $messageId)
    {
        GroupMessage::where('id', $messageId)->update([
            'is_moderated' => true,
            'moderated_at' => now(),
        ]);
        return response()->json(['message' => 'Message moderated.']);
    }
}
