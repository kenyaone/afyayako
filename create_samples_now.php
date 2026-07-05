<?php
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);

// Delete old ones
$pdo->exec("DELETE FROM presences WHERE user_id > 10");
$pdo->exec("DELETE FROM professionals WHERE user_id > 10");
$pdo->exec("DELETE FROM users WHERE id > 10");

echo "CREATING SAMPLE COUNSELLORS\n";
echo "===========================\n\n";

$samples = [
    ['Dr. Sarah Mwangi', 'Nairobi', 8],
    ['James Kipchoge', 'Mombasa', 10],
    ['Dr. Grace Ochieng', 'Kisumu', 12],
    ['Peter Okonkwo', 'Nakuru', 7],
    ['Dr. Amara Hassan', 'Nairobi', 9],
    ['David Musyoka', 'Nairobi', 6],
];

$hash = password_hash('Sample123!', PASSWORD_BCRYPT);
$uid = 100;

foreach ($samples as $s) {
    list($name, $city, $yrs) = $s;
    $user = 'sample' . $uid;
    $lic = 'KMPDC' . str_pad($uid, 6, '0', STR_PAD_LEFT);
    
    // Insert user
    $pdo->exec("INSERT INTO users (id, username, display_name, email, password, role, is_anonymous_mode, created_at, updated_at)
               VALUES ($uid, '$user', '$name', 'sample$uid@test.local', '$hash', 'professional', 0, datetime('now'), datetime('now'))");
    
    // Insert professional with ALL required fields
    $pdo->exec("INSERT INTO professionals 
               (user_id, kmpdc_license, verification_status, rate_per_hour, bio, years_experience, gender, 
                rating, total_sessions, total_reviews, is_available_online, is_available_physical, is_accepting_new_patients, 
                location_city, location_county, mpesa_number, created_at, updated_at)
               VALUES 
               ($uid, '$lic', 'verified', 1500, 'Certified Therapist', $yrs, 'M', 
                4.8, 75, 30, 1, 1, 1, '$city', 'County', '254712345678', datetime('now'), datetime('now'))");
    
    // Insert presence
    $pdo->exec("INSERT INTO presences (user_id, is_online, created_at, updated_at)
               VALUES ($uid, 1, datetime('now'), datetime('now'))");
    
    echo "[✓] $name ($city)\n";
    $uid++;
}

// Verify
$stmt = $pdo->query("SELECT COUNT(*) as cnt FROM professionals WHERE location_city IS NOT NULL");
$count = $stmt->fetch()['cnt'];

echo "\n✅ Created $count sample counsellors!\n";
?>
