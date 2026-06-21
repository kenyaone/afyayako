<?php
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);

echo "=== SAMPLE COUNSELLORS ON SYSTEM ===\n\n";

$stmt = $pdo->query("
  SELECT u.id, u.display_name, p.location_city, p.location_county, p.years_experience, p.verification_status
  FROM users u
  JOIN professionals p ON u.id = p.user_id
  WHERE u.email LIKE '%example.com%'
  ORDER BY p.location_city
");

$counsellors = $stmt->fetchAll();
foreach ($counsellors as $c) {
    echo "[✓] {$c['display_name']}\n";
    echo "    Location: {$c['location_city']}, {$c['location_county']}\n";
    echo "    Experience: {$c['years_experience']} years\n";
    echo "    Status: {$c['verification_status']}\n\n";
}

echo "Total: " . count($counsellors) . " sample counsellors\n";

// Check online
$online = $pdo->query("
  SELECT COUNT(p.user_id) as cnt FROM presences p
  WHERE p.user_id IN (SELECT id FROM users WHERE email LIKE '%example.com%')
  AND p.is_online = 1
")->fetch()['cnt'];

echo "Online: $online\n";
?>
