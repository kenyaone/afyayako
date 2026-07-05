<?php
// Load Laravel
$api = '/home/qnztnquh/public_html/api';
require_once $api . '/vendor/autoload.php';
$app = require_once $api . '/bootstrap/app.php';

use App\Models\User;
use App\Models\Professional;
use Illuminate\Support\Facades\Hash;

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

try {
    echo "Creating via Laravel Model...\n\n";
    
    // Delete old
    User::where('id', '>=', 100)->delete();
    
    // Create user
    $user = User::create([
        'id' => 100,
        'username' => 'sample100',
        'display_name' => 'Dr. Sarah Mwangi',
        'email' => 'sample100@test.local',
        'password' => Hash::make('Test123'),
        'role' => 'professional',
        'is_anonymous_mode' => false,
    ]);
    
    echo "✓ User created\n";
    
    // Create professional
    $pro = Professional::create([
        'user_id' => $user->id,
        'kmpdc_license' => 'KMPDC000100',
        'verification_status' => 'verified',
        'rate_per_hour' => 1500,
        'bio' => 'KMPDC & CPB Verified Therapist',
        'years_experience' => 8,
        'gender' => 'F',
        'rating' => 4.8,
        'total_sessions' => 100,
        'total_reviews' => 50,
        'is_available_online' => true,
        'is_available_physical' => true,
        'is_accepting_new_patients' => true,
        'location_city' => 'Nairobi',
        'location_county' => 'Nairobi County',
        'mpesa_number' => '254712345678',
    ]);
    
    echo "✓ Professional created\n";
    
    echo "\n✅ Sample created via Laravel!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
