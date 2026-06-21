<?php
$base = '/home/qnztnquh/public_html';

echo "=== DEBUG ASSETS ===\n\n";

// Check if assets directory exists and is accessible
echo "1. Checking /assets directory:\n";
if (is_dir("$base/assets")) {
    echo "   [✓] Directory exists\n";
    echo "   [✓] Is link: " . (is_link("$base/assets") ? "yes" : "no") . "\n";
    
    $jsFile = "$base/assets/index-CBwSdAwC.js";
    if (file_exists($jsFile)) {
        echo "   [✓] JS file exists: " . basename($jsFile) . "\n";
        echo "   [✓] File size: " . round(filesize($jsFile)/1024/1024, 2) . "MB\n";
        echo "   [✓] Is readable: " . (is_readable($jsFile) ? "yes" : "no") . "\n";
        
        // Check first 100 bytes
        $header = file_get_contents($jsFile, false, null, 0, 100);
        if (strpos($header, 'var ') !== false || strpos($header, 'function') !== false || strpos($header, 'const ') !== false) {
            echo "   [✓] Looks like JavaScript\n";
        } else {
            echo "   [!] Content type unclear\n";
            echo "   First 50 chars: " . substr($header, 0, 50) . "\n";
        }
    } else {
        echo "   [✗] JS file NOT found\n";
    }
} else {
    echo "   [✗] Directory doesn't exist\n";
}

echo "\n2. Checking server headers for .htaccess rules:\n";
$htaccess = "$base/.htaccess";
if (file_exists($htaccess)) {
    echo "   [✓] .htaccess exists\n";
    $rules = file_get_contents($htaccess);
    if (strpos($rules, 'RewriteCond') !== false) {
        echo "   [✓] Has RewriteCond\n";
    }
}

echo "\n3. Checking if /assets gets rewritten:\n";
echo "   Test: Is /assets/test.js treated as a file?\n";
echo "   File exists check: " . (file_exists("$base/assets") ? "yes" : "no") . "\n";

// The issue might be that .htaccess needs to exclude /assets and /lessons explicitly
echo "\n4. Recommended .htaccess:\n";
echo "Options -MultiViews\n";
echo "RewriteEngine On\n";
echo "RewriteCond %{REQUEST_FILENAME} !-f\n";
echo "RewriteCond %{REQUEST_FILENAME} !-d\n";
echo "RewriteRule ^ index.html [QSA,L]\n";
?>
