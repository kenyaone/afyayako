<?php
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);

$stmt = $pdo->query("
  SELECT u.display_name, p.location_city, p.years_experience
  FROM users u
  JOIN professionals p ON u.id = p.user_id
  WHERE p.location_city IS NOT NULL
  ORDER BY p.location_city
");

$rows = $stmt->fetchAll();

if (count($rows) > 0) {
    echo "✅ SAMPLE COUNSELLORS READY ON LANDING PAGE:\n\n";
    foreach ($rows as $r) {
        echo "  • {$r['display_name']} ({$r['location_city']}) - {$r['years_experience']} years\n";
    }
    echo "\nTotal: " . count($rows) . " counsellors\n";
} else {
    echo "❌ No sample counsellors found\n";
}
?>
