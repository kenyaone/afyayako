<?php

namespace App\Services;

class CrisisDetector
{
    const CRISIS_KEYWORDS = [
        'suicide',
        'kill myself',
        'end my life',
        'want to die',
        'better off dead',
        'overdose',
        'self harm',
        'cut myself',
        'hurt myself',
        'no point living',
        'kujiua',
        'kujidhuru',
    ];

    public function checkText(string $text): bool
    {
        $text = strtolower($text);
        foreach (self::CRISIS_KEYWORDS as $keyword) {
            if (str_contains($text, $keyword)) {
                return true;
            }
        }
        return false;
    }

    public function getDetectedKeywords(string $text): array
    {
        $text = strtolower($text);
        $detected = [];
        foreach (self::CRISIS_KEYWORDS as $keyword) {
            if (str_contains($text, $keyword)) {
                $detected[] = $keyword;
            }
        }
        return $detected;
    }

    public function detectSeverity(bool $isCrisis, string $source): string
    {
        if (!$isCrisis) {
            return 'low';
        }

        return match ($source) {
            'assessment' => 'critical',
            'mood_log', 'craving_log' => 'high',
            default => 'high',
        };
    }
}
