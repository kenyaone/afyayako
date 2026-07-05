<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Replace old Starter/Professional/Enterprise EAP tiers with the
 * Kenya-market per-employee-monthly pricing model:
 *   Small   (up to 50 employees)   — KSh 490/employee/month
 *   Medium  (51–200 employees)     — KSh 1,000/employee/month
 *   Large   (200+ employees)       — Custom pricing
 *
 * price_kes_annual stores the per-employee ANNUAL price (monthly × 12).
 * price = 0 signals "custom pricing" for the Large tier.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Deactivate existing tiers (keep them for historical subscription references)
        DB::table('eap_tiers')->update(['is_active' => 0]);

        $now = now();
        $tiers = [
            [
                'name'                  => 'Small',
                'min_employees'         => 1,
                'max_employees'         => 50,
                'price_kes_annual'      => 5880,   // 490 * 12
                'sessions_per_employee' => 6,
                'features'              => json_encode([
                    '24/7 crisis helpline',
                    'Unlimited tele-therapy',
                    '6 face-to-face sessions per employee / year',
                    'KMPDC- and CPB-verified therapists',
                    'Anonymous employee usage',
                    'Monthly usage reports',
                ]),
                'is_active'             => 1,
                'created_at'            => $now,
                'updated_at'            => $now,
            ],
            [
                'name'                  => 'Medium',
                'min_employees'         => 51,
                'max_employees'         => 200,
                'price_kes_annual'      => 12000,  // 1000 * 12
                'sessions_per_employee' => 6,
                'features'              => json_encode([
                    'Everything in Small',
                    'Dedicated success manager',
                    'Quarterly reviews',
                    'Manager mental-health training webinar',
                    'Custom onboarding materials',
                ]),
                'is_active'             => 1,
                'created_at'            => $now,
                'updated_at'            => $now,
            ],
            [
                'name'                  => 'Large',
                'min_employees'         => 201,
                'max_employees'         => 100000,
                'price_kes_annual'      => 0,      // 0 = custom pricing
                'sessions_per_employee' => 6,
                'features'              => json_encode([
                    'Everything in Medium',
                    'Custom pricing tailored to your organization',
                    'Named account manager',
                    'SLA guarantees',
                    'On-site workshops',
                    'Executive coaching option',
                ]),
                'is_active'             => 1,
                'created_at'            => $now,
                'updated_at'            => $now,
            ],
        ];

        foreach ($tiers as $tier) {
            // Insert-or-reactivate. If a tier with this name exists, revive it.
            $existing = DB::table('eap_tiers')->where('name', $tier['name'])->first();
            if ($existing) {
                DB::table('eap_tiers')->where('id', $existing->id)->update($tier);
            } else {
                DB::table('eap_tiers')->insert($tier);
            }
        }
    }

    public function down(): void
    {
        // We don't automatically revert — old tiers are just deactivated,
        // and reverting the pricing would need explicit historical data.
        DB::table('eap_tiers')
            ->whereIn('name', ['Small', 'Medium', 'Large'])
            ->update(['is_active' => 0]);
    }
};
