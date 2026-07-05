<?php
/**
 * Deployment Executor - Run from command line or browser
 * Usage: php exec-deploy.php
 */

set_time_limit(300);
error_reporting(E_ALL);
ini_set('display_errors', 1);

$baseDir = dirname(__FILE__);
chdir($baseDir);

echo "\n";
echo "════════════════════════════════════════════════════\n";
echo "  🚀 Afya Yako Production Deployment Executor\n";
echo "════════════════════════════════════════════════════\n\n";

$steps = [];
$success = true;

// Step 1: Create directories
echo "Step 1️⃣ : Creating directories...\n";
$dirs = [
    'api/app/Http/Controllers',
    'api/app/Models',
    'api/config',
    'api/database/migrations',
    'api/storage/uploads/professionals/photos',
    'api/storage/uploads/professionals/licenses',
    'api/bootstrap/cache',
];

foreach ($dirs as $dir) {
    if (!is_dir($dir)) {
        if (@mkdir($dir, 0775, true)) {
            echo "  ✓ Created: $dir\n";
            $steps[] = "Created: $dir";
        } else {
            echo "  ✗ Failed to create: $dir\n";
            $success = false;
        }
    } else {
        echo "  ✓ Exists: $dir\n";
        @chmod($dir, 0775);
    }
}

// Step 2: Move files
echo "\nStep 2️⃣ : Moving files to correct locations...\n";
$moves = [
    'ProfessionalController.php' => 'api/app/Http/Controllers/ProfessionalController.php',
    'Professional.php' => 'api/app/Models/Professional.php',
    'filesystems.php' => 'api/config/filesystems.php',
    '2026_06_21_000001_create_professionals_table.php' => 'api/database/migrations/2026_06_21_000001_create_professionals_table.php',
    'professionals-apply.php' => 'api/professionals-apply.php',
];

foreach ($moves as $src => $dst) {
    if (file_exists($src)) {
        if (@rename($src, $dst)) {
            echo "  ✓ Moved: $src → $dst\n";
            $steps[] = "Moved: $src";
        } elseif (@copy($src, $dst)) {
            @unlink($src);
            echo "  ✓ Copied: $src → $dst\n";
            $steps[] = "Copied: $src";
        } else {
            echo "  ✗ Failed to move: $src\n";
            $success = false;
        }
    } else {
        echo "  ⚠ Source file not found: $src\n";
    }
}

// Step 3: Set permissions
echo "\nStep 3️⃣ : Setting permissions...\n";
$permDirs = [
    'api/storage' => 0775,
    'api/database' => 0775,
    'api/bootstrap' => 0775,
];

foreach ($permDirs as $dir => $perms) {
    if (is_dir($dir)) {
        if (@chmod($dir, $perms)) {
            echo "  ✓ Permissions set: $dir (775)\n";
            $steps[] = "Chmod: $dir";
        } else {
            echo "  ✗ Failed to set permissions: $dir\n";
        }
    }
}

// Step 4: Run migration
echo "\nStep 4️⃣ : Running database migration...\n";
$migrationFile = 'run-migration.php';

if (file_exists($migrationFile)) {
    echo "  Executing migration...\n\n";

    ob_start();
    include $migrationFile;
    $output = ob_get_clean();

    echo $output;
    $steps[] = "Migration executed";
} else {
    echo "  ✗ Migration script not found\n";
    $success = false;
}

// Step 5: Verify deployment
echo "\nStep 5️⃣ : Verifying deployment...\n";
$verifyFiles = [
    'apply.html' => 'Application Form',
    'api/app/Http/Controllers/ProfessionalController.php' => 'Professional Controller',
    'api/app/Models/Professional.php' => 'Professional Model',
    'api/config/filesystems.php' => 'Filesystem Config',
    'api/professionals-apply.php' => 'API Endpoint',
    'api/database/database.sqlite' => 'Database',
];

$allFilesOk = true;
foreach ($verifyFiles as $file => $desc) {
    if (file_exists($file)) {
        $size = filesize($file);
        echo "  ✓ $desc ($size bytes)\n";
    } else {
        echo "  ✗ $desc NOT FOUND: $file\n";
        $allFilesOk = false;
    }
}

// Step 6: Database verification
echo "\nStep 6️⃣ : Database verification...\n";
$dbFile = 'api/database/database.sqlite';
if (file_exists($dbFile)) {
    try {
        $db = new PDO('sqlite:' . $dbFile);
        $tables = $db->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll();
        echo "  ✓ Database connected\n";
        echo "  ✓ Tables: " . count($tables) . "\n";
        foreach ($tables as $table) {
            echo "    - " . $table['name'] . "\n";
        }
    } catch (Exception $e) {
        echo "  ✗ Database error: " . $e->getMessage() . "\n";
    }
} else {
    echo "  ✗ Database file not found\n";
}

// Final summary
echo "\n";
echo "════════════════════════════════════════════════════\n";
if ($allFilesOk && $success) {
    echo "  ✅ DEPLOYMENT SUCCESSFUL!\n";
    echo "════════════════════════════════════════════════════\n\n";
    echo "📝 Application Form:\n";
    echo "   https://afyayako.co.ke/apply.html\n\n";
    echo "📊 API Endpoint:\n";
    echo "   https://afyayako.co.ke/api/professionals-apply.php\n\n";
    echo "💾 Database:\n";
    echo "   /home/qnztnquh/public_html/api/database/database.sqlite\n\n";
    echo "📁 Storage:\n";
    echo "   /home/qnztnquh/public_html/api/storage/uploads/professionals/\n\n";
    echo "✨ Next Steps:\n";
    echo "   1. Visit the form: https://afyayako.co.ke/apply.html\n";
    echo "   2. Test a submission\n";
    echo "   3. Update api/.env with production settings\n";
    echo "   4. Clean up temporary files\n\n";
} else {
    echo "  ⚠️  DEPLOYMENT COMPLETED WITH ISSUES\n";
    echo "════════════════════════════════════════════════════\n\n";
    echo "Please review any errors above and fix manually if needed.\n\n";
}

echo "═══════════════════════════════════════════════════════\n";
echo "Deployment executed at: " . date('Y-m-d H:i:s') . "\n";
echo "═══════════════════════════════════════════════════════\n\n";
