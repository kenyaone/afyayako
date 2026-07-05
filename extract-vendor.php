<?php
$tar = new PharData('/home/qnztnquh/public_html/api/vendor.tar.gz');
$tar->extractTo('/home/qnztnquh/public_html/api', null, true);
echo "✓ Vendor extracted!\n";
echo "<pre>";
echo "Extracted " . count(new RecursiveIteratorIterator(new RecursiveDirectoryIterator('/home/qnztnquh/public_html/api/vendor'))) . " files\n";
echo "</pre>";
?>
