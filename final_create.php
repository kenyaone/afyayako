<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ob_start();

try {
    $dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Step 1: Deleting old samples\n";
    $pdo->exec("DELETE FROM presences WHERE user_id >= 100");
    $pdo->exec("DELETE FROM professionals WHERE user_id >= 100");
    $pdo->exec("DELETE FROM users WHERE id >= 100");
    echo "✓ Deleted\n\n";

    echo "Step 2: Creating samples\n";
    $hash = password_hash('Test123', PASSWORD_BCRYPT);
    
    $pdo->exec("INSERT INTO users (id, username, display_name, email, password, role, is_anonymous_mode, created_at, updated_at) VALUES (100, 'smp100', 'Dr. Sarah Mwangi', 'smp100@local', '$hash', 'professional', 0, datetime('now'), datetime('now'))");
    echo "✓ User 100 created\n";
    
    $pdo->exec("INSERT INTO professionals (user_id, kmpdc_license, verification_status, rate_per_hour, bio, years_experience, gender, rating, total_sessions, total_reviews, is_available_online, is_available_physical, is_accepting_new_patients, location_city, location_county, mpesa_number, created_at, updated_at) VALUES (100, 'KMPDC000100', 'verified', 1500, 'Test', 8, 'M', 4.8, 75, 30, 1, 1, 1, 'Nairobi', 'County', '254712345678', datetime('now'), datetime('now'))");
    echo "✓ Professional 100 created\n";
    
    $pdo->exec("INSERT INTO presences (user_id, is_online, created_at, updated_at) VALUES (100, 1, datetime('now'), datetime('now'))");
    echo "✓ Presence 100 created\n";
    
    echo "\n✅ Sample created successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Exception: " . $e->getMessage() . "\n";
    echo "Code: " . $e->getCode() . "\n";
}

$output = ob_get_clean();
echo $output;
?>
