<?php
try {
    $db = new PDO('sqlite:/home/qnztnquh/public_html/api/database/database.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $db->exec("DELETE FROM presences WHERE user_id >= 100");
    $db->exec("DELETE FROM professionals WHERE user_id >= 100");
    $db->exec("DELETE FROM users WHERE id >= 100");

    $hash = password_hash('Sample', PASSWORD_BCRYPT);

    $db->exec("INSERT INTO users (id, username, display_name, email, password, role, is_anonymous_mode, created_at, updated_at)
              VALUES (100, 's100', 'Dr. Sarah Mwangi', 's100@loc', '$hash', 'professional', 0, datetime('now'), datetime('now'))");
    
    echo "✓ User 100\n";

    $db->exec("INSERT INTO professionals (user_id, kmpdc_license, verification_status, rate_per_hour, bio, years_experience, gender, rating, total_sessions, total_reviews, is_available_online, is_available_physical, is_accepting_new_patients, location_city, location_county, mpesa_number, created_at, updated_at)
              VALUES (100, 'KMPDC100', 'verified', 1500, 'Therapist', 8, 'M', 4.8, 75, 30, 1, 1, 1, 'Nairobi', 'County', '254700000000', datetime('now'), datetime('now'))");
    
    echo "✓ Professional 100\n";

    $db->exec("INSERT INTO presences (user_id, is_online, created_at, updated_at)
              VALUES (100, 1, datetime('now'), datetime('now'))");
    
    echo "✓ Presence 100\n";
    echo "✅ Success!\n";

} catch (Exception $e) {
    echo "❌ " . $e->getMessage() . "\n";
    echo "Code: " . $e->getCode() . "\n";
}
?>
