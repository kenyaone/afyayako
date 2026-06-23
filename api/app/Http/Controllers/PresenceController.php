<?php

namespace App\Http\Controllers;

use App\Models\UserPresence;
use Illuminate\Http\Request;

class PresenceController extends Controller
{
    // Called every 25s from every authenticated frontend tab
    public function heartbeat(Request $request)
    {
        $user = auth('api')->user();

        UserPresence::updateOrCreate(
            ['user_id' => $user->id],
            [
                'last_seen_at' => now(),
                'is_online'    => true,
                'status'       => 'online',
                'current_page' => $request->input('page'),
            ]
        );

        return response()->json(['status' => 'ok', 'ts' => now()->toISOString()]);
    }

    // Called when user deliberately goes offline (logout / tab close via beacon)
    public function offline()
    {
        $user = auth('api')->user();

        UserPresence::where('user_id', $user->id)->update([
            'is_online' => false,
            'status'    => 'offline',
        ]);

        return response()->json(['status' => 'ok']);
    }

    // Set / clear typing indicator for a consultation
    public function typing(Request $request)
    {
        $user  = auth('api')->user();
        $cid   = $request->input('consultation_id');
        $isTyping = $request->boolean('is_typing', true);

        UserPresence::updateOrCreate(
            ['user_id' => $user->id],
            [
                'last_seen_at'                 => now(),
                'is_online'                    => true,
                'status'                       => 'online',
                'typing_in_consultation_id'    => $isTyping ? $cid : null,
                'typing_updated_at'            => now(),
            ]
        );

        return response()->json(['status' => 'ok']);
    }

    // Who is present in a given consultation (for JoinSession polling)
    public function consultationPresence(string $consultationId)
    {
        $cutoff = UserPresence::onlineCutoff();
        $typingCutoff = now()->subSeconds(5); // typing expires after 5s of no update

        $present = UserPresence::with('user:id,display_name,role,avatar')
            ->where('last_seen_at', '>=', $cutoff)
            ->where('current_page', 'like', "%session/{$consultationId}%")
            ->get()
            ->map(fn($p) => [
                'user_id'      => $p->user_id,
                'display_name' => $p->user?->display_name,
                'role'         => $p->user?->role,
                'is_typing'    => $p->typing_in_consultation_id == $consultationId
                    && $p->typing_updated_at
                    && $p->typing_updated_at->gte($typingCutoff),
                'last_seen_at' => $p->last_seen_at?->toISOString(),
            ]);

        return response()->json(['present' => $present]);
    }

    // List of online professional user IDs (for green dots in directory).
    // NOTE: the current standalone Professional model has no user_id link and no
    // is_available_online flag, so per-professional online presence cannot be
    // derived yet. Return an empty set so the frontend contract is preserved
    // without erroring. Revisit when professionals gain a user link / presence flag.
    public function onlineProfessionals()
    {
        return response()->json(['online_user_ids' => []]);
    }

    // Bulk presence status for a list of user IDs (e.g. consultation partner)
    public function status(Request $request)
    {
        $ids    = (array) $request->input('user_ids', []);
        $cutoff = UserPresence::onlineCutoff();
        $away   = UserPresence::awayCutoff();

        $rows = UserPresence::whereIn('user_id', $ids)->get()->keyBy('user_id');

        $result = collect($ids)->mapWithKeys(function ($uid) use ($rows, $cutoff, $away) {
            $p = $rows->get($uid);
            if (!$p) return [$uid => ['status' => 'offline', 'last_seen_at' => null]];

            if ($p->last_seen_at >= $cutoff)  $status = 'online';
            elseif ($p->last_seen_at >= $away) $status = 'away';
            else                               $status = 'offline';

            return [$uid => [
                'status'      => $status,
                'last_seen_at' => $p->last_seen_at?->toISOString(),
            ]];
        });

        return response()->json(['presence' => $result]);
    }
}
