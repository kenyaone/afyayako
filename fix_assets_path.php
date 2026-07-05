<?php
$base = '/home/qnztnquh/public_html';

// Option 1: Create symlink
if (!is_link("$base/assets")) {
    if (is_dir("$base/assets")) {
        exec("rm -rf $base/assets");
    }
    exec("ln -s $base/dist/assets $base/assets");
    echo "[✓] Created symlink: /assets → /dist/assets\n";
}

// Option 2: Copy assets directory
// exec("cp -r $base/dist/assets/* $base/assets/");
// echo "[✓] Copied assets to /public_html/assets\n";

// Verify
if (file_exists("$base/assets/index-CBwSdAwC.js")) {
    echo "[✓] Assets now accessible at /assets/index-CBwSdAwC.js\n";
} else {
    echo "[✗] Assets still not accessible\n";
}
?>
