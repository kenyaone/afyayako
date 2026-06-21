<?php
$base = '/home/qnztnquh/public_html';

// Check which index.html exists and what it contains
echo "=== INDEX.HTML CHECK ===\n";
if (file_exists("$base/index.html")) {
    $content = file_get_contents("$base/index.html");
    $size = filesize("$base/index.html");
    echo "[✓] index.html found ($size bytes)\n";
    
    if (strpos($content, 'CBwSdAwC') !== false) {
        echo "[✓] Contains FRESH bundle hash (CBwSdAwC)\n";
    } elseif (strpos($content, 'C1gBv1pX') !== false) {
        echo "[✗] Contains OLD bundle hash (C1gBv1pX)\n";
    } else {
        $hashes = [];
        preg_match('/index-([a-zA-Z0-9]+)\.js/', $content, $hashes);
        if ($hashes) {
            echo "[!] Contains hash: " . $hashes[1] . "\n";
        }
    }
} else {
    echo "[✗] index.html not found\n";
}

echo "\n=== ASSETS CHECK ===\n";
$assets = glob("$base/assets/index-*.js");
foreach ($assets as $asset) {
    echo "[✓] Found: " . basename($asset) . "\n";
}

echo "\n=== DIST FOLDER CHECK ===\n";
if (is_dir("$base/dist")) {
    echo "[✓] /dist folder exists\n";
    $dist_index = "$base/dist/index.html";
    if (file_exists($dist_index)) {
        $content = file_get_contents($dist_index);
        if (strpos($content, 'CBwSdAwC') !== false) {
            echo "[✓] /dist/index.html has fresh bundle\n";
        }
    }
}

echo "\n=== FRONTEND SOURCE CHECK ===\n";
if (is_dir("$base/frontend/dist")) {
    echo "[✓] /frontend/dist exists\n";
    $assets = glob("$base/frontend/dist/assets/index-*.js");
    foreach ($assets as $asset) {
        echo "[✓] Fresh build in: " . basename($asset) . "\n";
    }
}
?>
