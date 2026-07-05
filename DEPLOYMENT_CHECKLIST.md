# Professional Upload Feature - Deployment Checklist

## Quick Start

The feature is now fully implemented. Follow these steps to activate it on your server.

## Pre-Deployment Steps

### 1. Extract Vendor Dependencies (On Server)
```bash
cd /var/www/afyayako/api
tar -xzf vendor.tar.gz
```

### 2. Create Required Directories
```bash
mkdir -p storage/uploads/professionals/{photos,licenses}
chmod -R 775 storage/uploads/
chown -R nobody:nobody storage/  # or www-data depending on your server
```

### 3. Run Database Migration
```bash
php artisan migrate --force
```

This creates the `professionals` table with all fields for storing applications.

### 4. Create Storage Symlink (if using Laravel serve or specific web root)
```bash
php artisan storage:link
```

## Web Server Configuration

### Nginx (in your server block)
Add this before your main location blocks:

```nginx
# Allow access to uploaded professional documents
location /storage/uploads/ {
    alias /var/www/afyayako/storage/uploads/;
    # Only authenticated users should access
    auth_request /api/auth/verify;
    try_files $uri =404;
}
```

### Apache (in .htaccess)
```apache
# Allow professional document access
<FilesMatch "^(storage/uploads)">
    SetEnvIf Request_URI "^/storage/uploads" ALLOW_UPLOADS=1
</FilesMatch>
```

## Environment Configuration

### Update .env file with correct domain

```env
# Change these values:
APP_URL=https://afyayako.co.ke
FRONTEND_URL=https://afyayako.co.ke

# Verify database path is correct:
DB_DATABASE=/var/www/afyayako/api/database/database.sqlite
```

## Files Added

```
api/
├── app/
│   ├── Http/Controllers/
│   │   └── ProfessionalController.php  ← Main form handler
│   └── Models/
│       └── Professional.php  ← Database model
├── config/
│   └── filesystems.php  ← Storage configuration
├── database/migrations/
│   └── 2026_06_21_000001_create_professionals_table.php  ← DB schema
└── storage/uploads/
    └── professionals/
        ├── photos/  ← Profile photos stored here
        └── licenses/  ← License documents stored here

PROFESSIONAL_UPLOAD_FEATURE.md  ← Complete documentation
DEPLOYMENT_CHECKLIST.md  ← This file
```

## Testing the Feature

### 1. Verify Form Loads
Navigate to: `https://afyayako.co.ke/apply`

Should see:
- ✓ Photo upload section (teal)
- ✓ License upload section (sky blue)
- ✓ SOP agreement checkbox
- ✓ Specializations checkboxes
- ✓ Languages selection
- ✓ Payment information section

### 2. Test File Upload (Optional - for dev/staging)
```bash
curl -X POST https://afyayako.co.ke/api/professionals/apply \
  -F "email=test@example.com" \
  -F "full_name=Test Doctor" \
  -F "professional_type=doctor" \
  -F "professional_photo=@photo.jpg" \
  -F "license_document=@license.pdf" \
  -F "kmpdc_license=KP-2024-0123" \
  -F "specializations[]=trauma" \
  -F "specializations[]=anxiety" \
  -F "languages[]=english" \
  -F "languages[]=swahili" \
  -F "sop_agreed=true" \
  -F "signature_name=Test Doctor" \
  -F "mpesa_number=0712345678" \
  -F "rate_per_hour=2500"
```

Expected response:
```json
{
  "success": true,
  "message": "Application submitted successfully...",
  "professional_id": 1,
  "status": "pending"
}
```

### 3. Verify Files Stored
Check directory:
```bash
ls -la /var/www/afyayako/storage/uploads/professionals/photos/
ls -la /var/www/afyayako/storage/uploads/professionals/licenses/
```

Files should appear with timestamp-based names.

## Post-Deployment

### 1. Set Up Admin Dashboard (Next Phase)
The application status should be managed in an admin dashboard to:
- View pending applications
- Approve/reject professionals
- Download/review documents

### 2. Create Admin Routes
Add to api/api.php:
```php
Route::middleware(['auth:api', 'admin'])->group(function() {
    Route::get('/admin/professionals', [AdminController::class, 'listApplications']);
    Route::put('/admin/professionals/{id}/verify', [AdminController::class, 'verifyProfessional']);
    Route::put('/admin/professionals/{id}/reject', [AdminController::class, 'rejectProfessional']);
});
```

### 3. Email Notifications (Optional)
Trigger emails on:
- Application submitted (to professional)
- Application approved (to professional)
- Application rejected (to professional with reason)

### 4. Monitor Uploads
Watch for:
- Storage disk space
- Upload frequency
- Failed uploads in logs

## Troubleshooting

### Issue: "File upload failed"
**Solution:**
- Check `storage/uploads/` directory exists and is writable
- Verify `chmod 775 storage/uploads/`
- Check web server user permissions

### Issue: "Database table not found"
**Solution:**
- Run: `php artisan migrate --force`
- Check database connection in .env
- Verify SQLite file has write permissions

### Issue: "Files not found after upload"
**Solution:**
- Verify storage symlink: `ls -l public/storage`
- Run: `php artisan storage:link`
- Check web server can read from storage directory

### Issue: "Form won't submit"
**Solution:**
- Check browser console for JavaScript errors
- Verify `counselor-form-complete.js` is loaded
- Check API endpoint is accessible: `curl https://afyayako.co.ke/api/professionals/apply`

## Database Query Examples

### View all pending applications
```sql
SELECT id, email, full_name, professional_type, created_at 
FROM professionals 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

### View applications by type
```sql
SELECT * FROM professionals 
WHERE professional_type = 'doctor' 
AND status = 'pending';
```

### Find applications with documents
```sql
SELECT id, full_name, professional_photo_path, license_document_path 
FROM professionals 
WHERE professional_photo_path IS NOT NULL 
AND license_document_path IS NOT NULL;
```

### Approve a professional
```sql
UPDATE professionals 
SET status = 'verified', verified_at = NOW() 
WHERE id = 1;
```

## Monitoring & Logs

### Check upload errors
```bash
tail -f /var/www/afyayako/api/error_log | grep professional
tail -f /var/www/afyayako/api/error_log | grep upload
```

### Monitor storage usage
```bash
du -sh /var/www/afyayako/storage/uploads/professionals/
ls -lhS /var/www/afyayako/storage/uploads/professionals/photos/ | head -10
```

## Security Reminders

✓ Files are stored outside the web root (not directly accessible)
✓ File type validation on both client and server
✓ File size limits enforced (5MB photos, 10MB licenses)
✓ Email uniqueness prevents duplicate applications
✓ SOP consent is timestamped
✓ All uploads require authentication in future phases

## Support & Questions

See: `PROFESSIONAL_UPLOAD_FEATURE.md` for detailed documentation

Need help?
1. Check error logs: `api/error_log`
2. Verify file permissions: `ls -l storage/uploads/`
3. Test API directly: `curl` command above
4. Check database: `php artisan tinker`

## Rollback (if needed)

To revert this feature:

```bash
# Undo migration
php artisan migrate:rollback

# Remove files
rm -rf storage/uploads/professionals/
rm api/app/Http/Controllers/ProfessionalController.php
rm api/app/Models/Professional.php
rm api/config/filesystems.php
rm api/database/migrations/2026_06_21_000001_create_professionals_table.php
rm PROFESSIONAL_UPLOAD_FEATURE.md

# Restore previous commit
git revert 271ee99
git push origin main
```

---

**Deployment Date:** [DATE]
**Deployed By:** [YOUR NAME]
**Last Updated:** 2026-06-21
