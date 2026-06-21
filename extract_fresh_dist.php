<?php
$pubdir = '/home/qnztnquh/public_html';
$homedir = '/home/qnztnquh';

echo "[*] Starting fresh dist deployment...\n\n";

// Step 1: Remove old dist
if (is_dir("$pubdir/dist")) {
    echo "[*] Removing old dist folder...\n";
    exec("rm -rf $pubdir/dist", $out, $code);
    if ($code === 0) {
        echo "[✓] Old dist removed\n\n";
    } else {
        echo "[✗] Failed to remove old dist\n\n";
    }
}

// Step 2: Check if fresh tar exists
if (!file_exists("$pubdir/dist_fresh.tar.gz")) {
    echo "[✗] dist_fresh.tar.gz not found in public_html\n";
    echo "[*] Checking home directory...\n";
    if (file_exists("$homedir/dist_fresh.tar.gz")) {
        echo "[*] Found in home, copying to public_html...\n";
        copy("$homedir/dist_fresh.tar.gz", "$pubdir/dist_fresh.tar.gz");
        echo "[✓] Copied\n\n";
    }
}

// Step 3: Extract fresh tar
if (file_exists("$pubdir/dist_fresh.tar.gz")) {
    echo "[*] Extracting fresh dist...\n";
    exec("cd $pubdir && tar -xzf dist_fresh.tar.gz", $out, $code);
    if ($code === 0) {
        echo "[✓] Extraction successful\n\n";
        
        // Move dist from frontend/dist to dist
        if (is_dir("$pubdir/frontend/dist")) {
            exec("mv $pubdir/frontend/dist/* $pubdir/dist/ && rmdir $pubdir/frontend/dist && rmdir $pubdir/frontend", $out2);
            echo "[✓] Moved dist to root public_html\n\n";
        }
    } else {
        echo "[✗] Extraction failed\n";
        print_r($out);
    }
}

// Step 4: Verify fresh index.html
if (file_exists("$pubdir/dist/index.html")) {
    echo "[✓] Fresh dist/index.html exists\n";
    $content = file_get_contents("$pubdir/dist/index.html");
    if (strpos($content, 'index-') !== false) {
        echo "[✓] Index.html contains proper bundle references\n";
    }
}

echo "\n[✓] FRESH DIST DEPLOYMENT COMPLETE\n";
?>
