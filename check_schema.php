<?php
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);

echo "=== USERS TABLE ===\n";
$stmt = $pdo->query("PRAGMA table_info(users)");
while ($col = $stmt->fetch()) {
    echo "{$col['name']} ({$col['type']})\n";
}

echo "\n=== PROFESSIONALS TABLE ===\n";
$stmt = $pdo->query("PRAGMA table_info(professionals)");
while ($col = $stmt->fetch()) {
    echo "{$col['name']} ({$col['type']})\n";
}

echo "\n=== TEST INSERT ===\n";
try {
    $pdo->exec("INSERT INTO professionals (user_id, location_city) VALUES (1, 'Nairobi')");
    echo "[✓] Insert successful\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) as cnt FROM professionals");
    echo "Professionals count: " . $stmt->fetch()['cnt'] . "\n";
} catch (Exception $e) {
    echo "[✗] Error: " . $e->getMessage() . "\n";
}
?>
