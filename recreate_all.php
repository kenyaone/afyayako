<?php
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Delete existing samples
$pdo->exec("DELETE FROM presences WHERE user_id BETWEEN 100 AND 199");
$pdo->exec("DELETE FROM professionals WHERE user_id BETWEEN 100 AND 199");
$pdo->exec("DELETE FROM users WHERE id BETWEEN 100 AND 199");

echo "SAMPLE COUNSELLORS - COMPLETE SETUP\n";
echo "=================================\n\n";

$samples = [
    ['Dr. Sarah Mwangi', 'Nairobi', 8, 'KMPDC000001', 'Depression & anxiety specialist'],
    ['James Kipchoge', 'Mombasa', 10, 'KMPDC000002', 'Addiction recovery expert'],
    ['Dr. Grace Ochieng', 'Kisumu', 12, 'KMPDC000003', 'Trauma & PTSD specialist'],
    ['Peter Okonkwo', 'Nakuru', 7, 'KMPDC000004', 'Couples & family therapy'],
    ['Dr. Amara Hassan', 'Nairobi', 9, 'KMPDC000005', 'Grief counseling specialist'],
    ['David Musyoka', 'Nairobi', 6, 'KMPDC000006', 'Gambling addiction specialist'],
];

$hash = password_hash('Sample123!', PASSWORD_BCRYPT);

foreach ($samples as $idx => $s) {
    list($name, $city, $yrs, $lic, $bio) = $s;
    $id = 100 + $idx;
    $user = strtolower(str_replace(' ', '_', $name)) . '_sample';
    
    $pdo->exec("INSERT INTO users (id, username, display_name, email, password, role, is_anonymous_mode, created_at, updated_at)
               VALUES ($id, '$user', '$name', 'sample$id@local', '$hash', 'professional', 0, datetime('now'), datetime('now'))");
    
    $pdo->exec("INSERT INTO professionals (user_id, kmpdc_license, verification_status, rate_per_hour, years_experience, gender,
               rating, total_sessions, total_reviews, is_available_online, is_accepting_new_patients, location_city,
               location_county, mpesa_number, bio, created_at, updated_at)
               VALUES ($id, '$lic', 'verified', 1500, $yrs, 'M', 4.8, 75, 30, 1, 1, '$city', 'County',
               '254712345678', '$bio', datetime('now'), datetime('now'))");
    
    $pdo->exec("INSERT INTO presences (user_id, is_online, created_at, updated_at)
               VALUES ($id, 1, datetime('now'), datetime('now'))");
    
    echo "✓ $name • $city • $yrs years\n";
}

echo "\n✅ 6 sample counsellors ready on landing page!\n";
echo "✅ Hard refresh (Ctrl+Shift+R) to see them.\n";
?>
