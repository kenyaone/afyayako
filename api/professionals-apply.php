<?php
/**
 * Mock API endpoint for professional application
 * This is a standalone endpoint for testing without full Laravel bootstrap
 */

header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    exit(json_encode(['success' => true]));
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['success' => false, 'message' => 'Method not allowed']));
}

// CORS headers
header('Access-Control-Allow-Origin: *');

try {
    // Database connection
    $dbFile = __DIR__ . '/database/database.sqlite';
    if (!file_exists($dbFile)) {
        throw new Exception('Database file not found');
    }

    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Ensure table exists
    $createTableSQL = <<<SQL
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

    $db->exec($createTableSQL);

    // Validate required fields
    $required = ['email', 'full_name', 'professional_type', 'mpesa_number', 'rate_per_hour', 'sop_agreed', 'signature_name'];
    $errors = [];

    foreach ($required as $field) {
        if (empty($_POST[$field])) {
            $errors[$field] = ["The $field field is required"];
        }
    }

    if (!empty($errors)) {
        http_response_code(422);
        exit(json_encode([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $errors
        ]));
    }

    // Check email uniqueness
    $stmt = $db->prepare('SELECT id FROM professionals WHERE email = ?');
    $stmt->execute([$_POST['email']]);
    if ($stmt->fetch()) {
        http_response_code(422);
        exit(json_encode([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => ['email' => ['The email has already been taken']]
        ]));
    }

    // Validate sop_agreed
    if ($_POST['sop_agreed'] !== 'on' && $_POST['sop_agreed'] !== '1' && $_POST['sop_agreed'] !== 'true') {
        http_response_code(422);
        exit(json_encode([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => ['sop_agreed' => ['You must agree to the Professional Standards of Practice']]
        ]));
    }

    // Handle file uploads
    $photoPath = null;
    $photoName = null;
    $licensePath = null;
    $licenseName = null;

    // Photo upload
    if (!empty($_FILES['professional_photo']['tmp_name'])) {
        $photoFile = $_FILES['professional_photo'];

        // Validate
        if ($photoFile['size'] > 5 * 1024 * 1024) {
            throw new Exception('Photo must be less than 5MB');
        }

        $validMimes = ['image/jpeg', 'image/png', 'image/webp'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $photoFile['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, $validMimes)) {
            throw new Exception('Photo must be JPEG, PNG, or WebP');
        }

        // Move to storage
        $storageDir = __DIR__ . '/storage/uploads/professionals/photos';
        $timestamp = date('YmdHis');
        $email = str_replace('@', '_', $_POST['email']);
        $ext = pathinfo($photoFile['name'], PATHINFO_EXTENSION);
        $filename = "{$email}_{$timestamp}.{$ext}";
        $destination = $storageDir . '/' . $filename;

        if (move_uploaded_file($photoFile['tmp_name'], $destination)) {
            $photoPath = 'professionals/photos/' . $filename;
            $photoName = $photoFile['name'];
        }
    }

    // License upload
    if (!empty($_FILES['license_document']['tmp_name'])) {
        $licenseFile = $_FILES['license_document'];

        // Validate
        if ($licenseFile['size'] > 10 * 1024 * 1024) {
            throw new Exception('License document must be less than 10MB');
        }

        $validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
        $ext = strtolower(pathinfo($licenseFile['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, $validExtensions)) {
            throw new Exception('License must be PDF, JPG, or PNG');
        }

        // Move to storage
        $storageDir = __DIR__ . '/storage/uploads/professionals/licenses';
        $timestamp = date('YmdHis');
        $email = str_replace('@', '_', $_POST['email']);
        $filename = "{$email}_{$timestamp}.{$ext}";
        $destination = $storageDir . '/' . $filename;

        if (move_uploaded_file($licenseFile['tmp_name'], $destination)) {
            $licensePath = 'professionals/licenses/' . $filename;
            $licenseName = $licenseFile['name'];
        }
    }

    // Prepare specializations
    $specializations = [];
    if (!empty($_POST['specializations'])) {
        $specializations = (array)$_POST['specializations'];
    }

    // Prepare languages
    $languages = ['english'];
    if (!empty($_POST['languages'])) {
        $languages = (array)$_POST['languages'];
    }

    // Insert into database
    $stmt = $db->prepare('INSERT INTO professionals (
        email, full_name, phone, professional_type,
        kmpdc_license, cpb_license,
        professional_photo_path, professional_photo_original_name,
        license_document_path, license_document_original_name,
        specializations, languages,
        sop_agreed, sop_agreed_at, signature_name,
        mpesa_number, bank_name, account_number, account_name, branch_code,
        rate_per_hour, status, bio, years_experience, created_at, updated_at
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )');

    $stmt->execute([
        $_POST['email'],
        $_POST['full_name'],
        $_POST['phone'] ?? null,
        $_POST['professional_type'],
        $_POST['kmpdc_license'] ?? null,
        $_POST['cpb_license'] ?? null,
        $photoPath,
        $photoName,
        $licensePath,
        $licenseName,
        json_encode($specializations),
        json_encode($languages),
        1, // sop_agreed
        date('Y-m-d H:i:s'), // sop_agreed_at
        $_POST['signature_name'],
        $_POST['mpesa_number'],
        $_POST['bank_name'] ?? null,
        $_POST['account_number'] ?? null,
        $_POST['account_name'] ?? null,
        $_POST['branch_code'] ?? null,
        $_POST['rate_per_hour'],
        'pending',
        $_POST['bio'] ?? null,
        $_POST['years_experience'] ?? null,
        date('Y-m-d H:i:s'),
        date('Y-m-d H:i:s')
    ]);

    $professionalId = $db->lastInsertId();

    http_response_code(201);
    exit(json_encode([
        'success' => true,
        'message' => 'Application submitted successfully. Our team will review your documents and contact you within 24 hours.',
        'professional_id' => (int)$professionalId,
        'status' => 'pending'
    ]));

} catch (Exception $e) {
    http_response_code(500);
    exit(json_encode([
        'success' => false,
        'message' => 'Failed to process application. Please try again.',
        'error' => $e->getMessage()
    ]));
}
