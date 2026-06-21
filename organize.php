<?php
error_reporting(0);
ini_set('display_errors', 0);

$baseDir = __DIR__;

// Move files to correct locations
$moves = [
    'ProfessionalController.php' => 'api/app/Http/Controllers/',
    'Professional.php' => 'api/app/Models/',
    'filesystems.php' => 'api/config/',
    '2026_06_21_000001_create_professionals_table.php' => 'api/database/migrations/',
    'professionals-apply.php' => 'api/',
];

foreach ($moves as $file => $dir) {
    $src = $baseDir . '/' . $file;
    $dst_dir = $baseDir . '/' . $dir;
    $dst = $dst_dir . $file;

    if (file_exists($src)) {
        // Create directory
        @mkdir($dst_dir, 0775, true);

        // Move file
        if (@rename($src, $dst) || @copy($src, $dst)) {
            @unlink($src);
        }
    }
}

// Run migration
include $baseDir . '/run-migration.php';
