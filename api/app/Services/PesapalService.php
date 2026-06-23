<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PesapalService
{
    private string $consumerKey;
    private string $consumerSecret;
    private string $apiUrl;
    private ?string $notificationId;

    public function __construct()
    {
        $this->consumerKey = config('services.pesapal.consumer_key');
        $this->consumerSecret = config('services.pesapal.consumer_secret');
        $this->notificationId = config('services.pesapal.ipn_id');
        $env = config('services.pesapal.env', 'sandbox');

        // PesaPal API 3.0 base URLs
        if ($env === 'production') {
            $this->apiUrl = 'https://pay.pesapal.com/v3';
        } else {
            $this->apiUrl = 'https://cybqa.pesapal.com/pesapalv3';
        }
    }

    /**
     * Get authentication token from PesaPal
     */
    public function getAuthToken(): string
    {
        try {
            $response = Http::post("{$this->apiUrl}/api/Auth/RequestToken", [
                'consumer_key'    => $this->consumerKey,
                'consumer_secret' => $this->consumerSecret,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['token'] ?? '';
            }

            Log::error('PesaPal token request failed', ['response' => $response->body()]);
            throw new \Exception('Failed to get authentication token');
        } catch (\Exception $e) {
            Log::error('PesaPal authentication error', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Initiate payment
     */
    public function initiatePayment(
        string $orderTrackingId,
        float $amount,
        string $description,
        string $callbackUrl,
        string $redirectUrl,
        ?string $phone = null,
        ?string $email = null
    ): array {
        try {
            if (empty($this->notificationId)) {
                Log::error('PesaPal IPN id (notification_id) not configured');
                return ['success' => false, 'error' => 'Payment is not configured (missing IPN registration)'];
            }

            $token = $this->getAuthToken();

            // PesaPal API 3.0 SubmitOrderRequest payload
            $payload = [
                'id' => $orderTrackingId,
                'currency' => 'KES',
                'amount' => $amount,
                'description' => $description,
                'callback_url' => $callbackUrl,
                'notification_id' => $this->notificationId,
                'billing_address' => [
                    'email_address' => $email,
                    'phone_number' => $phone,
                ],
            ];

            $response = Http::withToken($token)
                ->post("{$this->apiUrl}/api/Transactions/SubmitOrderRequest", $payload);

            $data = $response->json();

            if ($response->successful() && empty($data['error']) && !empty($data['redirect_url'])) {
                return [
                    'success' => true,
                    'order_tracking_id' => $data['order_tracking_id'] ?? null,
                    'redirect_url' => $data['redirect_url'] ?? null,
                ];
            }

            Log::error('PesaPal payment initiation failed', ['response' => $response->body()]);
            $message = $data['error']['message'] ?? 'Payment initiation failed';
            return ['success' => false, 'error' => $message];
        } catch (\Exception $e) {
            Log::error('PesaPal payment error', ['error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get transaction status
     */
    public function getTransactionStatus(string $orderTrackingId): array
    {
        try {
            $token = $this->getAuthToken();

            $response = Http::withToken($token)
                ->get("{$this->apiUrl}/api/Transactions/GetTransactionStatus", [
                    'orderTrackingId' => $orderTrackingId,
                ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('PesaPal status check failed', ['response' => $response->body()]);
            return ['success' => false];
        } catch (\Exception $e) {
            Log::error('PesaPal status error', ['error' => $e->getMessage()]);
            return ['success' => false];
        }
    }

    /**
     * Verify payment callback
     */
    public function verifyCallback(array $data): bool
    {
        // PesaPal sends a GET request with order_tracking_id
        // You should verify the status via getTransactionStatus()
        return isset($data['order_tracking_id']);
    }
}
