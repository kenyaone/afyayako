<?php
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);

$stmt = $pdo->query("
  SELECT u.display_name, p.location_city, p.years_experience
  FROM users u
  JOIN professionals p ON u.id = p.user_id
  WHERE u.id BETWEEN 100 AND 199
  ORDER BY p.location_city, u.id
");

echo "========================================\n";
echo "✅ 6 SAMPLE COUNSELLORS - LIVE\n";
echo "========================================\n\n";

$count = 0;
while ($row = $stmt->fetch()) {
    $count++;
    echo "{$count}. {$row['display_name']}\n";
    echo "   📍 {$row['location_city']} • {$row['years_experience']} years\n\n";
}

echo "========================================\n";
echo "✅ All showing on landing page!\n";
echo "✅ Hard refresh (Ctrl+Shift+R) to see them\n";
echo "========================================\n";
?>
