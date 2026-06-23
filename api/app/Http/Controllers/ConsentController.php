<?php

namespace App\Http\Controllers;

use App\Models\UserConsent;
use App\Support\TelehealthConsent;
use Illuminate\Http\Request;

class ConsentController extends Controller
{
    /**
     * Public: the current tele-mental health informed-consent document.
     */
    public function document()
    {
        return response()->json(TelehealthConsent::document());
    }

    /**
     * Authenticated: whether the user has accepted the current document version.
     */
    public function status()
    {
        $user = auth('api')->user();
        $accepted = self::hasCurrentConsent($user->id);

        return response()->json([
            'type'              => 'telehealth',
            'current_version'   => TelehealthConsent::VERSION,
            'accepted'          => $accepted !== null,
            'accepted_version'  => $accepted?->version,
            'accepted_at'       => $accepted?->accepted_at,
        ]);
    }

    /**
     * Authenticated: record explicit acceptance of the current document.
     */
    public function accept(Request $request)
    {
        $user = auth('api')->user();
        $consent = self::record($user->id, $request->ip(), 'explicit');

        return response()->json([
            'message' => 'Consent recorded.',
            'consent' => $consent,
        ], 201);
    }

    // ─── Shared helpers (used by booking flow too) ────────────────────────────

    public static function hasCurrentConsent(int $userId): ?UserConsent
    {
        return UserConsent::where('user_id', $userId)
            ->where('type', 'telehealth')
            ->where('version', TelehealthConsent::VERSION)
            ->latest('accepted_at')
            ->first();
    }

    /**
     * Idempotently record a telehealth consent for the current version.
     */
    public static function record(int $userId, ?string $ip, string $source = 'explicit'): UserConsent
    {
        $existing = self::hasCurrentConsent($userId);
        if ($existing) {
            return $existing;
        }

        return UserConsent::create([
            'user_id'      => $userId,
            'type'         => 'telehealth',
            'version'      => TelehealthConsent::VERSION,
            'content_hash' => TelehealthConsent::hash(),
            'accepted_at'  => now(),
            'ip_address'   => $ip,
            'source'       => $source,
        ]);
    }
}
