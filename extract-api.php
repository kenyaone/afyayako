<?php
$tar = new PharData('/home/qnztnquh/public_html/api-complete.tar.gz');
$tar->extractTo('/home/qnztnquh/public_html', null, true);
echo "✓ API extracted!<br>";
echo "Checking bootstrap/app.php: " . (file_exists('/home/qnztnquh/public_html/api/bootstrap/app.php') ? "✓" : "✗");
?>
