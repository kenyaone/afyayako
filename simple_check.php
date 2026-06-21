<?php
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);

$stmt = $pdo->query("SELECT COUNT(*) as cnt FROM professionals WHERE location_city IS NOT NULL");
$count = $stmt->fetch()['cnt'];

if ($count > 0) {
    echo "✅ Found $count professionals with locations\n";
} else {
    echo "❌ No professionals with locations\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) as cnt FROM professionals");
    echo "Total professionals: " . $stmt->fetch()['cnt'] . "\n";
}
?>
