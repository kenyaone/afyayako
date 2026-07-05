<?php
$dirs = [
    '/home/qnztnquh/public_html/assets',
    '/home/qnztnquh/public_html/dist/assets',
];

foreach ($dirs as $dir) {
    echo "=== $dir ===\n";
    if (is_dir($dir)) {
        $files = glob("$dir/index-*.js");
        if (count($files) > 0) {
            foreach ($files as $f) {
                echo "[✓] " . basename($f) . " (" . round(filesize($f)/1024/1024, 2) . "MB)\n";
            }
        } else {
            echo "[✗] No index-*.js files found\n";
        }
    } else {
        echo "[✗] Directory doesn't exist\n";
    }
}
?>
