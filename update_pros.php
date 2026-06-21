<?php
$dbPath = '/home/qnztnquh/public_html/api/database/sqlite';
$pdo = new PDO('sqlite:' . $dbPath);

// Get existing sample users
$stmt = $pdo->query("SELECT id, display_name FROM users WHERE email LIKE '%example.com%' OR email LIKE '%@example.com%'");
$users = $stmt->fetchAll();

echo "Found " . count($users) . " sample users\n";
foreach ($users as $u) {
    echo "  - {$u['display_name']} (ID: {$u['id']})\n";
}
?>
