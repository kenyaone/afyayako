<?php
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);

echo "=== CREATING COMPLETE SAMPLE COUNSELLORS ===\n\n";

// First, delete existing sample users/professionals if any
$pdo->exec("DELETE FROM professionals WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%example.com%')");
$pdo->exec("DELETE FROM presences WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%example.com%')");
$pdo->exec("DELETE FROM users WHERE email LIKE '%example.com%'");

$samples = [
    ['Dr. Sarah Mwangi', 'sarah.mwangi@example.com', 'Nairobi', 'Nairobi County', 8, 'Female', 1500],
    ['James Kipchoge', 'james.kipchoge@example.com', 'Mombasa', 'Mombasa County', 10, 'Male', 2000],
    ['Dr. Grace Ochieng', 'grace.ochieng@example.com', 'Kisumu', 'Kisumu County', 12, 'Female', 2500],
    ['Peter Okonkwo', 'peter.okonkwo@example.com', 'Nakuru', 'Nakuru County', 7, 'Male', 1800],
    ['Dr. Amara Hassan', 'amara.hassan@example.com', 'Nairobi', 'Nairobi County', 9, 'Female', 1600],
    ['David Musyoka', 'david.musyoka@example.com', 'Nairobi', 'Nairobi County', 6, 'Male', 1700],
];

foreach ($samples as $s) {
    list($name, $email, $city, $county, $years, $gender, $rate) = $s;
    $username = strtolower(str_replace([' ', '.'], ['_', ''], $email));
    $password = password_hash('Sample123!', PASSWORD_BCRYPT);
    
    // Create user
    $pdo->exec("INSERT INTO users (username, display_name, email, password, role, is_anonymous_mode, created_at, updated_at)
               VALUES ('$username', '$name', '$email', '$password', 'professional', 0, datetime('now'), datetime('now'))");
    $userId = $pdo->lastInsertId();
    
    // Create professional record
    $kmpdc = 'KMPDC' . str_pad(rand(10000, 99999), 5, '0', STR_PAD_LEFT);
    $cpb = 'CPB' . str_pad(rand(10000, 99999), 5, '0', STR_PAD_LEFT);
    
    $pdo->exec("INSERT INTO professionals 
               (user_id, kmpdc_license, cpb_license, verification_status, rate_per_hour, years_experience, gender, 
                rating, total_sessions, total_reviews, is_available_online, is_available_physical, 
                is_accepting_new_patients, location_city, location_county, mpesa_number, bio, created_at, updated_at)
               VALUES 
               ($userId, '$kmpdc', '$cpb', 'verified', $rate, $years, '$gender', 
                4.8, 75, 30, 1, 1, 1, '$city', '$county', '254712345678', 
                'KMPDC & CPB Verified Therapist', datetime('now'), datetime('now'))");
    
    // Mark as online
    $pdo->exec("INSERT INTO presences (user_id, is_online, created_at, updated_at) 
               VALUES ($userId, 1, datetime('now'), datetime('now'))");
    
    echo "[✓] $name • $city • $years years\n";
}

echo "\n[✓✓✓] 6 SAMPLE COUNSELLORS CREATED!\n";
echo "[✓] They will appear on landing page with locations\n";
?>
