<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Adds "Critical incident group debrief" to every tier's features list.
 * Idempotent — regenerates the features array whether or not the line
 * was already there.
 *
 * Response SLA differs by tier:
 *   Small   — within 72h
 *   Medium  — within 48h
 *   Large   — within 24h
 */
return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        DB::table('eap_tiers')->where('name', 'Small')->update([
            'features' => json_encode([
                'Flat KSh 25,000 / month — teams up to 50',
                '24/7 crisis helpline',
                'Depression, anxiety, and burnout support',
                'Alcohol, substance-use, and betting/gambling recovery',
                'Unlimited tele-therapy',
                'Up to 4 in-person sessions per employee / month',
                'Critical incident group debrief (within 72h)',
                'CPB-licensed therapists',
                'Anonymous employee usage',
                'Monthly usage reports',
            ]),
            'updated_at' => $now,
        ]);

        DB::table('eap_tiers')->where('name', 'Medium')->update([
            'features' => json_encode([
                'Everything in Small',
                'Critical incident group debrief (within 48h)',
                'Depression, anxiety, burnout, addictions (alcohol / substance / gambling)',
                'Dedicated success manager',
                'Quarterly reviews',
                'Manager mental-health training webinar',
                'Custom onboarding materials',
            ]),
            'updated_at' => $now,
        ]);

        DB::table('eap_tiers')->where('name', 'Large')->update([
            'features' => json_encode([
                'Everything in Medium',
                'Critical incident group debrief (within 24h) + on-site option',
                'Custom pricing tailored to your organisation',
                'Named account manager',
                'SLA guarantees',
                'On-site workshops',
                'Executive coaching option',
            ]),
            'updated_at' => $now,
        ]);
    }

    public function down(): void {}
};
