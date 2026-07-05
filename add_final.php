<?php
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$remaining = [
    ['Dr. Grace Ochieng', 'Kisumu', 12, 'KMPDC000003'],
    ['Peter Okonkwo', 'Nakuru', 7, 'KMPDC000004'],
    ['Dr. Amara Hassan', 'Nairobi', 9, 'KMPDC000005'],
    ['David Musyoka', 'Nairobi', 6, 'KMPDC000006'],
];

$hash = password_hash('Sample123!', PASSWORD_BCRYPT);

foreach ($remaining as $idx => $s) {
    list($name, $city, $yrs, $lic) = $s;
    $id = 102 + $idx;
    $user = strtolower(str_replace(' ', '_', $name)) . '_';
    $bio = "Certified Therapist";
    
    try {
        $pdo->exec("INSERT INTO users (id, username, display_name, email, password, role, is_anonymous_mode, created_at, updated_at)
                   VALUES ($id, '$user$id', '$name', 'smp$id@local', '$hash', 'professional', 0, datetime('now'), datetime('now'))");
        
        $pdo->exec("INSERT INTO professionals (user_id, kmpdc_license, verification_status, rate_per_hour, years_experience, gender,
                   rating, total_sessions, total_reviews, is_available_online, is_available_physical, is_accepting_new_patients, location_city,
                   location_county, mpesa_number, bio, created_at, updated_at)
                   VALUES ($id, '$lic', 'verified', 1500, $yrs, 'M', 4.8, 75, 30, 1, 1, 1, '$city', 'County',
                   '254712345678', '$bio', datetime('now'), datetime('now'))");
        
        $pdo->exec("INSERT INTO presences (user_id, is_online, created_at, updated_at)
                   VALUES ($id, 1, datetime('now'), datetime('now'))");
        
        echo "✓ $name\n";
    } catch (Exception $e) {
        echo "✗ $name: " . $e->getMessage() . "\n";
    }
}

echo "\n✅ Done!\n";
?>
