<?php
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    echo "Starting inserts...\n";
    
    $hash = password_hash('Test', PASSWORD_BCRYPT);
    
    // Test 1: Insert user
    echo "1. Inserting user...\n";
    $pdo->exec("INSERT INTO users (id, username, display_name, email, password, role, is_anonymous_mode, created_at, updated_at)
               VALUES (100, 'sample100', 'Test', 'test@local', '$hash', 'professional', 0, datetime('now'), datetime('now'))");
    echo "   ✓ User inserted\n";
    
    // Test 2: Insert professional
    echo "2. Inserting professional...\n";
    $pdo->exec("INSERT INTO professionals (user_id, kmpdc_license, verification_status, rate_per_hour, bio, years_experience, gender, rating, total_sessions, total_reviews, is_available_online, is_available_physical, is_accepting_new_patients, location_city, location_county, mpesa_number, created_at, updated_at)
               VALUES (100, 'KMPDC000100', 'verified', 1500, 'Test', 5, 'M', 4.5, 10, 5, 1, 1, 1, 'Nairobi', 'County', '254700000000', datetime('now'), datetime('now'))");
    echo "   ✓ Professional inserted\n";
    
    // Test 3: Insert presence
    echo "3. Inserting presence...\n";
    $pdo->exec("INSERT INTO presences (user_id, is_online, created_at, updated_at)
               VALUES (100, 1, datetime('now'), datetime('now'))");
    echo "   ✓ Presence inserted\n";
    
    echo "\n✅ All inserts successful!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
