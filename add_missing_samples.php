<?php
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);

echo "=== CHECKING & ADDING SAMPLES ===\n\n";

// Check existing
$stmt = $pdo->query("
  SELECT u.display_name, p.location_city FROM users u
  JOIN professionals p ON u.id = p.user_id
  WHERE u.email LIKE '%example.com%'
");
$existing = $stmt->fetchAll();
echo "Existing (" . count($existing) . "):\n";
foreach ($existing as $e) {
    echo "  • {$e['display_name']} - {$e['location_city']}\n";
}

$allSamples = [
    ['Sarah Mwangi', 'sarah.mwangi@example.com', 'Nairobi', 'Nairobi County', 8, 'Female', 1500],
    ['James Kipchoge', 'james.kipchoge@example.com', 'Mombasa', 'Mombasa County', 10, 'Male', 2000],
    ['Grace Ochieng', 'grace.ochieng@example.com', 'Kisumu', 'Kisumu County', 12, 'Female', 2500],
    ['Peter Okonkwo', 'peter.okonkwo@example.com', 'Nakuru', 'Nakuru County', 7, 'Male', 1800],
    ['Amara Hassan', 'amara.hassan@example.com', 'Nairobi', 'Nairobi County', 9, 'Female', 1600],
    ['David Musyoka', 'david.musyoka@example.com', 'Nairobi', 'Nairobi County', 6, 'Male', 1700],
];

echo "\nAdding missing samples:\n";
$added = 0;
foreach ($allSamples as $s) {
    list($name, $email, $city, $county, $years, $gender, $rate) = $s;
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if ($user) {
        echo "  ✓ {$name} (already exists)\n";
    } else {
        $username = strtolower(str_replace(' ', '_', $name));
        $password = password_hash('Sample123!', PASSWORD_BCRYPT);
        
        $pdo->exec("INSERT INTO users (username, display_name, email, password, role, is_anonymous_mode, created_at, updated_at)
                   VALUES ('$username', '$name', '$email', '$password', 'professional', 0, datetime('now'), datetime('now'))");
        $userId = $pdo->lastInsertId();
        
        $kmpdc = 'KMPDC' . str_pad(rand(10000, 99999), 5, '0', STR_PAD_LEFT);
        $cpb = 'CPB' . str_pad(rand(10000, 99999), 5, '0', STR_PAD_LEFT);
        
        $pdo->exec("INSERT INTO professionals (user_id, kmpdc_license, cpb_license, verification_status, rate_per_hour, 
                   years_experience, gender, rating, total_sessions, total_reviews, is_available_online, is_available_physical, 
                   is_accepting_new_patients, location_city, location_county, mpesa_number, created_at, updated_at)
                   VALUES ($userId, '$kmpdc', '$cpb', 'verified', $rate, $years, '$gender', 4.8, 75, 30, 
                   1, 1, 1, '$city', '$county', '254712345678', datetime('now'), datetime('now'))");
        
        $pdo->exec("INSERT INTO presences (user_id, is_online, created_at, updated_at) 
                   VALUES ($userId, 1, datetime('now'), datetime('now'))");
        
        echo "  + {$name} ({$city})\n";
        $added++;
    }
}

echo "\nFinal count: " . (count($existing) + $added) . " sample counsellors ready!\n";
?>
