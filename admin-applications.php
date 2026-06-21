<?php
/**
 * Admin Dashboard - Review Professional Applications
 * View full profiles, photos, licenses, and approve/reject applications
 */

header('Content-Type: text/html; charset=utf-8');

$dbFile = __DIR__ . '/api/database/database.sqlite';
$db = new PDO('sqlite:' . $dbFile);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$action = $_GET['action'] ?? 'list';
$appId = $_GET['id'] ?? null;

// Debug: log the values
error_log('Admin GET params: action=' . $action . ', id=' . $appId);

// Handle approve/reject
if ($_POST['action'] ?? false) {
    $id = $_POST['id'];
    $status = $_POST['status'];
    $reason = $_POST['reason'] ?? null;

    $stmt = $db->prepare('UPDATE professionals SET status = ?, rejection_reason = ?, verified_at = CURRENT_TIMESTAMP WHERE id = ?');
    $stmt->execute([$status, $reason, $id]);

    header('Location: ?action=list&msg=' . urlencode($status === 'verified' ? 'Approved!' : 'Rejected'));
    exit;
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Admin - Professional Applications</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header h1 { color: #0f766e; margin-bottom: 10px; }
        .header p { color: #666; }

        /* List View */
        .applications { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .app-item { padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .app-item:hover { background: #f9f9f9; }
        .app-info { flex: 1; }
        .app-name { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 5px; }
        .app-details { color: #666; font-size: 14px; margin-bottom: 5px; }
        .app-status { display: inline-block; padding: 5px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .status-pending { background: #fef3c7; color: #b45309; }
        .status-verified { background: #dcfce7; color: #166534; }
        .status-rejected { background: #fee2e2; color: #991b1b; }
        .app-action { margin-left: 20px; }
        .btn { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; text-decoration: none; display: inline-block; }
        .btn-primary { background: #0f766e; color: white; }
        .btn-primary:hover { background: #0d5c5a; }
        .btn-secondary { background: #ddd; color: #333; }
        .btn-secondary:hover { background: #ccc; }

        /* Detail View */
        .detail-container { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 30px; }
        .detail-header { border-bottom: 2px solid #0f766e; padding-bottom: 20px; margin-bottom: 20px; }
        .detail-header h2 { color: #0f766e; margin-bottom: 10px; }
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .detail-section { padding: 15px; background: #f9f9f9; border-radius: 4px; }
        .detail-section h3 { color: #0f766e; margin-bottom: 10px; }
        .detail-field { margin-bottom: 10px; }
        .detail-field strong { color: #333; }
        .detail-field span { color: #666; }
        .photo-container { margin: 20px 0; }
        .photo-container img { max-width: 300px; border-radius: 8px; border: 2px solid #0f766e; }
        .document-container { margin: 20px 0; }
        .document-link { display: inline-block; padding: 10px 20px; background: #0f766e; color: white; border-radius: 4px; text-decoration: none; }
        .document-link:hover { background: #0d5c5a; }
        .action-buttons { display: flex; gap: 10px; margin-top: 30px; }
        .back-link { display: inline-block; margin-bottom: 20px; }
        .back-link a { color: #0f766e; text-decoration: none; }
        .back-link a:hover { text-decoration: underline; }

        .modal { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; }
        .modal.show { display: flex; align-items: center; justify-content: center; }
        .modal-content { background: white; padding: 30px; border-radius: 8px; width: 90%; max-width: 500px; }
        .modal-content h3 { margin-bottom: 15px; color: #0f766e; }
        .modal-content textarea { width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 4px; min-height: 100px; }
        .modal-buttons { display: flex; gap: 10px; }
        .msg { padding: 15px; margin-bottom: 20px; border-radius: 4px; }
        .msg-success { background: #dcfce7; color: #166534; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Admin Dashboard - Professional Applications</h1>
            <p>Review and approve/reject counselor and doctor applications</p>
        </div>

        <?php if ($msg = $_GET['msg'] ?? false): ?>
            <div class="msg msg-success">✓ <?php echo htmlspecialchars($msg); ?></div>
        <?php endif; ?>

        <?php if ($action === 'list'): ?>
            <!-- List View -->
            <div class="applications">
                <?php
                $apps = $db->query("SELECT * FROM professionals ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);

                if (empty($apps)) {
                    echo '<div style="padding: 40px; text-align: center; color: #999;">No applications yet</div>';
                } else {
                    foreach ($apps as $app):
                        $statusClass = 'status-' . $app['status'];
                        ?>
                        <div class="app-item">
                            <div class="app-info">
                                <div class="app-name">👤 <?php echo htmlspecialchars($app['full_name']); ?></div>
                                <div class="app-details">
                                    📧 <?php echo htmlspecialchars($app['email']); ?> |
                                    🏥 <?php echo ucfirst($app['professional_type']); ?> |
                                    📅 Applied: <?php echo date('M d, Y', strtotime($app['created_at'])); ?>
                                </div>
                                <div class="app-details">
                                    💰 KES <?php echo number_format($app['rate_per_hour']); ?>/hr |
                                    📞 <?php echo htmlspecialchars($app['mpesa_number']); ?>
                                </div>
                                <div>
                                    <span class="app-status <?php echo $statusClass; ?>">
                                        <?php echo strtoupper($app['status']); ?>
                                    </span>
                                </div>
                            </div>
                            <div class="app-action">
                                <a href="?action=view&id=<?php echo $app['id']; ?>" class="btn btn-primary">View Full Profile</a>
                            </div>
                        </div>
                    <?php endforeach;
                }
                ?>
            </div>

        <?php elseif ($action === 'view' && $appId): ?>
            <!-- Detail View -->
            <?php
            $app = $db->query("SELECT * FROM professionals WHERE id = " . intval($appId))->fetch(PDO::FETCH_ASSOC);

            if (!$app) {
                echo '<p>Application not found</p>';
                exit;
            }

            $specs = $app['specializations'] ? explode(',', trim($app['specializations'], '[]"')) : [];
            $langs = $app['languages'] ? explode(',', trim($app['languages'], '[]"')) : [];
            ?>

            <div class="back-link">
                <a href="?action=list">← Back to List</a>
            </div>

            <div class="detail-container">
                <div class="detail-header">
                    <h2><?php echo htmlspecialchars($app['full_name']); ?></h2>
                    <p style="color: #666; margin-top: 5px;">
                        <?php echo ucfirst($app['professional_type']); ?> •
                        Applied: <?php echo date('M d, Y \a\t g:i A', strtotime($app['created_at'])); ?>
                    </p>
                    <span class="app-status status-<?php echo $app['status']; ?>">
                        <?php echo strtoupper($app['status']); ?>
                    </span>
                </div>

                <!-- Photo -->
                <?php if ($app['professional_photo_path']): ?>
                    <div class="photo-container">
                        <h3>📸 Professional Photo</h3>
                        <img src="/api/storage/uploads/<?php echo htmlspecialchars($app['professional_photo_path']); ?>" alt="Professional Photo" style="max-width: 100%; height: auto;">
                    </div>
                <?php endif; ?>

                <!-- License -->
                <?php if ($app['license_document_path']): ?>
                    <div class="document-container">
                        <h3>📄 License Document</h3>
                        <a href="/api/storage/uploads/<?php echo htmlspecialchars($app['license_document_path']); ?>" class="document-link" target="_blank">
                            📥 View License (<?php echo htmlspecialchars($app['license_document_original_name']); ?>)
                        </a>
                    </div>
                <?php endif; ?>

                <!-- Personal Information -->
                <div class="detail-grid">
                    <div class="detail-section">
                        <h3>👤 Personal Information</h3>
                        <div class="detail-field">
                            <strong>Full Name:</strong> <span><?php echo htmlspecialchars($app['full_name']); ?></span>
                        </div>
                        <div class="detail-field">
                            <strong>Email:</strong> <span><?php echo htmlspecialchars($app['email']); ?></span>
                        </div>
                        <div class="detail-field">
                            <strong>Phone:</strong> <span><?php echo htmlspecialchars($app['phone'] ?? 'N/A'); ?></span>
                        </div>
                        <div class="detail-field">
                            <strong>Type:</strong> <span><?php echo ucfirst($app['professional_type']); ?></span>
                        </div>
                        <div class="detail-field">
                            <strong>Experience:</strong> <span><?php echo ($app['years_experience'] ?? 'N/A'); ?> years</span>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h3>💼 Professional Details</h3>
                        <div class="detail-field">
                            <strong>KMPDC License:</strong> <span><?php echo htmlspecialchars($app['kmpdc_license'] ?? 'N/A'); ?></span>
                        </div>
                        <div class="detail-field">
                            <strong>CPB License:</strong> <span><?php echo htmlspecialchars($app['cpb_license'] ?? 'N/A'); ?></span>
                        </div>
                        <div class="detail-field">
                            <strong>Specializations:</strong>
                            <span>
                                <?php
                                $specs_json = json_decode($app['specializations']);
                                if (is_array($specs_json) && !empty($specs_json)) {
                                    echo implode(', ', array_map('ucfirst', $specs_json));
                                } else {
                                    echo 'N/A';
                                }
                                ?>
                            </span>
                        </div>
                        <div class="detail-field">
                            <strong>Languages:</strong>
                            <span>
                                <?php
                                $langs_json = json_decode($app['languages']);
                                if (is_array($langs_json) && !empty($langs_json)) {
                                    echo implode(', ', array_map('ucfirst', $langs_json));
                                } else {
                                    echo 'N/A';
                                }
                                ?>
                            </span>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h3>💰 Payment Information</h3>
                        <div class="detail-field">
                            <strong>Session Rate:</strong> <span>KES <?php echo number_format($app['rate_per_hour']); ?>/hr</span>
                        </div>
                        <div class="detail-field">
                            <strong>M-Pesa Number:</strong> <span><?php echo htmlspecialchars($app['mpesa_number']); ?></span>
                        </div>
                        <div class="detail-field">
                            <strong>Bank Name:</strong> <span><?php echo htmlspecialchars($app['bank_name'] ?? 'N/A'); ?></span>
                        </div>
                        <div class="detail-field">
                            <strong>Account Number:</strong> <span><?php echo htmlspecialchars($app['account_number'] ?? 'N/A'); ?></span>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h3>✍️ Consent & Signature</h3>
                        <div class="detail-field">
                            <strong>SOP Agreed:</strong> <span><?php echo $app['sop_agreed'] ? '✓ Yes' : '✗ No'; ?></span>
                        </div>
                        <div class="detail-field">
                            <strong>Signature Name:</strong> <span><?php echo htmlspecialchars($app['signature_name']); ?></span>
                        </div>
                        <div class="detail-field">
                            <strong>Agreed At:</strong> <span><?php echo $app['sop_agreed_at'] ? date('M d, Y \a\t g:i A', strtotime($app['sop_agreed_at'])) : 'N/A'; ?></span>
                        </div>
                    </div>

                    <?php if ($app['bio']): ?>
                        <div class="detail-section" style="grid-column: 1/-1;">
                            <h3>📝 Bio</h3>
                            <p style="color: #666; line-height: 1.6;"><?php echo htmlspecialchars($app['bio']); ?></p>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- Action Buttons -->
                <?php if ($app['status'] === 'pending'): ?>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="showModal('approve')">✓ Approve</button>
                        <button class="btn btn-secondary" onclick="showModal('reject')">✗ Reject</button>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Modal -->
            <div id="modal" class="modal">
                <div class="modal-content">
                    <h3 id="modalTitle">Confirm Action</h3>
                    <form method="POST">
                        <input type="hidden" name="id" value="<?php echo $appId; ?>">
                        <input type="hidden" name="action" id="actionInput" value="">
                        <input type="hidden" name="status" id="statusInput" value="">

                        <textarea name="reason" id="reasonField" placeholder="Add a note (optional)..."></textarea>

                        <div class="modal-buttons">
                            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Confirm</button>
                        </div>
                    </form>
                </div>
            </div>

            <script>
                function showModal(action) {
                    document.getElementById('modal').classList.add('show');
                    document.getElementById('actionInput').value = action;
                    document.getElementById('statusInput').value = action === 'approve' ? 'verified' : 'rejected';
                    document.getElementById('modalTitle').textContent = action === 'approve' ? 'Approve Application?' : 'Reject Application?';
                    document.getElementById('reasonField').style.display = action === 'reject' ? 'block' : 'none';
                }

                function closeModal() {
                    document.getElementById('modal').classList.remove('show');
                }
            </script>

        <?php endif; ?>
    </div>
</body>
</html>
