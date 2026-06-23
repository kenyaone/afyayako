<?php

namespace App\Support;

/**
 * Maps an assessment severity label to a coarse tier.
 *
 * MoH Guideline 1 (AI in mental health care): chatbots/AI are appropriate
 * first-line support for MILD–MODERATE presentations; SEVERE presentations
 * should be referred to a human specialist. This class lets the AI layer
 * enforce that hand-off instead of treating all severities the same.
 */
class Severity
{
    /** High-severity labels across every instrument used on the platform. */
    private const SEVERE = [
        'Severe', 'Moderately Severe',
        'Possible Dependence', 'High Dependence', 'Very High Dependence',
        'Harmful Use',
        'Severe (Problem Gambling)', 'Problem Gambling',
    ];

    public static function isSevere(?string $severity): bool
    {
        if (!$severity) {
            return false;
        }
        foreach (self::SEVERE as $label) {
            if (strcasecmp(trim($severity), $label) === 0) {
                return true;
            }
        }
        // Defensive: any label literally containing "severe".
        return stripos($severity, 'severe') !== false;
    }
}
