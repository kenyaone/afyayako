<?php
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);

$stmt = $pdo->query("SELECT COUNT(*) as cnt FROM users WHERE id BETWEEN 100 AND 199");
$count = $stmt->fetch()['cnt'];

if ($count > 0) {
    echo "✅ SUCCESS! $count sample counsellors created.\n\n";
    
    $stmt = $pdo->query("
      SELECT u.display_name, p.location_city, p.years_experience
      FROM users u
      JOIN professionals p ON u.id = p.user_id
      WHERE u.id BETWEEN 100 AND 199
      ORDER BY p.location_city
    ");
    
    while ($row = $stmt->fetch()) {
        echo "• {$row['display_name']} ({$row['location_city']}) - {$row['years_experience']} years\n";
    }
    
    echo "\n✅ They will appear on the landing page with their locations!\n";
} else {
    echo "❌ No sample counsellors found. Creating them...\n";
}
?>
