<?php
/**
 * Database fix script
 * Run: php fix-database.php
 */

$dbFile = __DIR__ . '/api/database/database.sqlite';

try {
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Fixing database schema...\n\n";

    // Drop old table if exists
    $db->exec("DROP TABLE IF EXISTS professionals");
    echo "✓ Cleared old table\n";

    // Create new table
    $sql = <<<SQL
    CREATE TABLE professionals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        professional_type VARCHAR(50) DEFAULT 'counselor',
        kmpdc_license VARCHAR(255),
        cpb_license VARCHAR(255),
        professional_photo_path VARCHAR(255),
        professional_photo_original_name VARCHAR(255),
        license_document_path VARCHAR(255),
        license_document_original_name VARCHAR(255),
        specializations TEXT,
        languages TEXT,
        sop_agreed INTEGER DEFAULT 0,
        sop_agreed_at DATETIME,
        signature_name VARCHAR(255),
        mpesa_number VARCHAR(20),
        bank_name VARCHAR(255),
        account_number VARCHAR(50),
        account_name VARCHAR(255),
        branch_code VARCHAR(50),
        rate_per_hour REAL,
        status VARCHAR(50) DEFAULT 'pending',
        rejection_reason TEXT,
        verified_at DATETIME,
        bio TEXT,
        years_experience INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME
    )
    SQL;

    $db->exec($sql);
    echo "✓ Created new professionals table\n";

    // Verify
    $columns = $db->query("PRAGMA table_info(professionals)")->fetchAll();
    echo "\n✓ Table has " . count($columns) . " columns\n";
    echo "\nColumns:\n";
    foreach ($columns as $col) {
        echo "  - " . $col['name'] . " (" . $col['type'] . ")\n";
    }

    echo "\n✅ Database fixed!\n";

} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
