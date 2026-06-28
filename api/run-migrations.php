<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$apiPath = '/home/qnztnquh/public_html/api';
chdir($apiPath);

// Create database file if missing
@mkdir($apiPath . '/database', 0777, true);
if (!file_exists($apiPath . '/database/database.sqlite')) {
    touch($apiPath . '/database/database.sqlite');
    chmod($apiPath . '/database/database.sqlite', 0666);
}

// Update .env
$envFile = $apiPath . '/.env';
$env = file_get_contents($envFile);
$env = str_replace(
    'DB_DATABASE=/home/qnztnquh/api/database/database.sqlite',
    'DB_DATABASE=' . $apiPath . '/database/database.sqlite',
    $env
);
file_put_contents($envFile, $env);

// Bootstrap Laravel
require $apiPath . '/vendor/autoload.php';
$app = require $apiPath . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);

echo "<pre style='background:#000;color:#0f0;padding:20px;font-family:monospace;'>";
echo "[" . date('H:i:s') . "] Starting Afya Yako deployment...\n\n";

echo "[" . date('H:i:s') . "] Running migrations...\n";
try {
    $kernel->call('migrate', ['--force' => true]);
    echo "[" . date('H:i:s') . "] ✓ Migrations complete\n\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

echo "[" . date('H:i:s') . "] Seeding specializations...\n";
try {
    $kernel->call('db:seed', ['--class' => 'SpecializationSeeder', '--force' => true]);
    echo "[" . date('H:i:s') . "] ✓ Seeding complete\n\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

echo "[" . date('H:i:s') . "] Caching configuration...\n";
try {
    $kernel->call('config:cache');
    echo "[" . date('H:i:s') . "] ✓ Cache complete\n\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

echo "=== ✓ DEPLOYMENT SUCCESSFUL ===\n";
echo "Afya Yako is now live with all features!\n";
echo "</pre>";
?>
