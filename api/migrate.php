<?php
chdir('/home/qnztnquh/public_html/api');

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "<pre>";
echo "Running migrations...\n";
\Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
echo \Illuminate\Support\Facades\Artisan::output();

echo "\nSeeding specializations...\n";
\Illuminate\Support\Facades\Artisan::call('db:seed', ['--class' => 'SpecializationSeeder', '--force' => true]);
echo \Illuminate\Support\Facades\Artisan::output();

echo "\nClearing caches...\n";
\Illuminate\Support\Facades\Artisan::call('config:cache');
echo \Illuminate\Support\Facades\Artisan::output();

echo "\n✓ DEPLOYMENT COMPLETE!\n";
echo "</pre>";
?>
