<?php
$db = new PDO('sqlite:/home/qnztnquh/public_html/api/database/database.sqlite');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$db->exec("DELETE FROM presences WHERE user_id >= 100");
$db->exec("DELETE FROM professionals WHERE user_id >= 100");
$db->exec("DELETE FROM users WHERE id >= 100");

$hash = password_hash('Sample', PASSWORD_BCRYPT);
$uid = 100;

$data = [
    ['Dr. Sarah Mwangi', 'Nairobi', 8],
    ['James Kipchoge', 'Mombasa', 10],
    ['Dr. Grace Ochieng', 'Kisumu', 12],
    ['Peter Okonkwo', 'Nakuru', 7],
    ['Dr. Amara Hassan', 'Nairobi', 9],
    ['David Musyoka', 'Nairobi', 6],
];

echo "Creating samples:\n";

foreach ($data as $row) {
    list($name, $city, $years) = $row;
    
    $db->exec("INSERT INTO users (id, username, display_name, email, password, role, is_anonymous_mode, created_at, updated_at)
              VALUES ($uid, 's$uid', '$name', 's$uid@loc', '$hash', 'professional', 0, datetime('now'), datetime('now'))");
    
    $db->exec("INSERT INTO professionals (user_id, kmpdc_license, verification_status, rate_per_hour, bio, years_experience, gender, rating, total_sessions, total_reviews, is_available_online, is_available_physical, is_accepting_new_patients, location_city, location_county, mpesa_number, created_at, updated_at)
              VALUES ($uid, 'KMPDC$uid', 'verified', 1500, 'Therapist', $years, 'M', 4.8, 75, 30, 1, 1, 1, '$city', 'County', '254700000000', datetime('now'), datetime('now'))");
    
    $db->exec("INSERT INTO presences (user_id, is_online, created_at, updated_at)
              VALUES ($uid, 1, datetime('now'), datetime('now'))");
    
    echo "✓ $name\n";
    $uid++;
}

$stmt = $db->query("SELECT COUNT(*) as cnt FROM professionals WHERE location_city IS NOT NULL");
$count = $stmt->fetch()['cnt'];

echo "\n✅ Created $count professionals!\n";
?>
