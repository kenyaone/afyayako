<?php
$dbPath = '/home/qnztnquh/public_html/api/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);

echo "Creating missing tables...\n\n";

// Create presences table if it doesn't exist
$pdo->exec("CREATE TABLE IF NOT EXISTS presences (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  is_online TINYINT(1) DEFAULT 0,
  last_seen_at DATETIME,
  created_at DATETIME,
  updated_at DATETIME,
  UNIQUE(user_id)
)");

echo "[✓] presences table ready\n";

// Now insert sample
$hash = password_hash('Test123', PASSWORD_BCRYPT);

$pdo->exec("DELETE FROM presences WHERE user_id >= 100");
$pdo->exec("DELETE FROM professionals WHERE user_id >= 100");
$pdo->exec("DELETE FROM users WHERE id >= 100");

$samples = [
    ['Dr. Sarah Mwangi', 'Nairobi', 8],
    ['James Kipchoge', 'Mombasa', 10],
    ['Dr. Grace Ochieng', 'Kisumu', 12],
    ['Peter Okonkwo', 'Nakuru', 7],
    ['Dr. Amara Hassan', 'Nairobi', 9],
    ['David Musyoka', 'Nairobi', 6],
];

echo "\nInserting sample counsellors:\n";

$id = 100;
foreach ($samples as $s) {
    list($name, $city, $yrs) = $s;
    $user = 'sample' . $id;
    $lic = 'KMPDC' . str_pad($id, 6, '0', STR_PAD_LEFT);
    
    $pdo->exec("INSERT INTO users (id, username, display_name, email, password, role, is_anonymous_mode, created_at, updated_at)
               VALUES ($id, '$user', '$name', 'sample$id@local', '$hash', 'professional', 0, datetime('now'), datetime('now'))");
    
    $pdo->exec("INSERT INTO professionals (user_id, kmpdc_license, verification_status, rate_per_hour, bio, years_experience, gender, 
               rating, total_sessions, total_reviews, is_available_online, is_available_physical, is_accepting_new_patients,
               location_city, location_county, mpesa_number, created_at, updated_at)
               VALUES ($id, '$lic', 'verified', 1500, 'Certified Therapist', $yrs, 'M', 4.8, 75, 30, 1, 1, 1, 
               '$city', 'County', '254712345678', datetime('now'), datetime('now'))");
    
    $pdo->exec("INSERT INTO presences (user_id, is_online, created_at, updated_at)
               VALUES ($id, 1, datetime('now'), datetime('now'))");
    
    echo "  ✓ $name ($city)\n";
    $id++;
}

echo "\n✅ 6 sample counsellors created!\n";
?>
