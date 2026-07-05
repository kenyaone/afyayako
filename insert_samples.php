<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    // Clear old samples
    $pdo->exec("DELETE FROM presences WHERE user_id >= 100");
    $pdo->exec("DELETE FROM professionals WHERE user_id >= 100");  
    $pdo->exec("DELETE FROM users WHERE id >= 100");
    
    $hash = password_hash('Test123', PASSWORD_BCRYPT);
    
    // Insert sample user
    $pdo->exec("INSERT INTO users (id, username, display_name, email, password, role, is_anonymous_mode, created_at, updated_at)
               VALUES (100, 'sample100', 'Dr. Test User', 'test100@local', '$hash', 'professional', 0, datetime('now'), datetime('now'))");
    
    // Insert professional
    $pdo->exec("INSERT INTO professionals (user_id, kmpdc_license, verification_status, rate_per_hour, bio, years_experience, 
               gender, rating, total_sessions, total_reviews, is_available_online, is_available_physical, is_accepting_new_patients,
               location_city, location_county, mpesa_number, created_at, updated_at)
               VALUES (100, 'KMPDC000100', 'verified', 1500, 'Test', 5, 'M', 4.5, 10, 5, 1, 1, 1, 
               'Nairobi', 'County', '254700000000', datetime('now'), datetime('now'))");
    
    // Insert presence
    $pdo->exec("INSERT INTO presences (user_id, is_online, created_at, updated_at)
               VALUES (100, 1, datetime('now'), datetime('now'))");
    
    echo "✓ Sample created\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}
?>
