<?php

namespace Database\Seeders;

use App\Models\Specialization;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SpecializationSeeder extends Seeder
{
    public function run(): void
    {
        $specializations = [
            'Depression & Mood',
            'Anxiety & Stress',
            'Addiction & Substance Use',
            'Gambling Recovery',
            'Trauma & PTSD',
            'Relationship Counseling',
            'Grief & Loss',
            'Child & Adolescent Mental Health',
            'Workplace Stress',
            'Eating Disorders',
            'OCD & Intrusive Thoughts',
            'Tobacco Cessation',
            'Sleep Hygiene & Insomnia',
        ];

        foreach ($specializations as $name) {
            Specialization::firstOrCreate(
                ['name' => $name],
                ['slug' => Str::slug($name)]
            );
        }
    }
}
