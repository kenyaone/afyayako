<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name'             => 'Free',
                'tier'             => 'free',
                'price_kes'        => 0.00,
                'interval'         => 'monthly',
                'features'         => [
                    '3 assessments/month',
                    '8 lessons/month',
                    'Mood tracking',
                    'Sobriety tracker',
                ],
                'assessment_limit' => 3,
                'lesson_limit'     => 8,
                'is_active'        => true,
            ],
            [
                'name'             => 'Premium',
                'tier'             => 'premium',
                'price_kes'        => 999.00,
                'interval'         => 'monthly',
                'features'         => [
                    'Unlimited assessments',
                    'Unlimited lessons',
                    'Priority booking',
                    'PDF reports',
                ],
                'assessment_limit' => -1,
                'lesson_limit'     => -1,
                'is_active'        => true,
            ],
            [
                'name'             => 'Professional Pro',
                'tier'             => 'pro',
                'price_kes'        => 1999.00,
                'interval'         => 'monthly',
                'features'         => [
                    'Professional profile',
                    'Session management',
                    'Payout dashboard',
                ],
                'assessment_limit' => -1,
                'lesson_limit'     => -1,
                'is_active'        => true,
            ],
        ];

        foreach ($plans as $plan) {
            Plan::firstOrCreate(
                ['name' => $plan['name'], 'tier' => $plan['tier']],
                $plan
            );
        }
    }
}
