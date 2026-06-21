<?php
/**
 * Automatic Deployment Script
 * Access via browser: https://afyayako.co.ke/auto-deploy.php
 * This script extracts files, sets permissions, and runs migrations
 */

ini_set('max_execution_time', 300);
header('Content-Type: text/html; charset=utf-8');

// Start HTML output
?>
<!DOCTYPE html>
<html>
<head>
    <title>Afya Yako - Auto Deploy</title>
    <style>
        body { font-family: monospace; background: #f5f5f5; padding: 20px; }
        .container { max-width: 900px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { border-bottom: 2px solid #0f766e; padding-bottom: 10px; margin-bottom: 20px; }
        .step { margin: 15px 0; padding: 10px; background: #f9f9f9; border-left: 3px solid #0f766e; }
        .success { color: #166534; background: #dcfce7; border-color: #22c55e; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .error { color: #991b1b; background: #fee2e2; border-color: #ef4444; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .warning { color: #b45309; background: #fef3c7; border-color: #f59e0b; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .code { background: #272822; color: #f8f8f2; padding: 15px; border-radius: 4px; overflow-x: auto; margin: 10px 0; }
        .status { margin-top: 20px; padding: 15px; border-radius: 4px; }
        .status.success { background: #dcfce7; border: 1px solid #22c55e; }
        .status.error { background: #fee2e2; border: 1px solid #ef4444; }
        h2 { color: #0f766e; margin-top: 30px; }
        ul { margin: 10px 0; }
        li { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Afya Yako Production Deployment</h1>
            <p>Automated Setup & Migration</p>
        </div>

<?php

$baseDir = dirname(__FILE__);
$tarFile = $baseDir . '/afyayako-deploy.tar.gz';

// Function to safely execute commands and capture output
function runCommand($cmd, $cwd = null) {
    if ($cwd) {
        $cmd = "cd '$cwd' && $cmd";
    }
    $output = shell_exec($cmd . ' 2>&1');
    return $output;
}

// Track success
$allGood = true;

echo '<div class="step">';
echo '<h2>✓ Step 1: Checking Prerequisites</h2>';

// Check tar file
if (file_exists($tarFile)) {
    echo '<div class="success">✓ Deployment package found (' . filesize($tarFile) . ' bytes)</div>';
} else {
    echo '<div class="error">✗ Deployment package not found: ' . $tarFile . '</div>';
    $allGood = false;
}

// Check PHP functions
if (extension_loaded('phar')) {
    echo '<div class="success">✓ PHP phar extension available</div>';
} else {
    echo '<div class="warning">⚠ PHP phar extension not available (will try tar command)</div>';
}

echo '</div>';

if ($allGood) {
    echo '<div class="step">';
    echo '<h2>✓ Step 2: Extracting Deployment Package</h2>';

    // Extract tar file
    $extractCmd = "tar -xzf '$tarFile' -C '$baseDir' 2>&1";
    echo '<div class="code">$ ' . htmlspecialchars($extractCmd) . '</div>';

    $output = shell_exec($extractCmd);
    if ($output) {
        echo '<div class="code">' . htmlspecialchars($output) . '</div>';
    }

    // Verify extraction
    $files = [
        'api/app/Http/Controllers/ProfessionalController.php',
        'api/app/Models/Professional.php',
        'api/config/filesystems.php',
        'api/professionals-apply.php'
    ];

    foreach ($files as $file) {
        $path = $baseDir . '/' . $file;
        if (file_exists($path)) {
            echo '<div class="success">✓ ' . $file . ' extracted (' . filesize($path) . ' bytes)</div>';
        } else {
            echo '<div class="error">✗ ' . $file . ' not found after extraction</div>';
            $allGood = false;
        }
    }

    echo '</div>';
}

if ($allGood) {
    echo '<div class="step">';
    echo '<h2>✓ Step 3: Creating Directories & Setting Permissions</h2>';

    $dirs = [
        'api/storage/uploads/professionals/photos' => 0775,
        'api/storage/uploads/professionals/licenses' => 0775,
        'api/storage/app' => 0775,
        'api/bootstrap/cache' => 0775,
        'api/database' => 0775,
    ];

    foreach ($dirs as $dir => $perms) {
        $path = $baseDir . '/' . $dir;
        if (!is_dir($path)) {
            if (mkdir($path, $perms, true)) {
                echo '<div class="success">✓ Created ' . $dir . ' (755)</div>';
            } else {
                echo '<div class="error">✗ Failed to create ' . $dir . '</div>';
                $allGood = false;
            }
        } else {
            if (chmod($path, $perms)) {
                echo '<div class="success">✓ Set permissions on ' . $dir . ' (775)</div>';
            } else {
                echo '<div class="warning">⚠ Could not set permissions on ' . $dir . ' (may need manual fix)</div>';
            }
        }
    }

    echo '</div>';
}

if ($allGood) {
    echo '<div class="step">';
    echo '<h2>✓ Step 4: Running Database Migration</h2>';

    $migrationFile = $baseDir . '/run-migration.php';
    if (file_exists($migrationFile)) {
        echo '<p>Executing migration...</p>';
        ob_start();
        include $migrationFile;
        $output = ob_get_clean();
        echo '<div class="code">' . htmlspecialchars($output) . '</div>';
    } else {
        echo '<div class="error">✗ Migration script not found</div>';
        $allGood = false;
    }

    echo '</div>';
}

// Final status
echo '<div class="step">';
echo '<h2>✓ Step 5: Deployment Verification</h2>';

$verifyFiles = [
    'apply.html' => 'Application Form',
    'api/professionals-apply.php' => 'API Endpoint',
    'api/database/database.sqlite' => 'Database',
    'PROFESSIONAL_UPLOAD_FEATURE.md' => 'Documentation',
];

$missingFiles = [];
foreach ($verifyFiles as $file => $desc) {
    $path = $baseDir . '/' . $file;
    if (file_exists($path)) {
        echo '<div class="success">✓ ' . $desc . ' (' . $file . ')</div>';
    } else {
        echo '<div class="error">✗ ' . $desc . ' missing (' . $file . ')</div>';
        $missingFiles[] = $file;
    }
}

$storageDirs = [
    'api/storage/uploads/professionals/photos' => 'Photo Storage',
    'api/storage/uploads/professionals/licenses' => 'License Storage',
];

foreach ($storageDirs as $dir => $desc) {
    $path = $baseDir . '/' . $dir;
    if (is_dir($path)) {
        $writable = is_writable($path);
        if ($writable) {
            echo '<div class="success">✓ ' . $desc . ' (writable)</div>';
        } else {
            echo '<div class="warning">⚠ ' . $desc . ' (exists but NOT writable - may need manual chmod)</div>';
        }
    } else {
        echo '<div class="error">✗ ' . $desc . ' does not exist</div>';
    }
}

echo '</div>';

// Final status
if ($allGood && empty($missingFiles)) {
    echo '<div class="status success">';
    echo '<h2>✅ DEPLOYMENT SUCCESSFUL!</h2>';
    echo '<p>All files extracted and database migrated.</p>';
    echo '<h3>✓ Next Steps:</h3>';
    echo '<ul>';
    echo '<li><strong>Test Form:</strong> <a href="/apply.html" target="_blank">https://afyayako.co.ke/apply.html</a></li>';
    echo '<li><strong>Update .env:</strong> Update API_URL and FRONTEND_URL in api/.env</li>';
    echo '<li><strong>Cleanup:</strong> Delete afyayako-deploy.tar.gz, auto-deploy.php, and other temp files</li>';
    echo '</ul>';
    echo '<h3>📝 Form is Live!</h3>';
    echo '<p>Professionals can now apply at: <a href="/apply.html" target="_blank">https://afyayako.co.ke/apply.html</a></p>';
    echo '</div>';
} else {
    echo '<div class="status error">';
    echo '<h2>⚠️ DEPLOYMENT COMPLETED WITH ISSUES</h2>';
    if (!empty($missingFiles)) {
        echo '<p>Missing files:</p>';
        echo '<ul>';
        foreach ($missingFiles as $file) {
            echo '<li>' . htmlspecialchars($file) . '</li>';
        }
        echo '</ul>';
    }
    echo '<p>Please review the errors above and fix manually if needed.</p>';
    echo '</div>';
}

echo '<div class="step" style="margin-top: 30px;">';
echo '<h3>📋 Deployment Log</h3>';
echo '<p>All steps completed. Review any errors above.</p>';
echo '<p style="color: #666; font-size: 12px;">Deployment Time: ' . date('Y-m-d H:i:s') . '</p>';
echo '</div>';

echo '</div>'; // container
echo '</body></html>';
