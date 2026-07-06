<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Adds `pricing_model` to eap_tiers and switches Small to a FLAT
 * KSh 25,000/month for teams of up to 50 employees. The old per-
 * employee pricing (KSh 490/emp/mo) is superseded — small buyers
 * budget more easily on a fixed monthly line item.
 *
 * pricing_model values:
 *   flat_monthly       — price_kes_annual = flat annual total
 *   per_employee_month — price_kes_annual = annual per-employee total
 *   custom             — quoted per deal (Large)
 *
 * Idempotent.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('eap_tiers', 'pricing_model')) {
            Schema::table('eap_tiers', function (Blueprint $t) {
                $t->string('pricing_model', 30)
                  ->default('per_employee_month')
                  ->after('price_kes_annual');
            });
        }

        // Small — FLAT KSh 25,000 / month → 300,000 / year
        DB::table('eap_tiers')->where('name', 'Small')->update([
            'price_kes_annual'      => 300000,
            'pricing_model'         => 'flat_monthly',
            'sessions_per_employee' => 4,
            'features'              => json_encode([
                'Flat KSh 25,000 / month — teams up to 50',
                '24/7 crisis helpline',
                'Depression, anxiety, and burnout support',
                'Alcohol, substance-use, and betting/gambling recovery',
                'Unlimited tele-therapy',
                'Up to 4 in-person sessions per employee / month',
                'KMPDC- and CPB-verified therapists',
                'Anonymous employee usage',
                'Monthly usage reports',
            ]),
            'updated_at' => now(),
        ]);

        // Medium — per-employee, unchanged rate but refreshed features
        DB::table('eap_tiers')->where('name', 'Medium')->update([
            'pricing_model'         => 'per_employee_month',
            'sessions_per_employee' => 4,
            'features'              => json_encode([
                'Everything in Small',
                'Depression, anxiety, burnout, addictions (alcohol / substance / gambling)',
                'Dedicated success manager',
                'Quarterly reviews',
                'Manager mental-health training webinar',
                'Custom onboarding materials',
            ]),
            'updated_at' => now(),
        ]);

        // Large — custom
        DB::table('eap_tiers')->where('name', 'Large')->update([
            'pricing_model'         => 'custom',
            'sessions_per_employee' => 4,
            'features'              => json_encode([
                'Everything in Medium',
                'Custom pricing tailored to your organisation',
                'Named account manager',
                'SLA guarantees',
                'On-site workshops',
                'Executive coaching option',
            ]),
            'updated_at' => now(),
        ]);
    }

    public function down(): void {}
};
