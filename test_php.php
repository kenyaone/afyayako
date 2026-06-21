<?php
echo "PHP works\n";

$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
if (file_exists($dbPath)) {
    echo "DB exists\n";
    $pdo = new PDO('sqlite:' . $dbPath);
    echo "Connected\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) as cnt FROM users");
    $cnt = $stmt->fetch()['cnt'];
    echo "Users: $cnt\n";
} else {
    echo "DB not found\n";
}
?>
