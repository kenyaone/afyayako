<?php

/**
 * Jitsi-as-a-Service (JaaS) configuration.
 *
 * Sign up at https://jaas.8x8.vc — you get:
 *  - APP_ID  (also called "AppID" or "vpaas-magic-cookie-...")
 *  - KID     (public key identifier, format "vpaas-magic-cookie-.../KEY_ID")
 *  - Private key (PEM file, download once, keep OUT of git)
 *
 * Place the PEM file somewhere OUTSIDE public_html but readable by PHP,
 * eg. /home/qnztnquh/api-secrets/jaas-private.pem, then point
 * JAAS_PRIVATE_KEY_PATH at it.
 *
 * When JAAS_ENABLED=false (or unset) the app falls back to the previous
 * public Jitsi mirror — fine for local dev, unsafe for prod.
 */
return [
    'enabled'          => filter_var(env('JAAS_ENABLED', false), FILTER_VALIDATE_BOOLEAN),
    'app_id'           => env('JAAS_APP_ID', ''),
    'kid'              => env('JAAS_KID', ''),
    'private_key_path' => env('JAAS_PRIVATE_KEY_PATH', ''),
    'domain'           => env('JAAS_DOMAIN', '8x8.vc'),
    // How long a minted room-join token stays valid (seconds).
    // Long enough to cover any session, short enough that a leaked URL rots.
    'token_ttl'        => (int) env('JAAS_TOKEN_TTL', 4 * 3600),
];
