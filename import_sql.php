<?php
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
$sqlFile = '/home/qnztnquh/public_html/sample_counsellors.sql';

if (!file_exists($sqlFile)) {
    echo "SQL file not found\n";
    exit(1);
}

$pdo = new PDO('sqlite:' . $dbPath);
$sql = file_get_contents($sqlFile);

try {
    $pdo->exec($sql);
    echo "✅ Sample counsellors imported successfully!\n";
    
    // Verify
    $stmt = $pdo->query("SELECT COUNT(*) as cnt FROM professionals WHERE user_id >= 100");
    $count = $stmt->fetch()['cnt'];
    echo "Created: $count professionals\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
