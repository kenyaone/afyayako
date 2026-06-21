<?php
// Simple PDO-based setup
$dbPath = __DIR__ . '/api/database/database.sqlite';

if (!file_exists($dbPath)) {
    die("Database not found");
}

try {
    $db = new PDO('sqlite:' . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $areas = [
        1 => ['Nairobi Central', 'Westlands', 'Upper Hill'],
        2 => ['Mombasa', 'Mombasa CBD'],
        3 => ['Kisumu', 'Kisumu CBD'],
        4 => ['Nakuru', 'Nakuru CBD'],
        5 => ['Nairobi', 'Karen', 'Lavington'],
        6 => ['Nairobi', 'South B', 'South C'],
    ];

    $stmt = $db->prepare('UPDATE professionals SET service_areas = ? WHERE id = ?');

    foreach ($areas as $id => $list) {
        $json = json_encode($list);
        $stmt->execute([$json, $id]);
    }

    echo "Service areas seeded successfully";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
