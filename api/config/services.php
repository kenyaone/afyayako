<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'anthropic' => [
        'key' => env('ANTHROPIC_API_KEY'),
    ],

    'pesapal' => [
        'consumer_key' => env('PESAPAL_CONSUMER_KEY'),
        'consumer_secret' => env('PESAPAL_CONSUMER_SECRET'),
        'env' => env('PESAPAL_ENV', 'sandbox'),
        'callback_url' => env('PESAPAL_CALLBACK_URL', 'https://api.uberhealth.co.ke/api/payments/pesapal/callback'),
        'ipn_id' => env('PESAPAL_IPN_ID'),
    ],

    /**
     * KMPDC License Verification
     * Kenya Medical Practitioners and Dentists Council
     * Contact: info@kmpdc.or.ke | Phone: +254-20-271-4000
     */
    'kmpdc' => [
        'enabled' => env('KMPDC_ENABLED', false),
        'base_url' => env('KMPDC_BASE_URL', 'https://api.kmpdc.or.ke'),
        'api_key' => env('KMPDC_API_KEY'),
        'username' => env('KMPDC_USERNAME'),
        'password' => env('KMPDC_PASSWORD'),
        'timeout' => env('KMPDC_TIMEOUT', 10),
        'cache_duration' => env('KMPDC_CACHE_DAYS', 30),
    ],

    /**
     * CPB License Verification (Future)
     * Counsellors and Psychologists Board - Kenya
     */
    'cpb' => [
        'enabled' => env('CPB_ENABLED', false),
        'base_url' => env('CPB_BASE_URL', 'https://api.cpb.or.ke'),
        'api_key' => env('CPB_API_KEY'),
        'username' => env('CPB_USERNAME'),
        'password' => env('CPB_PASSWORD'),
    ],

];
