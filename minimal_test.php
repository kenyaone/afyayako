<?php
$db = new PDO('sqlite:/home/qnztnquh/public_html/api/database/database.sqlite');

// Get all column names
$cols = [];
$stmt = $db->query("PRAGMA table_info(professionals)");
while ($row = $stmt->fetch()) {
    $cols[] = $row['name'];
}

echo "Columns: " . count($cols) . "\n";
echo implode(", ", $cols) . "\n\n";

// Try inserting with ALL columns explicitly (NULL for optional ones)
$colList = implode(", ", $cols);

// Delete first
$db->exec("DELETE FROM presences WHERE user_id >= 100");
$db->exec("DELETE FROM professionals WHERE user_id >= 100");
$db->exec("DELETE FROM users WHERE id >= 100");

// Insert user first
$hash = password_hash('Test', PASSWORD_BCRYPT);
$db->exec("INSERT INTO users (id, username, display_name, email, password, role, is_anonymous_mode, created_at, updated_at)
          VALUES (100, 's100', 'Test', 't@x', '$hash', 'professional', 0, datetime('now'), datetime('now'))");

// Now try professional with ALL columns
$sql = "INSERT INTO professionals ($colList) VALUES (null, 100, 'KMPDC100', 'verified', 1500.0, 'Test', 8, 'F', 4.8, 100, 50, 1, null, 'Nairobi', 'Nairobi', null, '254700000000', null, null, null, null, null, datetime('now'), datetime('now'), null, null)";

try {
    $db->exec($sql);
    echo "✓ Insert successful!\n";
} catch (Exception $e) {
    echo "✗ " . $e->getMessage() . "\n";
}
?>
