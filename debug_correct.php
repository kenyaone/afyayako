<?php
$db = new PDO('sqlite:/home/qnztnquh/public_html/api/database/database.sqlite');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    $db->exec("DELETE FROM presences WHERE user_id >= 100");
    $db->exec("DELETE FROM professionals WHERE user_id >= 100");
    $db->exec("DELETE FROM users WHERE id >= 100");
    
    $hash = password_hash('Sample', PASSWORD_BCRYPT);
    
    // Create ONE sample
    echo "[1] Creating user...\n";
    $db->exec("INSERT INTO users (id, username, display_name, email, password, role, is_anonymous_mode, created_at, updated_at)
              VALUES (100, 's100', 'Dr. Sarah Mwangi', 's100@local', '$hash', 'professional', 0, datetime('now'), datetime('now'))");
    
    echo "[2] Creating professional...\n";
    $db->exec("INSERT INTO professionals 
              (user_id, kmpdc_license, verification_status, rate_per_hour, bio, years_experience, gender, rating, total_sessions, total_reviews, is_available_online, is_accepting_new_patients, location_city, location_county, mpesa_number, cpb_license, is_available_physical, created_at, updated_at)
              VALUES 
              (100, 'KMPDC100', 'verified', 1500, 'Test', 8, 'M', 4.8, 100, 50, 1, 1, 'Nairobi', 'County', '254712345678', 'CPB100', 1, datetime('now'), datetime('now'))");
    
    echo "[3] Creating presence...\n";
    $db->exec("INSERT INTO presences (user_id, is_online, created_at, updated_at)
              VALUES (100, 1, datetime('now'), datetime('now'))");
    
    echo "\n✅ Success!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
