<?php
$api = '/home/qnztnquh/public_html/api';

// Check public/index.php
echo "Checking Laravel structure:\n";
echo "- api/public/index.php: " . (file_exists($api . '/public/index.php') ? 'EXISTS' : 'MISSING') . "\n";

// The issue is that /public_html/api is where the API is
// But requests to /api/* won't reach it because /api might not map there
// We need the API to be accessible from the root

// Check if there's a symlink or redirect needed
echo "\nChecking if /api folder exists in public_html root:\n";
echo "- /home/qnztnquh/public_html/api: " . (is_dir('/home/qnztnquh/public_html/api') ? 'EXISTS' : 'MISSING') . "\n";

// List what's actually in public_html
echo "\nFiles/folders in /home/qnztnquh/public_html/:\n";
$items = glob('/home/qnztnquh/public_html/{.,}[!.]*', GLOB_BRACE);
foreach ($items as $item) {
    $name = basename($item);
    $type = is_dir($item) ? '[DIR]' : '[FILE]';
    echo "  $name $type\n";
}
?>
