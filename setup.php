<?php
// Simple setup - just returns status of files
header('Content-Type: text/plain');

$dir = dirname(__FILE__);
$domain = 'afyayako.co.ke';

echo "=== Afya Yako Setup Status ===\n\n";

$files = [
    'apply.html' => 'Apply Form Page',
    'run-migration.php' => 'Migration Script',
    'api/professionals-apply.php' => 'API Endpoint',
    'PROFESSIONAL_UPLOAD_FEATURE.md' => 'Documentation',
];

echo "Files Present:\n";
foreach ($files as $file => $desc) {
    $path = $dir . '/' . $file;
    $exists = file_exists($path);
    echo ($exists ? '✓' : '✗') . ' ' . $desc . " ($file)\n";
}

echo "\nDirecories:\n";
$dirs = [
    'api/storage/uploads/professionals/photos' => 'Photo Storage',
    'api/storage/uploads/professionals/licenses' => 'License Storage',
];

foreach ($dirs as $dir_path => $desc) {
    $path = $dir . '/' . $dir_path;
    $exists = is_dir($path);
    $writable = $exists && is_writable($path);
    echo ($exists ? '✓' : '✗') . ' ' . $desc . " ($dir_path)";
    if ($exists && !$writable) echo ' [NOT WRITABLE]';
    echo "\n";
}

echo "\nDatabase:\n";
$db_path = $dir . '/api/database/database.sqlite';
if (file_exists($db_path)) {
    $size = filesize($db_path);
    echo "✓ Database exists ($size bytes)\n";

    if ($size > 0) {
        try {
            $db = new PDO('sqlite:' . $db_path);
            $tables = $db->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll();
            echo "  Tables: " . count($tables) . "\n";
            foreach ($tables as $t) {
                echo "    - " . $t['name'] . "\n";
            }
        } catch (Exception $e) {
            echo "  ✗ Error reading database: " . $e->getMessage() . "\n";
        }
    } else {
        echo "  ⚠ Database file is empty - need to run migration\n";
    }
} else {
    echo "✗ Database file not found\n";
}

echo "\n=== Setup Instructions ===\n\n";

echo "1. Extract deployment package:\n";
echo "   tar -xzf afyayako-deploy.tar.gz\n\n";

echo "2. Set permissions:\n";
echo "   chmod -R 775 api/storage/\n";
echo "   chmod -R 775 api/database/\n\n";

echo "3. Run database migration:\n";
echo "   php run-migration.php\n\n";

echo "4. Update .env file:\n";
echo "   APP_URL=https://afyayako.co.ke\n";
echo "   FRONTEND_URL=https://afyayako.co.ke\n\n";

echo "5. Test the form:\n";
echo "   https://afyayako.co.ke/apply.html\n\n";

echo "=== Access Form ===\n";
echo "https://" . $domain . "/apply.html\n";
