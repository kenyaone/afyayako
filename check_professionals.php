<?php
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);

echo "=== PROFESSIONALS TABLE ===\n\n";

$stmt = $pdo->query("SELECT COUNT(*) as cnt FROM professionals");
$cnt = $stmt->fetch()['cnt'];
echo "Total professionals: $cnt\n\n";

if ($cnt > 0) {
    $stmt = $pdo->query("SELECT user_id, location_city, location_county FROM professionals LIMIT 5");
    while ($row = $stmt->fetch()) {
        echo "  User {$row['user_id']}: {$row['location_city']}\n";
    }
} else {
    echo "NO PROFESSIONALS RECORDS - need to create them\n";
}
?>
