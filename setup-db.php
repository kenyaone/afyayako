<?php
$envFile = '/home/qnztnquh/public_html/api/.env';
$content = file_get_contents($envFile);

// Fix database path
$content = str_replace(
    'DB_DATABASE=/home/tele/uberhealth/api/database/database.sqlite',
    'DB_DATABASE=/home/qnztnquh/public_html/api/database/database.sqlite',
    $content
);

file_put_contents($envFile, $content);

// Create database file
@mkdir('/home/qnztnquh/public_html/api/database', 0755, true);
touch('/home/qnztnquh/public_html/api/database/database.sqlite');
chmod('/home/qnztnquh/public_html/api/database/database.sqlite', 0666);

chdir('/home/qnztnquh/public_html/api');
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);

echo "<pre style='background:#000;color:#0f0;padding:20px;'>";
echo "[1] Running migrations...\n";
$kernel->call('migrate', ['--force' => true]);

echo "\n[2] Seeding specializations...\n";
$kernel->call('db:seed', ['--class' => 'SpecializationSeeder', '--force' => true]);

echo "\n[3] Caching config...\n";
$kernel->call('config:cache');

echo "\n✓ DEPLOYMENT COMPLETE!\n";
echo "</pre>";
?>
