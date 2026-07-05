<?php
error_reporting(E_ALL);
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

echo "=== SIMPLE INSERT TEST ===\n\n";

try {
    //Get an existing user
    $stmt = $pdo->query("SELECT id FROM users LIMIT 1");
    $user = $stmt->fetch();
    $userId = $user['id'];
    
    echo "Test user ID: $userId\n";
    
    // Try minimal insert
    $pdo->exec("INSERT INTO professionals (user_id, location_city, location_county, years_experience, created_at, updated_at)
               VALUES ($userId, 'Nairobi Test', 'Nairobi County', 5, datetime('now'), datetime('now'))");
    
    echo "[✓] Insert successful!\n";
    
    $stmt = $pdo->query("SELECT * FROM professionals WHERE user_id = $userId");
    $pro = $stmt->fetch();
    print_r($pro);
    
} catch (Exception $e) {
    echo "[✗] Error: " . $e->getMessage() . "\n";
    echo "[!] Code: " . $e->getCode() . "\n";
}
?>
