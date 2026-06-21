<?php
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);

// Get online professionals
$stmt = $pdo->query("
  SELECT 
    p.user_id,
    u.display_name,
    p.location_city,
    p.years_experience,
    pr.is_online
  FROM professionals p
  JOIN users u ON p.user_id = u.id
  LEFT JOIN presences pr ON p.user_id = pr.user_id
  WHERE pr.is_online = 1 OR pr.user_id IS NULL
  ORDER BY p.location_city
  LIMIT 10
");

echo "=== ONLINE COUNSELLORS WITH LOCATIONS ===\n\n";

$count = 0;
while ($row = $stmt->fetch()) {
    $count++;
    echo "[$count] {$row['display_name']}\n";
    echo "    📍 {$row['location_city']} • {$row['years_experience']} years\n";
    echo "    Online: " . ($row['is_online'] ? 'Yes ✓' : 'No') . "\n\n";
}

if ($count == 0) {
    echo "❌ No online counsellors found\n";
    echo "\nChecking ALL professionals...\n";
    $stmt = $pdo->query("SELECT COUNT(*) as cnt FROM professionals");
    echo "Total: " . $stmt->fetch()['cnt'] . "\n";
}
?>
