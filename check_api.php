<?php
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);

// Check online professionals
echo "=== ONLINE PROFESSIONALS ===\n\n";

$stmt = $pdo->query("
  SELECT 
    p.user_id,
    u.display_name,
    u.email,
    p.location_city,
    p.years_experience,
    pr.is_online
  FROM professionals p
  JOIN users u ON p.user_id = u.id
  LEFT JOIN presences pr ON p.user_id = pr.user_id
  WHERE pr.is_online = 1
  ORDER BY p.location_city
");

$count = 0;
while ($row = $stmt->fetch()) {
    $count++;
    echo "[$count] {$row['display_name']}\n";
    echo "     📍 {$row['location_city']}\n";
    echo "     {$row['years_experience']} years • Online: " . ($row['is_online'] ? 'YES' : 'NO') . "\n\n";
}

if ($count == 0) {
    echo "❌ NO ONLINE PROFESSIONALS FOUND\n\n";
    
    // Check if samples exist at all
    $stmt = $pdo->query("SELECT COUNT(*) as cnt FROM professionals WHERE user_id >= 100");
    $exists = $stmt->fetch()['cnt'];
    echo "Samples in DB: $exists\n";
    
    // Check presences
    $stmt = $pdo->query("SELECT COUNT(*) as cnt FROM presences WHERE user_id >= 100");
    $online_count = $stmt->fetch()['cnt'];
    echo "Online presences: $online_count\n";
} else {
    echo "✅ Found $count online professionals\n";
}
?>
