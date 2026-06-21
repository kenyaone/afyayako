<?php
define('LARAVEL_START', microtime(true));
require __DIR__ . '/api/vendor/autoload.php';
$app = require __DIR__ . '/api/bootstrap/app.php';
$db = $app->make('db');

echo "<pre>";
echo "Database connection: " . $db->getConfig('driver') . "\n";
echo "Database name: " . $db->getConfig('database') . "\n\n";

$columns = $db->select("PRAGMA table_info(professionals)");
echo "Professionals table columns:\n";
foreach ($columns as $col) {
    echo "  {$col->name} ({$col->type})\n";
}
echo "</pre>";
?>
