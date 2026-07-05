<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $target = '/home/qnztnquh/public_html/index.html';
    if (move_uploaded_file($_FILES['file']['tmp_name'], $target)) {
        echo "[✓] index.html updated\n";
        echo "[✓] File size: " . filesize($target) . " bytes\n";
        echo "[✓] Bundle: " . (strpos(file_get_contents($target), 'CBwSdAwC') ? 'CBwSdAwC (FRESH)' : 'OLD') . "\n";
    } else {
        echo "[✗] Upload failed\n";
    }
} else {
    echo "[!] POST with file required\n";
}
?>
