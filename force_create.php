<?php
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Force delete all samples first
$pdo->exec("DELETE FROM presences WHERE user_id >= 100");
$pdo->exec("DELETE FROM professionals WHERE user_id >= 100");
$pdo->exec("DELETE FROM users WHERE id >= 100");

echo "Creating 6 sample counsellors:\n\n";

$hash = password_hash('Sample123!', PASSWORD_BCRYPT);
$samples = [
    [100, 'Dr. Sarah Mwangi', 'Nairobi', 8],
    [101, 'James Kipchoge', 'Mombasa', 10],
    [102, 'Dr. Grace Ochieng', 'Kisumu', 12],
    [103, 'Peter Okonkwo', 'Nakuru', 7],
    [104, 'Dr. Amara Hassan', 'Nairobi', 9],
    [105, 'David Musyoka', 'Nairobi', 6],
];

foreach ($samples as $s) {
    list($id, $name, $city, $yrs) = $s;
    $user = 'smp' . $id;
    $lic = 'KMPDC' . str_pad($id, 6, '0', STR_PAD_LEFT);
    
    $pdo->exec("INSERT INTO users (id, username, display_name, email, password, role, is_anonymous_mode, created_at, updated_at)
               VALUES ($id, '$user', '$name', 'smp$id@local', '$hash', 'professional', 0, datetime('now'), datetime('now'))");
    
    $pdo->exec("INSERT INTO professionals (user_id, kmpdc_license, verification_status, rate_per_hour, bio, years_experience, gender, 
               rating, total_sessions, total_reviews, is_available_online, is_available_physical, is_accepting_new_patients,
               location_city, location_county, mpesa_number, created_at, updated_at)
               VALUES ($id, '$lic', 'verified', 1500, 'Certified', $yrs, 'M', 4.8, 75, 30, 1, 1, 1,
               '$city', 'County', '254712345678', datetime('now'), datetime('now'))");
    
    $pdo->exec("INSERT INTO presences (user_id, is_online, created_at, updated_at)
               VALUES ($id, 1, datetime('now'), datetime('now'))");
    
    echo "✓ $name - $city\n";
}

echo "\n✅ Done!\n";
?>
