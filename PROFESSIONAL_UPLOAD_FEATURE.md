# Professional Application with Photo & License Upload Feature

## Overview

This feature enables counselors, doctors, peer mentors, and corporate professionals to apply to join the Afya Yako Siri Yako platform. The application includes:

1. **Professional Photo Upload** - Clear headshot (PNG, JPG, WebP, max 5MB)
2. **License Document Upload** - KMPDC or CPB license certificate (PDF, JPG, PNG, max 10MB)
3. **SOP Consent Form** - Digital signature and agreement to Professional Standards of Practice
4. **Specializations & Languages** - Multi-select fields for expertise areas
5. **Payment Information** - M-Pesa and bank account details
6. **License Verification** - KMPDC license number validation

## Frontend Implementation

### Form Location
- URL: `https://afyayako.co.ke/apply`
- File: `/counselor-form-complete.js`
- The form is injected dynamically into the page with comprehensive sections

### Form Sections

#### 1. Professional Photo Upload
```html
<div class="card space-y-3 border-2 border-teal-300 bg-teal-50">
  <h3 class="font-bold text-lg text-gray-900">📸 Professional Photo</h3>
  <!-- Drag-and-drop area for image upload -->
  <!-- Accepts: PNG, JPG, WebP (max 5MB) -->
  <!-- Shows preview after upload -->
</div>
```

#### 2. License Document Upload
```html
<div class="card space-y-3 border-2 border-sky-300 bg-sky-50">
  <h3 class="font-bold text-lg text-gray-900">📄 License Document Upload</h3>
  <!-- Upload area for license -->
  <!-- Accepts: PDF, JPG, PNG (max 10MB) -->
  <!-- Displays: Filename with checkmark after upload -->
</div>
```

#### 3. SOP (Standard Operating Procedures) Agreement
```html
<div class="card space-y-3 border-2 border-lavender-300 bg-lavender-50">
  <h3 class="font-bold text-gray-900">📋 Professional Standards of Practice</h3>
  <!-- Displays SOP document -->
  <!-- Checkbox to agree -->
  <!-- Includes sections on:
       - Code of Ethics & Conduct
       - Professional Responsibilities
       - Technology & Data Security -->
</div>
```

#### 4. Digital Signature
```html
<div class="card space-y-3">
  <h3 class="font-bold text-gray-900">✍️ Digital Signature</h3>
  <!-- Text input for full name (acts as signature) -->
  <!-- Shows: "By typing your name, you electronically sign this application" -->
</div>
```

### Client-Side Validation
- Photo: MIME type check (image/jpeg, image/png, image/webp), 5MB size limit
- License: MIME type check (PDF, JPG, PNG), 10MB size limit
- Required fields: email, name, professional type, MPesa, rate, signature
- File previews shown in UI

## Backend Implementation

### Database Schema

The `professionals` table stores all application data:

```sql
CREATE TABLE professionals (
    id BIGINT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    
    -- Professional Info
    professional_type ENUM('counselor', 'doctor', 'peer_mentor', 'corporate'),
    kmpdc_license VARCHAR(255),
    cpb_license VARCHAR(255),
    
    -- File Uploads
    professional_photo_path VARCHAR(255),
    professional_photo_original_name VARCHAR(255),
    license_document_path VARCHAR(255),
    license_document_original_name VARCHAR(255),
    
    -- Specializations & Languages (JSON)
    specializations JSON,
    languages JSON,
    
    -- SOP Consent
    sop_agreed BOOLEAN DEFAULT false,
    sop_agreed_at TIMESTAMP,
    signature_name VARCHAR(255),
    
    -- Payment Information
    mpesa_number VARCHAR(20),
    bank_name VARCHAR(255),
    account_number VARCHAR(50),
    account_name VARCHAR(255),
    branch_code VARCHAR(50),
    rate_per_hour DECIMAL(10,2),
    
    -- Status & Verification
    status ENUM('pending', 'verified', 'rejected', 'suspended') DEFAULT 'pending',
    rejection_reason TEXT,
    verified_at TIMESTAMP,
    
    -- Metadata
    bio TEXT,
    years_experience INT,
    
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP (soft delete)
);
```

### API Endpoint

**POST** `/api/professionals/apply`

#### Request Format (Multipart Form Data)

```javascript
{
    // Required
    email: "doctor@example.com",
    full_name: "Dr. John Doe",
    professional_type: "doctor", // or "counselor", "peer_mentor", "corporate"
    
    // Files
    professional_photo: File, // image, max 5MB
    license_document: File,   // PDF/JPG/PNG, max 10MB
    
    // License Info
    kmpdc_license: "KP-2024-0123",
    cpb_license: "CPB-2024-0456",
    
    // Specializations & Languages (arrays)
    specializations: ["trauma", "couples", "anxiety"],
    languages: ["english", "swahili"],
    
    // SOP Consent
    sop_agreed: true,
    signature_name: "Dr. John Doe",
    
    // Payment Info
    mpesa_number: "0712345678",
    rate_per_hour: 2500,
    
    // Optional
    phone: "+254712345678",
    bank_name: "Equity Bank",
    account_number: "0123456789",
    account_name: "John Doe",
    branch_code: "001",
    bio: "10+ years of mental health counseling",
    years_experience: 10
}
```

#### Response (Success - 201)

```json
{
    "success": true,
    "message": "Application submitted successfully. Our team will review your documents and contact you within 24 hours.",
    "professional_id": 42,
    "status": "pending"
}
```

#### Response (Validation Error - 422)

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "email": ["The email has already been taken."],
        "professional_photo": ["The professional photo must be an image."],
        "sop_agreed": ["The sop agreed must be true."]
    }
}
```

#### Response (Server Error - 500)

```json
{
    "success": false,
    "message": "Failed to process application. Please try again.",
    "error": "Error details (if debug mode enabled)"
}
```

### File Storage

Files are stored in the following directory structure:

```
storage/
├── uploads/
│   ├── professionals/
│   │   ├── photos/
│   │   │   └── doctor@example_20260621120530.jpg
│   │   └── licenses/
│   │       └── doctor@example_20260621120530.pdf
```

**Storage Format:**
- `{sanitized_email}_{timestamp}.{extension}`
- Email sanitized: `@` replaced with `_`
- Timestamp: `YYYYMMDDHHmmss`

### File Retrieval

Files are served via:
```
GET /storage/uploads/professionals/photos/{filename}
GET /storage/uploads/professionals/licenses/{filename}
```

Access is controlled via Laravel's authorization system. Only admins and the professional themselves can access their documents.

## Setup Instructions

### 1. Run Database Migration

```bash
cd api
php artisan migrate
```

This will create the `professionals` table with all required columns.

### 2. Create Storage Directories

```bash
mkdir -p storage/uploads/professionals/{photos,licenses}
chmod -R 775 storage/uploads/
```

### 3. Link Storage (Production)

```bash
php artisan storage:link
```

This creates a symlink so files in `storage/uploads` are accessible at `/storage/uploads`.

### 4. Update Nginx/Apache Configuration

Ensure the web server can serve files from the storage directory:

**Nginx:**
```nginx
location /storage {
    alias /home/tele/afyayako/storage/app/public;
    try_files $uri $uri/ =404;
}
```

**Apache (.htaccess):**
```apache
RewriteRule ^storage/uploads/(.*)$ storage/uploads/$1 [L]
```

## Admin Review & Verification

### Application Status Flow

1. **Pending** (default) - Application received, awaiting review
2. **Verified** - Documents approved, professional can go live
3. **Rejected** - Application denied with reason provided
4. **Suspended** - Verified professional suspended (e.g., ethics violation)

### Admin Dashboard Endpoint (Protected)

```
GET /api/admin/professionals/pending
GET /api/admin/professionals/{id}
PUT /api/admin/professionals/{id}/verify
PUT /api/admin/professionals/{id}/reject
```

To be implemented with rejection reasons and audit logging.

## Security Considerations

### Input Validation
- File type validation (MIME type & extension)
- File size limits (5MB photos, 10MB licenses)
- Email uniqueness check
- License format validation (KP-YYYY-####)

### File Storage Security
- Files stored outside webroot (`storage/` directory)
- Private access control (not served directly)
- Files accessible only via authenticated API
- No execution permissions on uploaded files

### Data Protection
- Passwords: bcrypt with 12 rounds
- Sensitive data: encrypted in transit (HTTPS)
- SOP consent: timestamped and logged
- Soft deletes: professional records never permanently deleted

## Frontend Integration

### Including the Form

The form is automatically injected via `/counselor-form-complete.js`:

```html
<!-- In index.html or apply page -->
<script src="/counselor-form-complete.js"></script>
```

Or manually trigger:

```javascript
AfyaYakoCounselorForm.injectCounselorFormComplete();
```

### Handling Form Submission

Add a submit button to the form:

```html
<button type="submit" class="w-full px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold">
    Submit Application
</button>
```

JavaScript to handle submission:

```javascript
document.querySelector('form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    
    try {
        const response = await fetch('/api/professionals/apply', {
            method: 'POST',
            body: formData,
            // Don't set Content-Type header - browser will set it with boundary
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Application submitted successfully!');
            // Redirect or show success message
            window.location.href = '/thank-you';
        } else {
            alert('Application failed: ' + result.message);
            console.log('Errors:', result.errors);
        }
    } catch (error) {
        alert('Error submitting application');
        console.error(error);
    }
});
```

## Testing

### Manual Testing Checklist

- [ ] Photo upload with valid image (5MB max)
- [ ] Photo upload with oversized image (should fail)
- [ ] Photo upload with invalid format (should fail)
- [ ] License upload with PDF (should succeed)
- [ ] License upload with JPG (should succeed)
- [ ] License upload with oversized file (should fail)
- [ ] Form with empty required fields (should fail validation)
- [ ] Form with duplicate email (should fail)
- [ ] Form without SOP checkbox (should fail)
- [ ] Successful submission with all fields
- [ ] Database record created with correct data
- [ ] Files stored in correct directories
- [ ] Files not accessible without authentication

### API Test (cURL)

```bash
curl -X POST https://afyayako.co.ke/api/professionals/apply \
  -F "email=doctor@example.com" \
  -F "full_name=Dr. John Doe" \
  -F "professional_type=doctor" \
  -F "professional_photo=@/path/to/photo.jpg" \
  -F "license_document=@/path/to/license.pdf" \
  -F "kmpdc_license=KP-2024-0123" \
  -F "specializations[]=trauma" \
  -F "specializations[]=anxiety" \
  -F "languages[]=english" \
  -F "languages[]=swahili" \
  -F "sop_agreed=true" \
  -F "signature_name=Dr. John Doe" \
  -F "mpesa_number=0712345678" \
  -F "rate_per_hour=2500"
```

## Deployment Notes

1. **Database Migration**: Run migrations before deploying
2. **File Permissions**: Ensure `storage/uploads/` is writable by web server
3. **Storage Link**: Create symlink for file access
4. **Environment**: Update `.env` with correct domain names
5. **HTTPS**: Ensure site is HTTPS (required for file uploads in browsers)
6. **Backup**: Regular backups of uploaded files

## Future Enhancements

1. **Admin Dashboard**
   - Review pending applications
   - Approve/reject with comments
   - Download/view uploaded files
   - Export lists of professionals

2. **Email Notifications**
   - Submission confirmation to professional
   - Admin notification of new applications
   - Approval/rejection emails

3. **Advanced Verification**
   - Automatic KMPDC registry lookup
   - Document OCR for license extraction
   - ID verification integration

4. **Professional Profiles**
   - Update credentials
   - Modify rates
   - Add more files (certifications, etc.)

5. **Analytics**
   - Application submission metrics
   - Professional demographics
   - Document compliance tracking

## Support

For issues with the feature:
1. Check browser console for client-side errors
2. Check server logs: `api/error_log`
3. Verify file permissions on `storage/uploads/`
4. Check database connection in `.env`
5. Ensure PHP extensions are enabled: `fileinfo`, `gd` (for image validation)
