<?php
chdir('/home/qnztnquh/public_html');
if (file_exists('assets.tar.gz')) {
    exec('tar -xzf assets.tar.gz');
    echo "[✓] Assets extracted\n";
    echo "[✓] assets folder created\n";
    echo "[✓] lessons folder created\n";
} else {
    echo "[✗] assets.tar.gz not found\n";
}
?>
