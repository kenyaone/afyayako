<?php
// Call this file on production server to seed service areas
// Usage: php setup-service-areas.php

$baseDir = dirname(__FILE__) . '/api';
chdir($baseDir);

require $baseDir . '/vendor/autoload.php';
$app = require $baseDir . '/bootstrap/app.php';

// Get database connection
$db = $app->make('db');

echo "=== Seeding Service Areas ===\n\n";

$serviceAreas = [
    1 => ['Nairobi Central', 'Westlands', 'Upper Hill'],
    2 => ['Mombasa', 'Mombasa CBD'],
    3 => ['Kisumu', 'Kisumu CBD'],
    4 => ['Nakuru', 'Nakuru CBD'],
    5 => ['Nairobi', 'Karen', 'Lavington'],
    6 => ['Nairobi', 'South B', 'South C'],
];

foreach ($serviceAreas as $profId => $areas) {
    $json = json_encode($areas);
    $db->table('professionals')
        ->where('id', $profId)
        ->update(['service_areas' => $json]);

    echo "✓ Professional {$profId}: " . implode(', ', $areas) . "\n";
}

echo "\n✓ Service areas seeded successfully\n";

// Verify
$pros = $db->table('professionals')->whereIn('id', [1, 2, 3])->select('id', 'service_areas')->get();
echo "\nVerification:\n";
foreach ($pros as $pro) {
    echo "ID {$pro->id}: " . $pro->service_areas . "\n";
}
?>
