<?php
// Update professional locations to precise street addresses
$dbPath = __DIR__ . '/api/database/database.sqlite';

if (!file_exists($dbPath)) {
    die('Database not found');
}

$db = new PDO('sqlite:' . $dbPath);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$updates = [
    1 => 'Westlands - Chiromo Road',
    2 => 'Mombasa - Nkrumah Road',
    3 => 'Kisumu - Oginga Odinga Street',
    4 => 'Nakuru - Kenyatta Avenue',
    5 => 'Upper Hill - Limuru Road',
    6 => 'Kilimani - Ngong Road',
];

echo "=== Updating Professional Locations ===\n\n";

$stmt = $db->prepare('UPDATE professionals SET location_city = ? WHERE id = ?');

foreach ($updates as $id => $location) {
    $stmt->execute([$location, $id]);
    echo "✓ Professional $id: $location\n";
}

echo "\n✓ Locations updated!\n\n";

// Also update service areas
$serviceAreas = [
    1 => ['Westlands - Chiromo Road', 'Westlands - Mpesi Lane', 'Upper Hill - Limuru Road'],
    2 => ['Mombasa - Nkrumah Road', 'Mombasa - Jomo Kenyatta Avenue'],
    3 => ['Kisumu - Oginga Odinga Street', 'Kisumu - Kenyatta Avenue'],
    4 => ['Nakuru - Kenyatta Avenue', 'Nakuru - Jomo Kenyatta Street'],
    5 => ['Upper Hill - Limuru Road', 'Karen - Karen Road', 'Lavington - Valley Road'],
    6 => ['Kilimani - Ngong Road', 'South B - Langata Road', 'South C - Mombasa Road'],
];

$stmtAreas = $db->prepare('UPDATE professionals SET service_areas = ? WHERE id = ?');

echo "Updating service areas:\n";
foreach ($serviceAreas as $id => $areas) {
    $json = json_encode($areas);
    $stmtAreas->execute([$json, $id]);
    echo "✓ Professional $id: " . implode(', ', $areas) . "\n";
}

echo "\n✓ All updates complete!\n";

// Verify
echo "\nVerification:\n";
$result = $db->query('SELECT id, location_city, service_areas FROM professionals WHERE id <= 3');
foreach ($result->fetchAll(PDO::FETCH_ASSOC) as $row) {
    $areas = json_decode($row['service_areas'], true) ?? [];
    echo "ID {$row['id']}: {$row['location_city']}\n";
    if ($areas) {
        echo "  Areas: " . implode(' | ', array_slice($areas, 0, 2)) . "\n";
    }
}
?>
