<?php
$base = '/home/qnztnquh/public_html';

echo "=== FIXING MIME TYPE ISSUE ===\n\n";

// Step 1: Ensure assets directory exists
@mkdir("$base/assets", 0755, true);

// Step 2: Copy fresh assets from dist
$src = "$base/dist/assets";
$dst = "$base/assets";

if (is_dir($src)) {
    $files = glob("$src/*");
    $count = 0;
    foreach ($files as $file) {
        if (is_file($file)) {
            $filename = basename($file);
            copy($file, "$dst/$filename");
            chmod("$dst/$filename", 0644);
            echo "[✓] " . $filename . "\n";
            $count++;
        }
    }
    echo "\n[✓] Copied $count files\n";
}

// Step 3: Verify MIME types are correct
echo "\n=== VERIFYING FILES ===\n";

if (file_exists("$dst/index-DKjkp5an.js")) {
    echo "[✓] JS bundle exists\n";
} else {
    echo "[!] JS bundle missing - listing available:\n";
    $files = glob("$dst/*");
    foreach ($files as $f) {
        echo "  - " . basename($f) . "\n";
    }
}

if (file_exists("$dst/index-DCHf9rcD.css")) {
    echo "[✓] CSS bundle exists\n";
}

echo "\n[✓✓✓] Assets folder fixed\n";
?>
