<?php
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
if (!file_exists($dbPath)) {
    die("[✗] DB not found\n");
}

$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

echo "=== CREATING 6 SAMPLE COUNSELLORS ===\n\n";

// Generate user data
$samples = [
    [100, 'sample_sarah_001', 'Dr. Sarah Mwangi', 'Nairobi', 8, 'KMPDC000001'],
    [101, 'sample_james_002', 'James Kipchoge', 'Mombasa', 10, 'KMPDC000002'],
    [102, 'sample_grace_003', 'Dr. Grace Ochieng', 'Kisumu', 12, 'KMPDC000003'],
    [103, 'sample_peter_004', 'Peter Okonkwo', 'Nakuru', 7, 'KMPDC000004'],
    [104, 'sample_amara_005', 'Dr. Amara Hassan', 'Nairobi', 9, 'KMPDC000005'],
    [105, 'sample_david_006', 'David Musyoka', 'Nairobi', 6, 'KMPDC000006'],
];

$hash = '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DXo5d6';

try {
    foreach ($samples as $s) {
        list($id, $username, $name, $city, $years, $kmpdc) = $s;
        
        // Check if exists
        $check = $pdo->prepare("SELECT id FROM users WHERE id = ?");
        $check->execute([$id]);
        if ($check->fetch()) {
            echo "[!] User ID $id already exists\n";
            continue;
        }
        
        // Insert user
        $pdo->exec("INSERT INTO users (id, username, display_name, email, password, role, is_anonymous_mode, created_at, updated_at)
                   VALUES ($id, '$username', '$name', 'sample$id@local', '$hash', 'professional', 0, datetime('now'), datetime('now'))");
        
        // Insert professional
        $pdo->exec("INSERT INTO professionals (user_id, kmpdc_license, verification_status, rate_per_hour, years_experience, gender, 
                   rating, total_sessions, total_reviews, is_available_online, is_accepting_new_patients, location_city, 
                   location_county, mpesa_number, created_at, updated_at)
                   VALUES ($id, '$kmpdc', 'verified', 1500, $years, 'M', 4.8, 75, 30, 1, 1, '$city', 'County', 
                   '254712345678', datetime('now'), datetime('now'))");
        
        // Insert presence
        $pdo->exec("INSERT INTO presences (user_id, is_online, created_at, updated_at)
                   VALUES ($id, 1, datetime('now'), datetime('now'))");
        
        echo "[✓] $name ($city)\n";
    }
    
    echo "\n[✓✓✓] Sample counsellors created!\n";
} catch (Exception $e) {
    echo "[✗] Error: " . $e->getMessage() . "\n";
}
?>
