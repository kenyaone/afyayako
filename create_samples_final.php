<?php
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

echo "=== CREATING 6 SAMPLE COUNSELLORS ===\n\n";

// Delete existing
$pdo->exec("DELETE FROM professionals WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%example.com%')");
$pdo->exec("DELETE FROM presences WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%example.com%')");
$pdo->exec("DELETE FROM users WHERE email LIKE '%example.com%'");

$samples = [
    ['Dr. Sarah Mwangi', 'sarah@example.com', 'Nairobi', 'Nairobi County', 8, 'Female', 1500],
    ['James Kipchoge', 'james@example.com', 'Mombasa', 'Mombasa County', 10, 'Male', 2000],
    ['Dr. Grace Ochieng', 'grace@example.com', 'Kisumu', 'Kisumu County', 12, 'Female', 2500],
    ['Peter Okonkwo', 'peter@example.com', 'Nakuru', 'Nakuru County', 7, 'Male', 1800],
    ['Dr. Amara Hassan', 'amara@example.com', 'Nairobi', 'Nairobi County', 9, 'Female', 1600],
    ['David Musyoka', 'david@example.com', 'Nairobi', 'Nairobi County', 6, 'Male', 1700],
];

foreach ($samples as $s) {
    list($name, $email, $city, $county, $years, $gender, $rate) = $s;
    $username = strtolower(str_replace(' ', '_', $name));
    $password = password_hash('Sample123!', PASSWORD_BCRYPT);
    $kmpdc = 'KMPDC' . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT);
    
    try {
        $pdo->exec("INSERT INTO users (username, display_name, email, password, role, is_anonymous_mode, created_at, updated_at)
                   VALUES ('$username', '$name', '$email', '$password', 'professional', 0, datetime('now'), datetime('now'))");
        $userId = $pdo->lastInsertId();
        
        $pdo->exec("INSERT INTO professionals 
                   (user_id, kmpdc_license, verification_status, rate_per_hour, years_experience, gender, rating, 
                    total_sessions, total_reviews, is_available_online, is_accepting_new_patients, 
                    location_city, location_county, mpesa_number, created_at, updated_at)
                   VALUES 
                   ($userId, '$kmpdc', 'verified', $rate, $years, '$gender', 4.8, 
                    75, 30, 1, 1, '$city', '$county', '254712345678', datetime('now'), datetime('now'))");
        
        $pdo->exec("INSERT INTO presences (user_id, is_online, created_at, updated_at) 
                   VALUES ($userId, 1, datetime('now'), datetime('now'))");
        
        echo "[✓] $name • $city • $years years\n";
    } catch (Exception $e) {
        echo "[✗] $name: " . $e->getMessage() . "\n";
    }
}

$stmt = $pdo->query("SELECT COUNT(*) as cnt FROM professionals WHERE location_city IS NOT NULL");
$count = $stmt->fetch()['cnt'];
echo "\n[✓✓✓] Created $count sample counsellors!\n";
?>
