<?php

namespace App\Support;

/**
 * Single source of truth for national emergency / referral lines.
 *
 * Mirrors the toll-free lines published in the Kenya MoH National
 * Tele-Mental Health Guidelines (January 2021) — "Toll Free Lines for
 * Referral" and Guideline 6 (Emergency Planning).
 */
class Hotlines
{
    /**
     * Full referral/emergency directory used by crisis screens and
     * safety-plan defaults.
     *
     * @return array<int, array{name:string, phone:string, available:string, category:string}>
     */
    public static function all(): array
    {
        return [
            ['name' => 'Free Counselling (Kenya Red Cross)', 'phone' => '1199',         'available' => '24/7', 'category' => 'counselling'],
            ['name' => 'LVCT — General Counselling',          'phone' => '1190',         'available' => '24/7', 'category' => 'counselling'],
            ['name' => 'NACADA — Substance Abuse Counselling', 'phone' => '1192',        'available' => '24/7', 'category' => 'substance'],
            ['name' => 'Befrienders Kenya — Suicide Support',  'phone' => '0800 723 253', 'available' => '24/7', 'category' => 'suicide'],
            ['name' => 'Health Care Worker Counselling',       'phone' => '0800 720 608', 'available' => '24/7', 'category' => 'counselling'],
            ['name' => 'COVID-19 Helpline (MoH)',              'phone' => '719',          'available' => '24/7', 'category' => 'health'],
            ['name' => 'Childline Kenya / Child Help Line',    'phone' => '116',          'available' => '24/7', 'category' => 'child'],
            ['name' => 'Gender Based Violence',                'phone' => '21094',        'available' => '24/7', 'category' => 'gbv'],
            ['name' => 'GBV — SMS Help',                       'phone' => '1198',         'available' => '24/7', 'category' => 'gbv'],
            ['name' => 'GBV for Men',                          'phone' => '1195 / 1196',  'available' => '24/7', 'category' => 'gbv'],
            ['name' => 'Persons With Disability — SMS',        'phone' => '21094 / 20767', 'available' => '24/7', 'category' => 'disability'],
            ['name' => 'Police',                               'phone' => '999 / 911 / 112', 'available' => '24/7', 'category' => 'emergency'],
            ['name' => 'NMS Emergency / Ambulance',            'phone' => '0800 720 541 · 0110 008 608 · 0110 008 609', 'available' => '24/7', 'category' => 'emergency'],
        ];
    }

    /**
     * Compact default list embedded into a new safety plan's crisis resources.
     *
     * @return array<int, array{name:string, phone:string, available:string}>
     */
    public static function safetyPlanDefaults(): array
    {
        return [
            ['name' => 'Free Counselling (Kenya Red Cross)', 'phone' => '1199',         'available' => '24/7'],
            ['name' => 'Befrienders Kenya — Suicide Support', 'phone' => '0800 723 253', 'available' => '24/7'],
            ['name' => 'NACADA Helpline',                     'phone' => '1192',         'available' => '24/7'],
            ['name' => 'Emergency / Police',                  'phone' => '999 / 112',    'available' => '24/7'],
            ['name' => 'NMS Ambulance',                       'phone' => '0800 720 541', 'available' => '24/7'],
        ];
    }
}
