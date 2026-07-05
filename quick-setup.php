<?php
/**
 * Quick setup script to organize deployed files
 * This script moves files to correct locations and runs migration
 */

$baseDir = __DIR__;

echo "=== Afya Yako Quick Setup ===\n\n";

// Files to move to their correct locations
$fileMoves = [
    'ProfessionalController.php' => 'api/app/Http/Controllers/ProfessionalController.php',
    'Professional.php' => 'api/app/Models/Professional.php',
    'filesystems.php' => 'api/config/filesystems.php',
    '2026_06_21_000001_create_professionals_table.php' => 'api/database/migrations/2026_06_21_000001_create_professionals_table.php',
    'api_endpoint.php' => 'api/professionals-apply.php', // Alternative naming
];

echo "Step 1: Creating directories...\n";
$dirs = [
    'api/app',
    'api/app/Http',
    'api/app/Http/Controllers',
    'api/app/Models',
    'api/config',
    'api/database/migrations',
    'api/storage/uploads/professionals/photos',
    'api/storage/uploads/professionals/licenses',
    'api/bootstrap/cache',
];

foreach ($dirs as $dir) {
    $path = $baseDir . '/' . $dir;
    if (!is_dir($path)) {
        if (@mkdir($path, 0775, true)) {
            echo "✓ Created: $dir\n";
        } else {
            echo "⚠ Could not create: $dir (may already exist)\n";
        }
    } else {
        @chmod($path, 0775);
        echo "✓ Directory exists: $dir\n";
    }
}

echo "\nStep 2: Moving files to correct locations...\n";
foreach ($fileMoves as $source => $dest) {
    $sourcePath = $baseDir . '/' . $source;
    $destPath = $baseDir . '/' . $dest;

    if (file_exists($sourcePath)) {
        // Create destination directory if needed
        $destDir = dirname($destPath);
        if (!is_dir($destDir)) {
            @mkdir($destDir, 0775, true);
        }

        if (@rename($sourcePath, $destPath)) {
            echo "✓ Moved: $source → $dest\n";
        } elseif (@copy($sourcePath, $destPath)) {
            @unlink($sourcePath);
            echo "✓ Copied: $source → $dest\n";
        } else {
            echo "✗ Failed to move: $source\n";
        }
    } else {
        echo "⚠ Source file not found: $source\n";
    }
}

echo "\nStep 3: Setting permissions...\n";
$permDirs = [
    'api/storage' => 0775,
    'api/database' => 0775,
    'api/bootstrap' => 0775,
];

foreach ($permDirs as $dir => $perms) {
    $path = $baseDir . '/' . $dir;
    if (is_dir($path)) {
        @chmod($path, $perms);
        echo "✓ Chmod: $dir\n";
    }
}

echo "\nStep 4: Running database migration...\n";
$migrationFile = $baseDir . '/run-migration.php';
if (file_exists($migrationFile)) {
    ob_start();
    include $migrationFile;
    $output = ob_get_clean();
    echo $output;
} else {
    echo "⚠ Migration script not found\n";
}

echo "\nStep 5: Verification...\n";
$checks = [
    'apply.html' => 'Form',
    'api/app/Http/Controllers/ProfessionalController.php' => 'Controller',
    'api/app/Models/Professional.php' => 'Model',
    'api/config/filesystems.php' => 'Config',
    'api/professionals-apply.php' => 'API Endpoint',
    'api/database/database.sqlite' => 'Database',
];

$allGood = true;
foreach ($checks as $file => $desc) {
    $path = $baseDir . '/' . $file;
    if (file_exists($path)) {
        echo "✓ $desc exists\n";
    } else {
        echo "✗ $desc missing: $file\n";
        $allGood = false;
    }
}

echo "\n=== Setup Complete ===\n";
if ($allGood) {
    echo "\n✅ DEPLOYMENT SUCCESSFUL!\n";
    echo "\nForm is now live at:\n";
    echo "https://afyayako.co.ke/apply.html\n";
    echo "\nYou can now:\n";
    echo "1. Test the form\n";
    echo "2. Delete this script and other temp files\n";
    echo "3. Update api/.env with production settings\n";
} else {
    echo "\n⚠ Setup completed with some issues. Check above for details.\n";
}
