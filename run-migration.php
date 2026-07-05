<?php
/**
 * Simple database migration runner
 * Creates professionals table
 */

$dbFile = __DIR__ . '/api/database/database.sqlite';

try {
    // Connect to SQLite
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Connected to SQLite database: $dbFile\n\n";

    // Create professionals table
    $sql = <<<SQL
CREATE TABLE IF NOT EXISTS professionals (
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
    specializations JSON,
    languages JSON,
    sop_agreed BOOLEAN DEFAULT 0,
    sop_agreed_at DATETIME,
    signature_name VARCHAR(255),
    mpesa_number VARCHAR(20),
    bank_name VARCHAR(255),
    account_number VARCHAR(50),
    account_name VARCHAR(255),
    branch_code VARCHAR(50),
    rate_per_hour DECIMAL(10,2),
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
    echo "✓ Created professionals table\n";

    // Create migrations table to track what's been run
    $migrationsTable = <<<SQL
CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    migration VARCHAR(255) NOT NULL,
    batch INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
SQL;

    $db->exec($migrationsTable);
    echo "✓ Created migrations table\n";

    // Record this migration
    $stmt = $db->prepare("INSERT INTO migrations (migration, batch) VALUES (?, ?)");
    $stmt->execute(['2026_06_21_000001_create_professionals_table', 1]);
    echo "✓ Recorded migration\n";

    echo "\n✓ Database migration completed successfully!\n";

    // Verify table
    $tables = $db->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll();
    echo "\nTables in database:\n";
    foreach ($tables as $table) {
        echo "  - " . $table['name'] . "\n";
    }

} catch (PDOException $e) {
    echo "✗ Database error: " . $e->getMessage() . "\n";
    exit(1);
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
