<?php
// Check what routes exist
$api = '/home/qnztnquh/public_html/api';

echo "API directory structure:\n";
echo "- Routes: " . (is_dir($api . '/routes') ? 'EXISTS' : 'MISSING') . "\n";
echo "- Public: " . (is_dir($api . '/public') ? 'EXISTS' : 'MISSING') . "\n";

if (is_file($api . '/routes/api.php')) {
    echo "\nAPI routes defined:\n";
    $content = file_get_contents($api . '/routes/api.php');
    preg_match_all("/Route::(get|post|put|delete)\('([^']+)'", $content, $matches);
    foreach ($matches[2] as $route) {
        echo "  - /api$route\n";
    }
}
?>
