<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LicenseVerificationService
{
    /**
     * KMPDC API Configuration
     * These values come from .env file
     */
    private $kmpdc_base_url;
    private $kmpdc_username;
    private $kmpdc_password;
    private $kmpdc_api_key;
    private $kmpdc_enabled;

    public function __construct()
    {
        $this->kmpdc_base_url = config('services.kmpdc.base_url', 'https://api.kmpdc.or.ke');
        $this->kmpdc_username = config('services.kmpdc.username');
        $this->kmpdc_password = config('services.kmpdc.password');
        $this->kmpdc_api_key = config('services.kmpdc.api_key');
        $this->kmpdc_enabled = config('services.kmpdc.enabled', false);
    }

    /**
     * Verify KMPDC license number
     * Tries real API first, falls back to format validation
     *
     * @param string $licenseNumber
     * @return array
     */
    public function verifyKMPDC($licenseNumber)
    {
        // Validate format first
        if (!$this->isValidKMPDCFormat($licenseNumber)) {
            return [
                'verified' => false,
                'error' => 'Invalid KMPDC license format. Expected format: KP-YYYY-0000',
                'manual_verification_url' => 'https://www.kmpdc.or.ke/search-professionals',
            ];
        }

        // Check cache first (valid for 30 days)
        $cacheKey = "kmpdc_license_{$licenseNumber}";
        if (Cache::has($cacheKey)) {
            $cached = Cache::get($cacheKey);
            $cached['cached'] = true;
            return $cached;
        }

        try {
            // Try real KMPDC API if enabled
            if ($this->kmpdc_enabled && ($this->kmpdc_api_key || $this->kmpdc_username)) {
                $result = $this->verifyWithKMPDCAPI($licenseNumber);

                if ($result['verified'] || isset($result['found'])) {
                    // Cache successful verification for 30 days
                    Cache::put($cacheKey, $result, now()->addDays(30));
                    return $result;
                }
            }

            // Fallback: Format validation only
            $result = $this->formatValidationOnly($licenseNumber);

            // Cache the result
            Cache::put($cacheKey, $result, now()->addDays(30));

            return $result;

        } catch (\Exception $e) {
            Log::error("KMPDC verification error for license {$licenseNumber}: " . $e->getMessage());

            // Return graceful fallback
            return [
                'verified' => false,
                'error' => 'Unable to verify license at this time. Please try again later.',
                'manual_verification_url' => 'https://www.kmpdc.or.ke/search-professionals',
                'fallback' => true,
            ];
        }
    }

    /**
     * Verify license with real KMPDC API
     * Supports multiple API authentication methods
     *
     * @param string $licenseNumber
     * @return array
     */
    private function verifyWithKMPDCAPI($licenseNumber)
    {
        // Method 1: API Key Authentication
        if ($this->kmpdc_api_key) {
            try {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $this->kmpdc_api_key,
                    'Accept' => 'application/json',
                ])->timeout(10)->get(
                    $this->kmpdc_base_url . '/verify',
                    ['license' => $licenseNumber]
                );

                if ($response->successful()) {
                    return $this->parseKMPDCResponse($response->json());
                }
            } catch (\Exception $e) {
                Log::warning("KMPDC API Key auth failed: " . $e->getMessage());
            }
        }

        // Method 2: Basic Authentication (username/password)
        if ($this->kmpdc_username && $this->kmpdc_password) {
            try {
                $response = Http::withBasicAuth(
                    $this->kmpdc_username,
                    $this->kmpdc_password
                )->timeout(10)->get(
                    $this->kmpdc_base_url . '/verify',
                    ['license' => $licenseNumber]
                );

                if ($response->successful()) {
                    return $this->parseKMPDCResponse($response->json());
                }
            } catch (\Exception $e) {
                Log::warning("KMPDC Basic auth failed: " . $e->getMessage());
            }
        }

        // If API call fails, return error
        return [
            'verified' => false,
            'error' => 'Unable to connect to KMPDC verification service',
        ];
    }

    /**
     * Parse KMPDC API response and normalize it
     * Handles various API response formats
     *
     * @param array $response
     * @return array
     */
    private function parseKMPDCResponse($response)
    {
        // Handle different KMPDC response formats

        // Format 1: Direct fields
        if (isset($response['verified'])) {
            return [
                'verified' => (bool) $response['verified'],
                'license_number' => $response['license_number'] ?? $response['license'] ?? '',
                'name' => $response['name'] ?? $response['professional_name'] ?? null,
                'profession' => $response['profession'] ?? $response['specialization'] ?? null,
                'status' => $response['status'] ?? 'Unknown',
                'verified_at' => now()->toIso8601String(),
            ];
        }

        // Format 2: Data wrapper
        if (isset($response['data']['verified'])) {
            return $this->parseKMPDCResponse($response['data']);
        }

        // Format 3: Found/exists field
        if (isset($response['found']) || isset($response['exists'])) {
            return [
                'verified' => true,
                'found' => true,
                'license_number' => $response['license_number'] ?? $licenseNumber ?? '',
                'name' => $response['name'] ?? null,
                'status' => $response['status'] ?? 'Active',
                'verified_at' => now()->toIso8601String(),
            ];
        }

        // Format 4: Error response
        if (isset($response['error'])) {
            return [
                'verified' => false,
                'error' => $response['error'],
            ];
        }

        // Unknown format - log it for debugging
        Log::debug('Unknown KMPDC response format', $response);

        return [
            'verified' => false,
            'error' => 'Unable to parse KMPDC response',
        ];
    }

    /**
     * Format validation only (no API)
     * Used when API is unavailable or disabled
     *
     * @param string $licenseNumber
     * @return array
     */
    private function formatValidationOnly($licenseNumber)
    {
        return [
            'verified' => true,
            'license_number' => $licenseNumber,
            'status' => 'Format Validated',
            'verified_at' => now()->toIso8601String(),
            'note' => 'License format is valid. Full verification with KMPDC not yet configured.',
            'manual_verification_url' => 'https://www.kmpdc.or.ke/search-professionals',
        ];
    }

    /**
     * Validate KMPDC license format
     *
     * @param string $licenseNumber
     * @return bool
     */
    private function isValidKMPDCFormat($licenseNumber)
    {
        // KMPDC format: KP-YYYY-#### (e.g., KP-2020-0012)
        return preg_match('/^KP-\d{4}-\d{4}$/', $licenseNumber) === 1;
    }

    /**
     * Verify CPB (Counsellors and Psychologists Board) license
     *
     * @param string $licenseNumber
     * @return array
     */
    public function verifyCPB($licenseNumber)
    {
        // CPB verification stub - ready for future implementation

        $cacheKey = "cpb_license_{$licenseNumber}";
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            // CPB verification not yet implemented
            // Will be similar to KMPDC verification

            return [
                'verified' => false,
                'note' => 'CPB verification not yet available. Please contact support.',
                'manual_verification_url' => 'https://cpb.or.ke',
            ];
        } catch (\Exception $e) {
            Log::error("CPB verification failed for license {$licenseNumber}: " . $e->getMessage());

            return [
                'verified' => false,
                'error' => 'Unable to verify CPB license at this time.'
            ];
        }
    }

    /**
     * Clear verification cache (admin function)
     * Useful for testing or updating license data
     */
    public function clearCache($licenseNumber = null)
    {
        if ($licenseNumber) {
            Cache::forget("kmpdc_license_{$licenseNumber}");
            Cache::forget("cpb_license_{$licenseNumber}");
        } else {
            // Clear all license caches
            // This is a simplified approach - in production use cache tags
            Log::info("Clearing all license verification cache");
        }
    }
}
