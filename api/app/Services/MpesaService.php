<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MpesaService
{
    protected string $env;
    protected string $baseUrl;

    public function __construct()
    {
        $this->env = config('mpesa.env', 'sandbox');
        $this->baseUrl = $this->env === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';
    }

    public function getAccessToken(): string
    {
        $consumerKey = config('mpesa.consumer_key');
        $consumerSecret = config('mpesa.consumer_secret');

        $response = Http::withBasicAuth($consumerKey, $consumerSecret)
            ->get("{$this->baseUrl}/oauth/v1/generate?grant_type=client_credentials");

        if ($response->failed()) {
            Log::error('M-Pesa OAuth failed', ['response' => $response->body()]);
            throw new \Exception('Failed to get M-Pesa access token');
        }

        return $response->json('access_token');
    }

    public function stkPush(string $phone, float $amount, string $accountRef, string $description): array
    {
        $token = $this->getAccessToken();
        $shortcode = config('mpesa.shortcode');
        $passkey = config('mpesa.passkey');
        $timestamp = now()->format('YmdHis');
        $password = base64_encode($shortcode . $passkey . $timestamp);

        // Normalize phone: 2547XXXXXXXX
        $phone = $this->normalizePhone($phone);

        $payload = [
            'BusinessShortCode' => $shortcode,
            'Password' => $password,
            'Timestamp' => $timestamp,
            'TransactionType' => 'CustomerPayBillOnline',
            'Amount' => (int) ceil($amount),
            'PartyA' => $phone,
            'PartyB' => $shortcode,
            'PhoneNumber' => $phone,
            'CallBackURL' => config('mpesa.callback_url'),
            'AccountReference' => $accountRef,
            'TransactionDesc' => $description,
        ];

        $response = Http::withToken($token)
            ->post("{$this->baseUrl}/mpesa/stkpush/v1/processrequest", $payload);

        if ($response->failed()) {
            Log::error('M-Pesa STK Push failed', ['response' => $response->body()]);
            throw new \Exception('STK Push initiation failed');
        }

        return $response->json();
    }

    public function b2cPayout(string $phone, float $amount, string $remarks): array
    {
        $token = $this->getAccessToken();
        $phone = $this->normalizePhone($phone);

        $payload = [
            'InitiatorName' => config('mpesa.b2c_initiator'),
            'SecurityCredential' => config('mpesa.b2c_credential'),
            'CommandID' => 'BusinessPayment',
            'Amount' => (int) floor($amount),
            'PartyA' => config('mpesa.shortcode'),
            'PartyB' => $phone,
            'Remarks' => $remarks,
            'QueueTimeOutURL' => config('mpesa.b2c_timeout_url'),
            'ResultURL' => config('mpesa.b2c_result_url'),
            'Occasion' => 'ProfessionalPayout',
        ];

        $response = Http::withToken($token)
            ->post("{$this->baseUrl}/mpesa/b2c/v1/paymentrequest", $payload);

        if ($response->failed()) {
            Log::error('M-Pesa B2C failed', ['response' => $response->body()]);
            throw new \Exception('B2C payout initiation failed');
        }

        return $response->json();
    }

    protected function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/\D/', '', $phone);
        if (str_starts_with($phone, '0')) {
            $phone = '254' . substr($phone, 1);
        } elseif (str_starts_with($phone, '+')) {
            $phone = substr($phone, 1);
        }
        return $phone;
    }
}
