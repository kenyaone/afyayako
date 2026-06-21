<?php
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);

// Check schema
echo "Checking professionals table schema:\n";
$stmt = $pdo->query("PRAGMA table_info(professionals)");
while ($col = $stmt->fetch()) {
    echo "{$col['name']}: {$col['type']}\n";
}

echo "\nTrying with minimal fields:\n";
try {
    $pdo->exec("INSERT INTO professionals (user_id, kmpdc_license) VALUES (100, 'TEST')");
    echo "✓ Minimal insert worked\n";
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}

?>
