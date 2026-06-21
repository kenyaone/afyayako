<?php
echo "<pre>";
echo "Installing PHP dependencies...\n";
chdir('/home/qnztnquh/public_html/api');
shell_exec('composer install --no-interaction 2>&1');
echo "Dependencies installed!\n";
echo "</pre>";
?>
