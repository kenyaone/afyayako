<?php
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

echo "=== 6 SAMPLE COUNSELLORS ===\n\n";

$samples = [
    [100, 'sample_sarah_001', 'Dr. Sarah Mwangi', 'Nairobi', 8, 'KMPDC000001', 'Depression & anxiety specialist with 8 years experience'],
    [101, 'sample_james_002', 'James Kipchoge', 'Mombasa', 10, 'KMPDC000002', 'Addiction recovery expert with 10 years experience'],
    [102, 'sample_grace_003', 'Dr. Grace Ochieng', 'Kisumu', 12, 'KMPDC000003', 'Trauma & PTSD specialist with 12 years experience'],
    [103, 'sample_peter_004', 'Peter Okonkwo', 'Nakuru', 7, 'KMPDC000004', 'Couples & family therapy specialist'],
    [104, 'sample_amara_005', 'Dr. Amara Hassan', 'Nairobi', 9, 'KMPDC000005', 'Grief counseling specialist with 9 years experience'],
    [105, 'sample_david_006', 'David Musyoka', 'Nairobi', 6, 'KMPDC000006', 'Gambling addiction specialist'],
];

$hash = '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DXo5d6';

foreach ($samples as $s) {
    list($id, $user, $name, $city, $yrs, $lic, $bio) = $s;
    
    $check = $pdo->prepare("SELECT id FROM users WHERE id = ?");
    $check->execute([$id]);
    if ($check->fetch()) {
        echo "[!] $name already exists\n";
        continue;
    }
    
    $pdo->exec("INSERT INTO users (id, username, display_name, email, password, role, is_anonymous_mode, created_at, updated_at)
               VALUES ($id, '$user', '$name', 'sample$id@local', '$hash', 'professional', 0, datetime('now'), datetime('now'))");
    
    $pdo->exec("INSERT INTO professionals (user_id, kmpdc_license, verification_status, rate_per_hour, years_experience, gender, 
               rating, total_sessions, total_reviews, is_available_online, is_accepting_new_patients, location_city, 
               location_county, mpesa_number, bio, created_at, updated_at)
               VALUES ($id, '$lic', 'verified', 1500, $yrs, 'M', 4.8, 75, 30, 1, 1, '$city', 'County', 
               '254712345678', '$bio', datetime('now'), datetime('now'))");
    
    $pdo->exec("INSERT INTO presences (user_id, is_online, created_at, updated_at)
               VALUES ($id, 1, datetime('now'), datetime('now'))");
    
    echo "[✓] $name • $city\n";
}

echo "\n✅ DONE! 6 sample counsellors are now on the landing page.\n";
?>
