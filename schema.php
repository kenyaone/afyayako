<?php
$db = new PDO('sqlite:/home/qnztnquh/public_html/api/database/database.sqlite');

$stmt = $db->query("SELECT sql FROM sqlite_master WHERE type='table' AND name='professionals'");
$row = $stmt->fetch();

echo "CREATE TABLE statement:\n";
echo $row['sql'] . "\n";
?>
