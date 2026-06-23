<?php

return [
    'consumer_key' => env('MPESA_CONSUMER_KEY'),
    'consumer_secret' => env('MPESA_CONSUMER_SECRET'),
    'shortcode' => env('MPESA_SHORTCODE', '174379'),
    'passkey' => env('MPESA_PASSKEY'),
    'callback_url' => env('MPESA_CALLBACK_URL'),
    'env' => env('MPESA_ENV', 'sandbox'),
    'b2c_initiator' => env('MPESA_B2C_INITIATOR_NAME'),
    'b2c_credential' => env('MPESA_B2C_SECURITY_CREDENTIAL'),
    'b2c_timeout_url' => env('MPESA_B2C_TIMEOUT_URL'),
    'b2c_result_url' => env('MPESA_B2C_RESULT_URL'),
];
