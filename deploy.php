<?php
/**
 * Deployment Script for Afya Yako Professional Application
 * Run: php deploy.php
 */

echo "=== Afya Yako Production Deployment ===\n\n";

$baseDir = __DIR__;
$tarFile = $baseDir . '/afyayako-deploy.tar.gz';

if (!file_exists($tarFile)) {
    die("✗ Deployment package not found: $tarFile\n");
}

echo "✓ Deployment package found\n\n";

// Extract tar.gz
echo "Extracting deployment package...\n";
$cmd = "tar -xzf '$tarFile' -C '$baseDir' 2>&1";
$output = shell_exec($cmd);
if ($output) {
    echo $output;
}
echo "✓ Package extracted\n\n";

// Fix permissions
echo "Setting file permissions...\n";
$dirs = [
    'api/storage',
    'api/bootstrap/cache',
    'api/database',
];

foreach ($dirs as $dir) {
    $path = $baseDir . '/' . $dir;
    if (is_dir($path)) {
        chmod($path, 0775);
        echo "  ✓ $dir\n";
    }
}

// Create storage subdirectories
$storageDirs = [
    'api/storage/uploads/professionals/photos',
    'api/storage/uploads/professionals/licenses',
];

foreach ($storageDirs as $dir) {
    $path = $baseDir . '/' . $dir;
    if (!is_dir($path)) {
        mkdir($path, 0775, true);
        echo "  ✓ Created $dir\n";
    } else {
        chmod($path, 0775);
        echo "  ✓ Chmod $dir\n";
    }
}

echo "\n✓ File permissions set\n\n";

// Extract vendor if not exists
echo "Checking vendor files...\n";
if (!is_dir($baseDir . '/api/vendor')) {
    echo "Extracting vendor.tar.gz...\n";
    $cmd = "cd '$baseDir/api' && tar -xzf vendor.tar.gz 2>&1 | head -10";
    $output = shell_exec($cmd);
    echo $output ? $output : "  (extracting...)\n";
    echo "✓ Vendor extracted\n";
} else {
    echo "✓ Vendor already extracted\n";
}

echo "\n✓ Deployment extraction complete\n\n";

// Run migration
echo "Setting up database...\n";
$migrationFile = $baseDir . '/run-migration.php';
if (file_exists($migrationFile)) {
    ob_start();
    include $migrationFile;
    $output = ob_get_clean();
    echo $output;
} else {
    echo "✗ Migration script not found\n";
}

echo "\n=== Deployment Status ===\n";

// Verify files
$checks = [
    'apply.html' => 'Apply page',
    'api/app/Http/Controllers/ProfessionalController.php' => 'Professional Controller',
    'api/app/Models/Professional.php' => 'Professional Model',
    'api/config/filesystems.php' => 'Filesystem Config',
    'api/professionals-apply.php' => 'API Endpoint',
    'api/database/database.sqlite' => 'Database',
    'PROFESSIONAL_UPLOAD_FEATURE.md' => 'Documentation',
];

$allGood = true;
foreach ($checks as $file => $desc) {
    if (file_exists($baseDir . '/' . $file)) {
        echo "✓ $desc\n";
    } else {
        echo "✗ $desc - MISSING\n";
        $allGood = false;
    }
}

// Verify directories
$dirChecks = [
    'api/storage/uploads/professionals/photos' => 'Photo storage',
    'api/storage/uploads/professionals/licenses' => 'License storage',
];

echo "\n";
foreach ($dirChecks as $dir => $desc) {
    $path = $baseDir . '/' . $dir;
    if (is_dir($path) && is_writable($path)) {
        echo "✓ $desc\n";
    } else {
        echo "✗ $desc - PROBLEM\n";
        $allGood = false;
    }
}

echo "\n=== Next Steps ===\n\n";

echo "1. Update .env file with production settings:\n";
echo "   - APP_URL=https://afyayako.co.ke\n";
echo "   - FRONTEND_URL=https://afyayako.co.ke\n";
echo "   - DB_DATABASE=/home/qnztnquh/public_html/api/database/database.sqlite\n\n";

echo "2. Test the form:\n";
echo "   - https://afyayako.co.ke/apply.html\n\n";

echo "3. Clean up deployment package:\n";
echo "   - rm afyayako-deploy.tar.gz\n";
echo "   - rm deploy.php\n\n";

if ($allGood) {
    echo "✓ DEPLOYMENT SUCCESSFUL!\n\n";
    echo "The professional application form is now live at:\n";
    echo "https://afyayako.co.ke/apply.html\n";
} else {
    echo "⚠ DEPLOYMENT COMPLETED WITH WARNINGS\n\n";
    echo "Please check the issues above and manually fix any problems.\n";
}

echo "\n=== End Deployment ===\n";
