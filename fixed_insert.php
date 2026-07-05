<?php
$db = new PDO('sqlite:/home/qnztnquh/public_html/api/database/database.sqlite');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    // Delete
    $db->exec("DELETE FROM presences WHERE user_id >= 100");
    $db->exec("DELETE FROM professionals WHERE user_id >= 100");
    $db->exec("DELETE FROM users WHERE id >= 100");

    $hash = password_hash('Test', PASSWORD_BCRYPT);
    $samples = [
        ['Dr. Sarah Mwangi', 'Nairobi', 8],
        ['James Kipchoge', 'Mombasa', 10],
        ['Dr. Grace Ochieng', 'Kisumu', 12],
        ['Peter Okonkwo', 'Nakuru', 7],
        ['Dr. Amara Hassan', 'Nairobi', 9],
        ['David Musyoka', 'Nairobi', 6],
    ];

    $id = 100;
    foreach ($samples as $s) {
        list($name, $city, $years) = $s;
        
        // Insert user
        $db->exec("INSERT INTO users (id, username, display_name, email, password, role, is_anonymous_mode, created_at, updated_at)
                  VALUES ($id, 's$id', '$name', 's$id@x', '$hash', 'professional', 0, datetime('now'), datetime('now'))");
        
        // Insert professional - note: total_reviews should be <= total_sessions
        $db->exec("INSERT INTO professionals (user_id, kmpdc_license, verification_status, rate_per_hour, bio, years_experience, gender, rating, total_sessions, total_reviews, is_available_online, is_available_physical, is_accepting_new_patients, location_city, location_county, mpesa_number, created_at, updated_at)
                  VALUES ($id, 'KMPDC$id', 'verified', 1500, 'Therapist', $years, 'M', 4.8, 100, 50, 1, 1, 1, '$city', 'County', '254712345678', datetime('now'), datetime('now'))");
        
        // Insert presence
        $db->exec("INSERT INTO presences (user_id, is_online, created_at, updated_at)
                  VALUES ($id, 1, datetime('now'), datetime('now'))");
        
        echo "✓ $name ($city)\n";
        $id++;
    }
    
    echo "\n✅ 6 samples created!\n";
    
} catch (Exception $e) {
    echo "❌ " . $e->getMessage() . "\n";
}
?>
