<?php
// Remove old dist
exec('rm -rf /home/qnztnquh/public_html/dist');
// Extract new dist
$tar = new PharData('/home/qnztnquh/public_html/fresh-dist.tar.gz');
$tar->extractTo('/home/qnztnquh/public_html', null, true);
// Cleanup
unlink('/home/qnztnquh/public_html/fresh-dist.tar.gz');
echo "✓ Fresh build deployed!";
?>
