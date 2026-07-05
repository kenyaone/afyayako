<?php
$api = '/home/qnztnquh/public_html/api';

echo "=== SEEDING SAMPLE COUNSELLORS ===\n\n";

chdir($api);

// Run seeder
echo "[*] Creating sample counsellors...\n";
$output = shell_exec('php artisan db:seed --class=SampleCounsellorsSeeder 2>&1');
echo $output;

// Mark them as always online
echo "\n[*] Setting sample counsellors as always online...\n";

$db = new PDO('sqlite:' . $api . '/database/database.sqlite');

// Get sample counsellor user IDs
$stmt = $db->query("SELECT u.id FROM users u WHERE u.role = 'professional' AND u.email LIKE '%example.com%'");
$userIds = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($userIds as $row) {
    $userId = $row['id'];
    
    // Insert or update presence to mark as online
    $db->exec("DELETE FROM presences WHERE user_id = $userId");
    $db->exec("INSERT INTO presences (user_id, is_online, last_seen_at, created_at, updated_at) 
              VALUES ($userId, 1, datetime('now'), datetime('now'), datetime('now'))");
}

echo "[✓] Set " . count($userIds) . " sample counsellors as online\n";
echo "\n✓ SAMPLE COUNSELLORS READY\n";
?>
