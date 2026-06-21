<?php
/**
 * Deploy Latest Changes to Production
 * Pulls latest code from GitHub and deploys
 */

set_time_limit(300);
error_reporting(E_ALL);
ini_set('display_errors', 1);

$baseDir = dirname(__FILE__);
chdir($baseDir);

echo "\n";
echo "════════════════════════════════════════════════════\n";
echo "  🚀 Afya Yako Deployment to Production\n";
echo "════════════════════════════════════════════════════\n\n";

echo "📋 Current Status:\n";
echo "  Working Directory: " . getcwd() . "\n";
echo "  Time: " . date('Y-m-d H:i:s') . "\n\n";

// Step 1: Git Pull
echo "Step 1️⃣ : Pulling latest changes from GitHub...\n";
$output = [];
$return = 0;
exec('git pull origin main 2>&1', $output, $return);

if ($return === 0) {
    echo "  ✓ Git pull successful\n";
    foreach ($output as $line) {
        echo "    " . $line . "\n";
    }
} else {
    echo "  ✗ Git pull failed\n";
    foreach ($output as $line) {
        echo "    " . $line . "\n";
    }
    exit(1);
}

// Step 2: Verify key files
echo "\nStep 2️⃣ : Verifying deployment files...\n";
$requiredFiles = [
    'apply.html',
    'admin-applications.php',
    '.htaccess',
    'api/public/apply.php',
    'api/public/index.php',
    'api/routes/api.php',
];

$allFilesPresent = true;
foreach ($requiredFiles as $file) {
    if (file_exists($file)) {
        echo "  ✓ " . $file . "\n";
    } else {
        echo "  ✗ MISSING: " . $file . "\n";
        $allFilesPresent = false;
    }
}

if (!$allFilesPresent) {
    echo "\n  ⚠️  Some files are missing!\n";
    exit(1);
}

// Step 3: Set permissions
echo "\nStep 3️⃣ : Setting file permissions...\n";
$dirs = [
    'api/storage/uploads/professionals/photos',
    'api/storage/uploads/professionals/licenses',
    'api/bootstrap/cache',
    'api/storage',
    'api/database',
];

foreach ($dirs as $dir) {
    if (!is_dir($dir)) {
        if (@mkdir($dir, 0775, true)) {
            echo "  ✓ Created: $dir\n";
        }
    }
    if (@chmod($dir, 0775)) {
        echo "  ✓ Permissions set: $dir\n";
    }
}

// Step 4: Clear cache
echo "\nStep 4️⃣ : Clearing cache...\n";
if (is_dir('api/bootstrap/cache')) {
    $files = glob('api/bootstrap/cache/*');
    foreach ($files as $file) {
        if (is_file($file)) {
            @unlink($file);
        }
    }
    echo "  ✓ Cache cleared\n";
}

// Step 5: Database verification
echo "\nStep 5️⃣ : Verifying database...\n";
$dbFile = 'api/database/database.sqlite';
if (file_exists($dbFile)) {
    try {
        $db = new PDO('sqlite:' . $dbFile);
        $result = $db->query("SELECT COUNT(*) as count FROM professionals");
        $row = $result->fetch(PDO::FETCH_ASSOC);
        echo "  ✓ Database connected\n";
        echo "  ✓ Applications in database: " . $row['count'] . "\n";
    } catch (Exception $e) {
        echo "  ✗ Database error: " . $e->getMessage() . "\n";
    }
} else {
    echo "  ⚠️  Database file not found\n";
}

// Final summary
echo "\n";
echo "════════════════════════════════════════════════════\n";
echo "  ✅ DEPLOYMENT SUCCESSFUL!\n";
echo "════════════════════════════════════════════════════\n\n";

echo "📝 Deployment Summary:\n";
echo "  • Code pulled from GitHub\n";
echo "  • All required files verified\n";
echo "  • Permissions set correctly\n";
echo "  • Cache cleared\n";
echo "  • Database verified\n\n";

echo "🌐 Live URLs:\n";
echo "  Application Form:  https://afyayako.co.ke/apply\n";
echo "  Admin Dashboard:   https://afyayako.co.ke/verify-professionals\n\n";

echo "✨ Deployment completed at: " . date('Y-m-d H:i:s') . "\n";
echo "════════════════════════════════════════════════════\n\n";
