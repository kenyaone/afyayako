<?php
try {
    $db = new PDO('sqlite:/home/qnztnquh/public_html/api/database/database.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Delete
    $db->exec("DELETE FROM presences WHERE user_id >= 100");
    $db->exec("DELETE FROM professionals WHERE user_id >= 100");
    $db->exec("DELETE FROM users WHERE id >= 100");
    echo "[1] Deleted old\n";

    // Insert user
    $stmt = $db->prepare("INSERT INTO users (id, username, display_name, email, password, role, is_anonymous_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))");
    $hash = password_hash('Test', PASSWORD_BCRYPT);
    $stmt->execute([100, 'test100', 'Test User', 'test@local', $hash, 'professional', 0]);
    echo "[2] User inserted\n";

    // Insert professional using prepared statement
    $stmt = $db->prepare("INSERT INTO professionals (user_id, kmpdc_license, verification_status, rate_per_hour, bio, years_experience, gender, rating, total_sessions, total_reviews, is_available_online, is_available_physical, is_accepting_new_patients, location_city, location_county, mpesa_number, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))");
    
    $stmt->execute([100, 'KMPDC001', 'verified', 1500, 'Test Therapist', 5, 'M', 4.5, 50, 20, 1, 1, 1, 'Nairobi', 'County', '254700000000']);
    echo "[3] Professional inserted\n";

    // Insert presence
    $stmt = $db->prepare("INSERT INTO presences (user_id, is_online, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))");
    $stmt->execute([100, 1]);
    echo "[4] Presence inserted\n";

    echo "\n✅ Success!\n";

} catch (Exception $e) {
    echo "❌ " . $e->getMessage() . "\n";
}
?>
