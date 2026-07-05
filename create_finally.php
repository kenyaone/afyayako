<?php
$db = new PDO('sqlite:/home/qnztnquh/public_html/api/database/database.sqlite');

$db->exec("DELETE FROM presences WHERE user_id >= 100");
$db->exec("DELETE FROM professionals WHERE user_id >= 100");
$db->exec("DELETE FROM users WHERE id >= 100");

$hash = password_hash('Sample', PASSWORD_BCRYPT);

$samples = [
    ['Dr. Sarah Mwangi', 'Nairobi', 8, 'female'],
    ['James Kipchoge', 'Mombasa', 10, 'male'],
    ['Dr. Grace Ochieng', 'Kisumu', 12, 'female'],
    ['Peter Okonkwo', 'Nakuru', 7, 'male'],
    ['Dr. Amara Hassan', 'Nairobi', 9, 'female'],
    ['David Musyoka', 'Nairobi', 6, 'male'],
];

echo "Creating 6 sample counsellors:\n\n";

$id = 100;
foreach ($samples as $s) {
    list($name, $city, $years, $gender) = $s;
    
    $db->exec("INSERT INTO users (id, username, display_name, email, password, role, is_anonymous_mode, created_at, updated_at)
              VALUES ($id, 's$id', '$name', 's$id@local', '$hash', 'professional', 0, datetime('now'), datetime('now'))");
    
    $db->exec("INSERT INTO professionals 
              (user_id, kmpdc_license, verification_status, rate_per_hour, bio, years_experience, gender, rating, total_sessions, total_reviews, is_available_online, is_accepting_new_patients, location_city, location_county, mpesa_number, cpb_license, is_available_physical, created_at, updated_at)
              VALUES 
              ($id, 'KMPDC$id', 'verified', 1500, 'KMPDC & CPB Certified Therapist', $years, '$gender', 4.8, 100, 50, 1, 1, '$city', 'County', '254712345678', 'CPB$id', 1, datetime('now'), datetime('now'))");
    
    $db->exec("INSERT INTO presences (user_id, is_online, created_at, updated_at)
              VALUES ($id, 1, datetime('now'), datetime('now'))");
    
    echo "✓ $name - $city ($years years)\n";
    $id++;
}

echo "\n✅ 6 sample counsellors created with correct gender values!\n";
?>
