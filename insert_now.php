<?php
$db = new PDO('sqlite:/home/qnztnquh/public_html/api/database/database.sqlite');

// Delete first
try {
    $db->exec("DELETE FROM presences WHERE user_id >= 100");
    $db->exec("DELETE FROM professionals WHERE user_id >= 100");
    $db->exec("DELETE FROM users WHERE id >= 100");
    echo "[OK] Cleaned\n";
} catch (Exception $e) {
    echo "[E1] " . $e->getMessage() . "\n";
}

// Insert one sample
try {
    $hash = password_hash('Test', PASSWORD_BCRYPT);
    
    $db->exec("INSERT INTO users VALUES (100, 'test', 'Test User', 'test@x.com', null, '$hash', null, 'professional', 0, null, datetime('now'), datetime('now'), null)");
    echo "[OK] User\n";
    
    $db->exec("INSERT INTO professionals VALUES (1, 100, 'KMPDC1', null, 1000, 'Bio', 5, 'M', 4.5, 10, 5, 1, null, 'Nairobi', 'Nairobi', null, '254700000000', null, null, null, null, null, datetime('now'), datetime('now'), null, null)");
    echo "[OK] Professional\n";
    
    $db->exec("INSERT INTO presences VALUES (1, 100, 1, null, datetime('now'), datetime('now'))");
    echo "[OK] Presence\n";
    
} catch (Exception $e) {
    echo "[ERROR] " . $e->getMessage() . "\n";
}
?>
