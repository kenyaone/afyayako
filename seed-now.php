<?php
// Inline seeding script - minimal dependencies
$dbPath = dirname(__FILE__) . '/api/database/database.sqlite';

if (!file_exists($dbPath)) {
    die('Database not found: ' . $dbPath);
}

$db = new PDO('sqlite:' . $dbPath);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

echo "=== Seeding Service Areas ===\n\n";

$updates = [
    1 => ['Nairobi Central', 'Westlands', 'Upper Hill'],
    2 => ['Mombasa', 'Mombasa CBD'],
    3 => ['Kisumu', 'Kisumu CBD'],
    4 => ['Nakuru', 'Nakuru CBD'],
    5 => ['Nairobi', 'Karen', 'Lavington'],
    6 => ['Nairobi', 'South B', 'South C'],
];

$stmt = $db->prepare('UPDATE professionals SET service_areas = :areas WHERE id = :id');

foreach ($updates as $id => $areas) {
    $json = json_encode($areas);
    $stmt->execute([':areas' => $json, ':id' => $id]);
    echo "✓ Professional $id: " . implode(', ', $areas) . "\n";
}

echo "\n✓ Service areas seeded\n";

// Verify
$result = $db->query('SELECT id, service_areas FROM professionals LIMIT 3');
echo "\nVerification:\n";
foreach ($result->fetchAll(PDO::FETCH_ASSOC) as $row) {
    echo "ID {$row['id']}: " . ($row['service_areas'] ?? 'null') . "\n";
}
?>
