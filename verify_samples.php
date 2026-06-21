<?php
$api = '/home/qnztnquh/public_html/api';
$db = new PDO('sqlite:' . $api . '/database/database.sqlite');

echo "=== SAMPLE COUNSELLORS CREATED ===\n\n";

$stmt = $db->query("
  SELECT u.display_name, p.location_city, p.location_county, p.years_experience
  FROM users u
  JOIN professionals p ON u.id = p.user_id
  WHERE u.email LIKE '%example.com%'
  ORDER BY p.location_city
");

$counsellors = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($counsellors as $c) {
    echo "[✓] {$c['display_name']} • {$c['location_city']} • {$c['years_experience']} yrs\n";
}

echo "\nTotal: " . count($counsellors) . " sample counsellors\n";
?>
