<?php
$pdo = new PDO('sqlite:/home/qnztnquh/public_html/api/database/database.sqlite');
$stmt = $pdo->query("SELECT user_id, is_online FROM presences WHERE user_id >= 100 LIMIT 10");
while ($row = $stmt->fetch()) {
    echo "User {$row['user_id']}: Online={$row['is_online']}\n";
}
?>
