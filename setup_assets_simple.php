<?php
$base = '/home/qnztnquh/public_html';

echo "=== SETTING UP ASSETS ===\n\n";

// Step 1: Create assets directory
@mkdir("$base/assets", 0755, true);
@mkdir("$base/lessons", 0755, true);
echo "[*] Directories prepared\n";

// Step 2: Copy from dist
$src_assets = "$base/dist/assets";
$dst_assets = "$base/assets";

if (is_dir($src_assets)) {
    // List all files in source
    $files = glob("$src_assets/*");
    $count = 0;
    foreach ($files as $file) {
        if (is_file($file)) {
            $filename = basename($file);
            copy($file, "$dst_assets/$filename");
            $count++;
        }
    }
    echo "[✓] Copied $count files to /assets\n";
}

// Step 3: Verify
$jsFile = "$base/assets/index-CBwSdAwC.js";
if (file_exists($jsFile)) {
    $size = round(filesize($jsFile)/1024/1024, 2);
    echo "[✓] Verified index-CBwSdAwC.js ($size MB)\n";
    
    // Check content type
    $header = file_get_contents($jsFile, false, null, 0, 50);
    echo "[✓] File starts with: " . substr($header, 0, 30) . "...\n";
}

echo "\n[✓] ASSETS SETUP COMPLETE\n";
?>
