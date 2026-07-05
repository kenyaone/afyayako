<?php
/**
 * Run pending migrations on production
 */

define('LARAVEL_START', microtime(true));
require __DIR__ . '/api/vendor/autoload.php';
$app = require __DIR__ . '/api/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');

echo "<pre>";
echo "=== Running Migrations ===\n\n";

try {
    // Suppress output to return from call
    ob_start();
    $kernel->call('migrate', ['--force' => true]);
    $output = ob_get_clean();

    echo htmlspecialchars($output);
    echo "\n✓ Migrations completed\n";
} catch (Exception $e) {
    echo "✗ Error: " . htmlspecialchars($e->getMessage());
}

echo "</pre>";
?>
