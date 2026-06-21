<?php
$api = '/home/qnztnquh/public_html/api';

// Load Laravel
require_once $api . '/vendor/autoload.php';
$app = require_once $api . '/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Http\Kernel');
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use App\Models\User;
use App\Models\Professional;
use Illuminate\Support\Facades\Hash;

echo "=== CREATING SAMPLE COUNSELLORS ===\n\n";

$sampleCounsellors = [
    [
        'name' => 'Dr. Sarah Mwangi',
        'email' => 'sarah.mwangi@example.com',
        'location_city' => 'Nairobi',
        'location_county' => 'Nairobi County',
        'specialization' => 'Depression & Anxiety',
        'bio' => 'Specializes in cognitive behavioral therapy for depression and anxiety disorders.',
        'years_experience' => 8,
        'gender' => 'Female',
        'rate_per_hour' => 1500,
    ],
    [
        'name' => 'James Kipchoge',
        'email' => 'james.kipchoge@example.com',
        'location_city' => 'Mombasa',
        'location_county' => 'Mombasa County',
        'specialization' => 'Addiction Recovery',
        'bio' => 'Expert in substance abuse treatment and recovery programs.',
        'years_experience' => 10,
        'gender' => 'Male',
        'rate_per_hour' => 2000,
    ],
    [
        'name' => 'Dr. Grace Ochieng',
        'email' => 'grace.ochieng@example.com',
        'location_city' => 'Kisumu',
        'location_county' => 'Kisumu County',
        'specialization' => 'Trauma & PTSD',
        'bio' => 'Specializes in trauma-focused therapy and PTSD treatment.',
        'years_experience' => 12,
        'gender' => 'Female',
        'rate_per_hour' => 2500,
    ],
    [
        'name' => 'Peter Okonkwo',
        'email' => 'peter.okonkwo@example.com',
        'location_city' => 'Nakuru',
        'location_county' => 'Nakuru County',
        'specialization' => 'Couples & Family Therapy',
        'bio' => 'Provides relationship counseling and family therapy services.',
        'years_experience' => 7,
        'gender' => 'Male',
        'rate_per_hour' => 1800,
    ],
    [
        'name' => 'Dr. Amara Hassan',
        'email' => 'amara.hassan@example.com',
        'location_city' => 'Nairobi',
        'location_county' => 'Nairobi County',
        'specialization' => 'Grief Counseling',
        'bio' => 'Provides compassionate grief and bereavement counseling.',
        'years_experience' => 9,
        'gender' => 'Female',
        'rate_per_hour' => 1600,
    ],
    [
        'name' => 'David Musyoka',
        'email' => 'david.musyoka@example.com',
        'location_city' => 'Nairobi',
        'location_county' => 'Nairobi County',
        'specialization' => 'Gambling Disorder',
        'bio' => 'Specialist in gambling addiction treatment and financial recovery.',
        'years_experience' => 6,
        'gender' => 'Male',
        'rate_per_hour' => 1700,
    ],
];

$count = 0;
foreach ($sampleCounsellors as $counsellor) {
    $userExists = User::where('email', $counsellor['email'])->exists();
    
    if (!$userExists) {
        $user = User::create([
            'username' => strtolower(str_replace(' ', '_', $counsellor['name'])),
            'display_name' => $counsellor['name'],
            'email' => $counsellor['email'],
            'password' => Hash::make('SamplePass123!'),
            'role' => 'professional',
            'is_anonymous_mode' => false,
        ]);

        Professional::create([
            'user_id' => $user->id,
            'kmpdc_license' => 'KMPDC' . str_pad(mt_rand(1, 99999), 5, '0', STR_PAD_LEFT),
            'cpb_license' => 'CPB' . str_pad(mt_rand(1, 99999), 5, '0', STR_PAD_LEFT),
            'verification_status' => 'verified',
            'rate_per_hour' => $counsellor['rate_per_hour'],
            'bio' => $counsellor['bio'],
            'years_experience' => $counsellor['years_experience'],
            'gender' => $counsellor['gender'],
            'rating' => 4.8,
            'total_sessions' => mt_rand(50, 500),
            'total_reviews' => mt_rand(10, 100),
            'is_available_online' => true,
            'is_available_physical' => true,
            'is_accepting_new_patients' => true,
            'location_city' => $counsellor['location_city'],
            'location_county' => $counsellor['location_county'],
            'mpesa_number' => '254712345678',
        ]);

        echo "[✓] {$counsellor['name']} ({$counsellor['location_city']})\n";
        $count++;
    }
}

echo "\n[✓] Created $count sample counsellors\n";
?>
