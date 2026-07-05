<?php
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);
$stmt = $pdo->query("SELECT COUNT(*) as cnt FROM professionals WHERE location_city IS NOT NULL");
echo "Sample counsellors: " . $stmt->fetch()['cnt'] . "\n";
?>
