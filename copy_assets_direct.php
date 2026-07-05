<?php
$base = '/home/qnztnquh/public_html';

// Clear old assets
@exec("rm -rf $base/assets");

// Create new directory
@mkdir("$base/assets", 0755, true);

// Get files from dist
$src_dir = "$base/dist/assets";
if (is_dir($src_dir)) {
    $files = glob("$src_dir/*");
    foreach ($files as $file) {
        if (is_file($file)) {
            $dest = "$base/assets/" . basename($file);
            copy($file, $dest);
            chmod($dest, 0644);
        }
    }
    echo "[✓] Assets copied from /dist/assets\n";
}

// Verify
$jsFile = "$base/assets/index-CBwSdAwC.js";
if (file_exists($jsFile)) {
    echo "[✓] Verified: index-CBwSdAwC.js\n";
    echo "[✓] Size: " . round(filesize($jsFile)/1024/1024, 2) . "MB\n";
}
?>
