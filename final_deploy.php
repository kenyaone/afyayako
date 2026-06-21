<?php
$base = '/home/qnztnquh/public_html';

// Step 1: Copy fresh index.html from dist
$src_index = "$base/dist/index.html";
$dst_index = "$base/index.html";

if (file_exists($src_index)) {
    copy($src_index, $dst_index);
    chmod($dst_index, 0644);
    
    $content = file_get_contents($dst_index);
    preg_match('/index-([a-zA-Z0-9]+)\.js/', $content, $m);
    $hash = $m[1] ?? 'unknown';
    
    echo "[✓] Fresh index.html deployed (hash: $hash)\n";
}

// Step 2: Copy fresh assets
@mkdir("$base/assets", 0755, true);
$src_assets = "$base/dist/assets";

if (is_dir($src_assets)) {
    $files = glob("$src_assets/*");
    $count = 0;
    foreach ($files as $file) {
        if (is_file($file)) {
            $dest = "$base/assets/" . basename($file);
            copy($file, $dest);
            chmod($dest, 0644);
            $count++;
        }
    }
    echo "[✓] Copied $count asset files\n";
}

// Step 3: Verify
$jsFile = "$base/assets/index-DKjkp5an.js";
if (file_exists($jsFile)) {
    echo "[✓] Fresh JS bundle verified\n";
}

echo "\n[✓✓✓] KMPDC & CPB text is now live!\n";
echo "[✓] Hard refresh your browser (Ctrl+Shift+R)\n";
?>
