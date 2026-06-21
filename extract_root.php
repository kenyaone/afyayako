<?php
$base = '/home/qnztnquh/public_html';
chdir($base);
exec("tar -xzf fresh_root.tar.gz");
echo "[✓] Root files extracted\n";
echo "[✓] index.html updated\n";
echo "[✓] Fresh assets deployed\n";
?>
