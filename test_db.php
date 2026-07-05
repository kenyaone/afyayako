<?php
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
echo "Testing: $dbPath\n";
if (file_exists($dbPath)) {
    echo "[✓] File exists\n";
    echo "[✓] Size: " . filesize($dbPath) . " bytes\n";
    
    try {
        $pdo = new PDO('sqlite:' . $dbPath);
        $stmt = $pdo->query("SELECT COUNT(*) as cnt FROM users");
        $result = $stmt->fetch();
        echo "[✓] Users in DB: " . $result['cnt'] . "\n";
    } catch (Exception $e) {
        echo "[✗] Error: " . $e->getMessage() . "\n";
    }
} else {
    echo "[✗] File not found\n";
}
?>
