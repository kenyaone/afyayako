<?php
// Route handler for /apply that serves the professional application form
// This file should be accessed via: https://afyayako.co.ke/api/apply or similar

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Apply - Afya Yako Siri Yako</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #333; margin-bottom: 10px; }
        .form-group { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .form-group h2 { color: #0f766e; margin-bottom: 15px; font-size: 18px; }
        .upload-area { border: 2px dashed #0f766e; padding: 30px; text-align: center; border-radius: 8px; cursor: pointer; background: #f0fdf4; }
        .upload-area:hover { background: #dcfce7; }
        .upload-area p { color: #333; margin: 10px 0; }
        input[type="text"], input[type="email"], input[type="tel"], input[type="number"], select, textarea { width: 100%; padding: 10px; margin: 5px 0 10px 0; border: 1px solid #ddd; border-radius: 4px; }
        input[type="checkbox"] { margin-right: 10px; }
        button { width: 100%; padding: 12px; background: #0f766e; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold; }
        button:hover { background: #0d5c5a; }
        .success { background: #dcfce7; color: #166534; padding: 15px; border-radius: 4px; display: none; }
        .error { background: #fee2e2; color: #991b1b; padding: 15px; border-radius: 4px; display: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Join Our Team</h1>
            <p>Apply to become a counselor, doctor, or peer mentor</p>
        </div>

        <div id="successMsg" class="success">✓ Application submitted successfully!</div>
        <div id="errorMsg" class="error">✗ Error submitting application</div>

        <form id="applyForm">
            <!-- Photo Upload -->
            <div class="form-group">
                <h2>📸 Professional Photo</h2>
                <div class="upload-area" onclick="document.getElementById('photo').click()">
                    <p>📷 Click to upload photo</p>
                    <p style="font-size: 12px; color: #666;">PNG, JPG, WebP (max 5MB)</p>
                </div>
                <input type="file" id="photo" name="professional_photo" accept="image/*" style="display:none;">
                <p id="photoName" style="color: green; margin-top: 10px;"></p>
            </div>

            <!-- License Upload -->
            <div class="form-group">
                <h2>📄 License Document</h2>
                <div class="upload-area" onclick="document.getElementById('license').click()">
                    <p>📁 Click to upload license</p>
                    <p style="font-size: 12px; color: #666;">PDF, JPG, PNG (max 10MB)</p>
                </div>
                <input type="file" id="license" name="license_document" accept=".pdf,.jpg,.jpeg,.png" style="display:none;">
                <p id="licenseName" style="color: green; margin-top: 10px;"></p>
            </div>

            <!-- Personal Info -->
            <div class="form-group">
                <h2>👤 Personal Information</h2>
                <input type="email" name="email" placeholder="Email" required>
                <input type="text" name="full_name" placeholder="Full Name" required>
                <input type="tel" name="phone" placeholder="Phone (optional)">
                <select name="professional_type" required>
                    <option value="">Select Professional Type</option>
                    <option value="counselor">Counselor</option>
                    <option value="doctor">Doctor</option>
                    <option value="peer_mentor">Peer Mentor</option>
                </select>
            </div>

            <!-- Specializations -->
            <div class="form-group">
                <h2>🎯 Specializations</h2>
                <label><input type="checkbox" name="specializations" value="trauma"> Trauma & PTSD</label><br>
                <label><input type="checkbox" name="specializations" value="anxiety"> Anxiety & Panic</label><br>
                <label><input type="checkbox" name="specializations" value="depression"> Depression & Mood</label><br>
                <label><input type="checkbox" name="specializations" value="couples"> Couples Therapy</label><br>
            </div>

            <!-- Languages -->
            <div class="form-group">
                <h2>🌐 Languages</h2>
                <label><input type="checkbox" name="languages" value="english" checked> English</label><br>
                <label><input type="checkbox" name="languages" value="swahili"> Kiswahili</label><br>
                <label><input type="checkbox" name="languages" value="french"> French</label><br>
            </div>

            <!-- Payment -->
            <div class="form-group">
                <h2>💰 Payment Information</h2>
                <input type="tel" name="mpesa_number" placeholder="M-Pesa Number" required>
                <input type="number" name="rate_per_hour" placeholder="Session Rate (KES)" required min="500">
            </div>

            <!-- Consent -->
            <div class="form-group">
                <h2>📋 Agreement</h2>
                <label><input type="checkbox" name="sop_agreed" required> I agree to the Professional Standards of Practice</label>
                <input type="text" name="signature_name" placeholder="Type your full name as signature" required style="margin-top: 15px;">
            </div>

            <button type="submit">✓ Submit Application</button>
        </form>
    </div>

    <script>
        document.getElementById('photo').addEventListener('change', function() {
            document.getElementById('photoName').textContent = '✓ ' + this.files[0].name;
        });

        document.getElementById('license').addEventListener('change', function() {
            document.getElementById('licenseName').textContent = '✓ ' + this.files[0].name;
        });

        document.getElementById('applyForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            
            try {
                const response = await fetch('/api/professionals-apply.php', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                
                if (result.success) {
                    document.getElementById('successMsg').style.display = 'block';
                    setTimeout(() => location.href = '/', 2000);
                } else {
                    document.getElementById('errorMsg').textContent = '✗ ' + (result.message || 'Error');
                    document.getElementById('errorMsg').style.display = 'block';
                }
            } catch (err) {
                document.getElementById('errorMsg').textContent = '✗ Network error';
                document.getElementById('errorMsg').style.display = 'block';
            }
        });
    </script>
</body>
</html>
