<?php

namespace Database\Seeders;

use App\Models\Assessment;
use App\Models\Consultation;
use App\Models\Language;
use App\Models\Professional;
use App\Models\Specialization;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        // ── Sample patient ────────────────────────────────────────────────────
        $patient = User::firstOrCreate(
            ['username' => 'patient_demo'],
            [
                'display_name'        => 'Demo Patient',
                'email'               => 'patient@demo.afyayako',
                'password'            => Hash::make('Patient@2026!'),
                'role'                => 'user',
                'is_anonymous_mode'   => false,
            ]
        );

        // ── Sample professional user ──────────────────────────────────────────
        $proUser = User::firstOrCreate(
            ['username' => 'dr_kamau'],
            [
                'display_name'        => 'Dr. Kamau Njoroge',
                'email'               => 'kamau@demo.afyayako',
                'password'            => Hash::make('ProDemo@2026!'),
                'role'                => 'professional',
                'is_anonymous_mode'   => false,
            ]
        );

        // ── Professional profile ──────────────────────────────────────────────
        $pro = Professional::firstOrCreate(
            ['user_id' => $proUser->id],
            [
                'kmpdc_license'           => 'KMPDC-2019-4472',
                'bio'                     => 'Clinical psychologist with 7 years experience in depression, anxiety and addiction recovery. I use CBT and mindfulness-based approaches. I speak both English and Kiswahili.',
                'years_experience'        => 7,
                'rate_per_hour'           => 3000,
                'gender'                  => 'male',
                'rating'                  => 4.8,
                'total_reviews'           => 23,
                'verification_status'     => 'verified',
                'is_accepting_new_patients' => true,
                'mpesa_number'            => '0712345678',
            ]
        );

        // Attach specializations
        $specNames = ['Depression & Mood', 'Anxiety & Stress', 'Addiction & Substance Use', 'Trauma & PTSD'];
        $specIds = Specialization::whereIn('name', $specNames)->pluck('id');
        $pro->specializations()->syncWithoutDetaching($specIds);

        // Attach languages
        $langIds = Language::whereIn('name', ['English', 'Kiswahili'])->pluck('id');
        $pro->languages()->syncWithoutDetaching($langIds);

        // ── Second sample professional ────────────────────────────────────────
        $proUser2 = User::firstOrCreate(
            ['username' => 'dr_wambui'],
            [
                'display_name'        => 'Dr. Wambui Kariuki',
                'email'               => 'wambui@demo.afyayako',
                'password'            => Hash::make('ProDemo@2026!'),
                'role'                => 'professional',
                'is_anonymous_mode'   => false,
            ]
        );

        $pro2 = Professional::firstOrCreate(
            ['user_id' => $proUser2->id],
            [
                'kmpdc_license'           => 'KMPDC-2017-3301',
                'bio'                     => 'Counselling psychologist specialising in gambling recovery, addiction and relationship counselling. 9 years of practice. CBT-trained, empathetic approach.',
                'years_experience'        => 9,
                'rate_per_hour'           => 2500,
                'gender'                  => 'female',
                'rating'                  => 4.9,
                'total_reviews'           => 41,
                'verification_status'     => 'verified',
                'is_accepting_new_patients' => true,
                'mpesa_number'            => '0722345678',
            ]
        );

        $spec2Names = ['Gambling Recovery', 'Addiction & Substance Use', 'Anxiety & Stress', 'Depression & Mood'];
        $spec2Ids = Specialization::whereIn('name', $spec2Names)->pluck('id');
        $pro2->specializations()->syncWithoutDetaching($spec2Ids);
        $pro2->languages()->syncWithoutDetaching($langIds);

        // ── Sample consultations ──────────────────────────────────────────────
        // 1. Upcoming confirmed session (in 2 hours)
        $upcoming = Consultation::firstOrCreate(
            ['consultation_id' => 'demo-upcoming-001'],
            [
                'user_id'           => $patient->id,
                'professional_id'   => $pro->id,
                'scheduled_at'      => Carbon::now()->addHours(2),
                'duration_minutes'  => 60,
                'status'            => 'confirmed',
                'amount'            => 3000,
                'jitsi_room'        => 'demo-upcoming-001',
                'share_assessments' => true,
                'share_mood_logs'   => true,
            ]
        );

        // 2. Past completed session
        $past = Consultation::firstOrCreate(
            ['consultation_id' => 'demo-past-001'],
            [
                'user_id'           => $patient->id,
                'professional_id'   => $pro->id,
                'scheduled_at'      => Carbon::now()->subDays(7),
                'duration_minutes'  => 60,
                'status'            => 'completed',
                'amount'            => 3000,
                'jitsi_room'        => 'demo-past-001',
                'share_assessments' => true,
                'share_mood_logs'   => false,
                'professional_notes'=> "Patient presenting with moderate depressive symptoms. Reports improved sleep but persistent low motivation. Completed CBT worksheet on thought patterns. Plan: continue with behavioral activation exercises. Review mood logs before next session.",
                'user_rating'       => 5,
                'actual_start'      => Carbon::now()->subDays(7),
                'actual_end'        => Carbon::now()->subDays(7)->addHour(),
            ]
        );

        // ── Sample assessments for patient ────────────────────────────────────
        Assessment::firstOrCreate(
            ['user_id' => $patient->id, 'assessment_type' => 'phq9', 'created_at' => Carbon::now()->subDays(14)],
            [
                'score'       => 14,
                'severity'    => 'Moderate',
                'interpretation' => 'You are experiencing moderate symptoms of depression.',
                'recommendations'=> 'Speaking with a mental health professional is strongly recommended.',
                'responses'   => ['q1'=>2,'q2'=>2,'q3'=>1,'q4'=>2,'q5'=>1,'q6'=>2,'q7'=>1,'q8'=>1,'q9'=>0],
                'is_crisis_flag' => false,
            ]
        );

        Assessment::firstOrCreate(
            ['user_id' => $patient->id, 'assessment_type' => 'phq9', 'created_at' => Carbon::now()->subDays(1)],
            [
                'score'       => 10,
                'severity'    => 'Moderate',
                'interpretation' => 'You are experiencing moderate symptoms of depression that are improving.',
                'recommendations'=> 'Continue with your current support and therapy.',
                'responses'   => ['q1'=>1,'q2'=>2,'q3'=>1,'q4'=>2,'q5'=>1,'q6'=>1,'q7'=>1,'q8'=>1,'q9'=>0],
                'is_crisis_flag' => false,
            ]
        );

        Assessment::firstOrCreate(
            ['user_id' => $patient->id, 'assessment_type' => 'gad7', 'created_at' => Carbon::now()->subDays(3)],
            [
                'score'       => 8,
                'severity'    => 'Mild',
                'interpretation' => 'Mild anxiety symptoms detected.',
                'recommendations'=> 'Breathing exercises and lifestyle changes may help.',
                'responses'   => ['q1'=>1,'q2'=>1,'q3'=>1,'q4'=>1,'q5'=>1,'q6'=>1,'q7'=>2],
                'is_crisis_flag' => false,
            ]
        );

        $this->command->info('Sample data seeded: dr_kamau, dr_wambui, patient_demo');
        $this->command->info('Login: patient_demo / Patient@2026!');
        $this->command->info('Professional: dr_kamau / ProDemo@2026!');
    }
}
