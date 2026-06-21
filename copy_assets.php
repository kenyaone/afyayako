<?php
$base = '/home/qnztnquh/public_html';

echo "=== COPYING ASSETS ===\n\n";

// Copy assets from dist
if (is_dir("$base/dist/assets")) {
    echo "[*] Copying from /dist/assets to /assets...\n";
    
    // Remove old assets if it exists as broken symlink
    if (is_link("$base/assets") || (is_dir("$base/assets") && !file_exists("$base/assets"))) {
        exec("rm -rf $base/assets");
        echo "[*] Removed old /assets\n";
    }
    
    // Copy the entire directory
    exec("cp -r $base/dist/assets $base/assets", $out, $code);
    
    if ($code === 0) {
        echo "[✓] Assets copied successfully\n";
        
        // Verify
        $jsFile = "$base/assets/index-CBwSdAwC.js";
        if (file_exists($jsFile)) {
            echo "[✓] Verified: " . basename($jsFile) . " (" . round(filesize($jsFile)/1024/1024, 2) . "MB)\n";
        }
    } else {
        echo "[✗] Copy failed: " . implode("\n", $out) . "\n";
    }
} else {
    echo "[✗] Source /dist/assets not found\n";
}

// Also copy lessons
if (is_dir("$base/dist/lessons")) {
    echo "[*] Copying /lessons...\n";
    exec("cp -r $base/dist/lessons $base/lessons 2>/dev/null");
    echo "[✓] Lessons copied\n";
}

echo "\n[✓] ASSETS DEPLOYMENT COMPLETE\n";
?>
