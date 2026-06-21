<?php
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);

echo "=== ALL USERS IN DATABASE ===\n\n";

$stmt = $pdo->query("SELECT COUNT(*) as cnt FROM users");
$total = $stmt->fetch()['cnt'];
echo "Total users: $total\n\n";

$stmt = $pdo->query("SELECT id, username, display_name, email, role FROM users ORDER BY id DESC LIMIT 10");
while ($row = $stmt->fetch()) {
    echo "ID {$row['id']}: {$row['display_name']} ({$row['email']}) - {$row['role']}\n";
}
?>
