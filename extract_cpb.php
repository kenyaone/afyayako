<?php
chdir('/home/qnztnquh/public_html');
exec('tar -xzf deploy_cpb.tar.gz && rm deploy_cpb.tar.gz');
echo "[✓] CPB badge deployed\n";
?>
