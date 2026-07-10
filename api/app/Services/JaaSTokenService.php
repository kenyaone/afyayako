<?php

namespace App\Services;

use App\Models\Consultation;
use App\Models\User;
use RuntimeException;

/**
 * Mints RS256 JWTs for Jitsi-as-a-Service room joins.
 *
 * A JaaS room only lets a browser in if the URL includes ?jwt=<token>
 * signed with the tenant's private key. This class does the signing
 * with PHP's built-in OpenSSL extension — no external JWT lib needed.
 *
 * Docs: https://developer.8x8.com/jaas/docs/api-keys-jwt
 */
class JaaSTokenService
{
    /**
     * Build the full JaaS meeting URL for a specific consultation + user.
     * Returns something like:
     *   https://8x8.vc/vpaas-magic-cookie-XXXX/cons-99519d5a?jwt=eyJhbGciOi...
     */
    public function meetingUrl(User $user, Consultation $consultation, bool $moderator): string
    {
        $appId  = config('jaas.app_id');
        $domain = config('jaas.domain');
        $room   = $consultation->jitsi_room;
        $token  = $this->mint($user, $consultation, $moderator);
        return "https://{$domain}/{$appId}/{$room}?jwt={$token}";
    }

    public function mint(User $user, Consultation $consultation, bool $moderator): string
    {
        $appId   = config('jaas.app_id');
        $kid     = config('jaas.kid');
        $keyPath = config('jaas.private_key_path');
        $ttl     = (int) config('jaas.token_ttl');

        if (!$appId || !$kid || !$keyPath) {
            throw new RuntimeException('JaaS credentials missing — set JAAS_APP_ID, JAAS_KID, JAAS_PRIVATE_KEY_PATH.');
        }
        if (!is_readable($keyPath)) {
            throw new RuntimeException("JaaS private key not readable at {$keyPath}");
        }
        $pem = file_get_contents($keyPath);
        $privateKey = openssl_pkey_get_private($pem);
        if (!$privateKey) {
            throw new RuntimeException('JaaS private key parse failed — is it a valid PEM?');
        }

        $now = time();
        $header = [
            'alg' => 'RS256',
            'typ' => 'JWT',
            'kid' => $kid,
        ];
        $payload = [
            'aud'  => 'jitsi',
            'iss'  => 'chat',
            'sub'  => $appId,
            'room' => $consultation->jitsi_room,
            'nbf'  => $now - 10,
            'exp'  => $now + $ttl,
            'context' => [
                'user' => [
                    'id'        => (string) $user->id,
                    'name'      => $user->display_name ?: ($user->username ?: 'Guest'),
                    'email'     => $user->email ?: '',
                    'moderator' => $moderator ? 'true' : 'false',
                ],
                'features' => [
                    // Explicitly gate paid/regulated features off. Enable per-role later
                    // if you want therapists to be able to record with consent.
                    'livestreaming' => 'false',
                    'recording'     => 'false',
                    'transcription' => 'false',
                    'outbound-call' => 'false',
                ],
            ],
        ];

        $seg1 = $this->b64url(json_encode($header, JSON_UNESCAPED_SLASHES));
        $seg2 = $this->b64url(json_encode($payload, JSON_UNESCAPED_SLASHES));
        $signingInput = "{$seg1}.{$seg2}";

        $signature = '';
        $ok = openssl_sign($signingInput, $signature, $privateKey, OPENSSL_ALGO_SHA256);
        if (!$ok) {
            throw new RuntimeException('JaaS JWT signing failed: '.openssl_error_string());
        }
        return "{$signingInput}.".$this->b64url($signature);
    }

    private function b64url(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
