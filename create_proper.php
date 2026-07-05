<?php
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Delete
$pdo->exec("DELETE FROM presences WHERE user_id >= 100");
$pdo->exec("DELETE FROM professionals WHERE user_id >= 100");
$pdo->exec("DELETE FROM users WHERE id >= 100");

echo "Creating samples:\n\n";

$hash = password_hash('Sample123!', PASSWORD_BCRYPT);
$uid = 100;

$names = ['Dr. Sarah Mwangi', 'James Kipchoge', 'Dr. Grace Ochieng', 'Peter Okonkwo', 'Dr. Amara Hassan', 'David Musyoka'];
$cities = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Nairobi', 'Nairobi'];
$years = [8, 10, 12, 7, 9, 6];

foreach ($names as $i => $name) {
    $city = $cities[$i];
    $yrs = $years[$i];
    $user = 'sample' . $uid;
    $lic = 'KMPDC' . str_pad($uid, 6, '0', STR_PAD_LEFT);
    
    // Insert user
    $pdo->exec("INSERT INTO users (id, username, display_name, email, password, role, is_anonymous_mode, created_at, updated_at)
               VALUES ($uid, '$user', '$name', 's$uid@local', '$hash', 'professional', 0, datetime('now'), datetime('now'))");
    
    // Insert professional
    $stmt = $pdo->prepare("INSERT INTO professionals 
    (user_id, kmpdc_license, verification_status, rate_per_hour, bio, years_experience, gender, rating, total_sessions, total_reviews, 
     is_available_online, is_available_physical, is_accepting_new_patients, location_city, location_county, mpesa_number, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))");
    
    $stmt->execute([$uid, $lic, 'verified', 1500, 'KMPDC & CPB Certified Therapist', $yrs, 'M', 4.8, 75, 30, 1, 1, 1, $city, 'County', '254712345678']);
    
    // Insert presence
    $pdo->exec("INSERT INTO presences (user_id, is_online, created_at, updated_at) VALUES ($uid, 1, datetime('now'), datetime('now'))");
    
    echo "✓ $name ($city, $yrs yrs)\n";
    $uid++;
}

echo "\n✅ 6 counsellors created!\n";
?>
