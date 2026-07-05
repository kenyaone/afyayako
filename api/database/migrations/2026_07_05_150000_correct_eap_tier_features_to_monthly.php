<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Corrects the EAP tier feature copy from ANNUAL to MONTHLY.
 * Business model: monthly per-employee subscription, capped at 4
 * sessions per employee per month.
 *
 * price_kes_annual continues to store per-employee ANNUAL cost
 * (monthly × 12) — the field name is retained for backwards
 * compatibility. The frontend and invoice divide by 12 for display.
 */
return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        DB::table('eap_tiers')->where('name', 'Small')->update([
            'sessions_per_employee' => 4,
            'features' => json_encode([
                '24/7 crisis helpline',
                'Unlimited tele-therapy',
                'Up to 4 in-person sessions per employee / month',
                'KMPDC- and CPB-verified therapists',
                'Anonymous employee usage',
                'Monthly usage reports',
            ]),
            'updated_at' => $now,
        ]);

        DB::table('eap_tiers')->where('name', 'Medium')->update([
            'sessions_per_employee' => 4,
            'features' => json_encode([
                'Everything in Small',
                'Dedicated success manager',
                'Quarterly reviews',
                'Manager mental-health training webinar',
                'Custom onboarding materials',
            ]),
            'updated_at' => $now,
        ]);

        DB::table('eap_tiers')->where('name', 'Large')->update([
            'sessions_per_employee' => 4,
            'features' => json_encode([
                'Everything in Medium',
                'Custom pricing tailored to your organization',
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
