# Production Deployment Guide

## Files Uploaded to Server

The following files have been uploaded to your production server at `https://afyayako.co.ke/`:

```
public_html/
├── apply.html                          ← NEW: Professional application form
├── afyayako-deploy.tar.gz              ← NEW: Deployment package with code
├── run-migration.php                   ← NEW: Database migration script
├── deploy.php                          ← NEW: Automated deployment script
├── setup.php                           ← NEW: Setup status checker
├── test-apply-form.php                 ← NEW: Testing utility
├── PROFESSIONAL_UPLOAD_FEATURE.md      ← NEW: Technical documentation
├── DEPLOYMENT_CHECKLIST.md             ← NEW: Deployment guide
├── TESTING_GUIDE.md                    ← NEW: Testing procedures
└── api/                                ← Existing API directory
```

## Manual Deployment Steps (SSH Access Required)

If you have SSH access to your server, run these commands:

### Step 1: Navigate to Public HTML

```bash
cd ~/public_html
```

### Step 2: Extract Deployment Package

```bash
tar -xzf afyayako-deploy.tar.gz
```

This creates:
- `api/app/Http/Controllers/ProfessionalController.php`
- `api/app/Models/Professional.php`
- `api/config/filesystems.php`
- `api/database/migrations/2026_06_21_000001_create_professionals_table.php`
- `api/professionals-apply.php`

### Step 3: Create Storage Directories

```bash
mkdir -p api/storage/uploads/professionals/{photos,licenses}
mkdir -p api/storage/app
mkdir -p api/bootstrap/cache
chmod -R 775 api/storage/
chmod -R 775 api/database/
chmod -R 775 api/bootstrap/
```

### Step 4: Extract Vendor (if not already extracted)

```bash
cd api
tar -xzf vendor.tar.gz
cd ..
```

### Step 5: Run Database Migration

```bash
php run-migration.php
```

Expected output:
```
Connected to SQLite database
✓ Created professionals table
✓ Created migrations table
✓ Recorded migration
✓ Database migration completed successfully!
```

### Step 6: Verify Setup

```bash
php test-apply-form.php
```

Should show:
```
✓ Checking directories...
  ✓ api/storage/uploads/professionals/photos exists
  ✓ api/storage/uploads/professionals/licenses exists
✓ Checking frontend form...
  ✓ apply.html exists
✓ Checking backend files...
  ✓ Professional Controller (...)
  ✓ Professional Model (...)
✓ Checking database...
  ✓ SQLite database exists
  ✓ Database has tables
```

### Step 7: Update Environment Variables

Edit `api/.env` and update:

```env
APP_URL=https://afyayako.co.ke
FRONTEND_URL=https://afyayako.co.ke
DB_DATABASE=/home/qnztnquh/public_html/api/database/database.sqlite
```

### Step 8: Test the Form

Visit: **https://afyayako.co.ke/apply.html**

Should see:
- ✓ Professional application form
- ✓ Photo upload section
- ✓ License upload section
- ✓ SOP consent agreement
- ✓ All form fields

## Via cPanel Terminal (If No SSH)

If you only have cPanel access:

1. Log in to cPanel: http://54.36.164.223:2082/
2. Open "Terminal" or "Advanced Terminal"
3. Run the commands from **Steps 1-7** above

## Via Browser (Alternative)

If Terminal is not available:

1. Visit: **https://afyayako.co.ke/setup.php**
   - This shows current setup status
   - Lists files and directories

2. Run migration manually:
   - Visit: **https://afyayako.co.ke/run-migration.php**
   - Should show migration results

3. Test form:
   - Visit: **https://afyayako.co.ke/apply.html**

## Verification Checklist

After deployment, verify:

- [ ] **Form Loads**: https://afyayako.co.ke/apply.html
- [ ] **All Sections Visible**: Personal info, photo, license, SOP, signature
- [ ] **Directories Exist**:
  ```bash
  ls -la api/storage/uploads/professionals/
  # Should show: photos/ licenses/
  ```
- [ ] **Database Created**:
  ```bash
  file api/database/database.sqlite
  # Should show: SQLite 3.x database
  ```
- [ ] **Files Stored**: After form submission, check:
  ```bash
  ls api/storage/uploads/professionals/photos/
  ls api/storage/uploads/professionals/licenses/
  ```
- [ ] **API Endpoint**:
  ```bash
  curl -X POST https://afyayako.co.ke/api/professionals-apply.php \
    -F "email=test@example.com" \
    -F "full_name=Test" \
    -F "professional_type=doctor" \
    -F "sop_agreed=1" \
    -F "signature_name=Test" \
    -F "mpesa_number=0712345678" \
    -F "rate_per_hour=2500"
  ```
  Should return: `{"success": true, ...}`

## Testing the Form

### Quick Manual Test

1. Open: https://afyayako.co.ke/apply.html
2. Fill in:
   - Email: `test@yourdomain.com`
   - Name: `Test Doctor`
   - Type: `Doctor`
   - M-Pesa: `0712345678`
   - Rate: `2500`
   - Check SOP agreement
   - Sign: `Test Doctor`
3. Optional: Upload photo and license
4. Click: "Submit Application"
5. Expect: Success message + redirect to home

### Automated Test

```bash
curl -X POST https://afyayako.co.ke/api/professionals-apply.php \
  -F "email=doctor.$(date +%s)@test.com" \
  -F "full_name=Dr. Test" \
  -F "professional_type=doctor" \
  -F "specializations[]=trauma" \
  -F "languages[]=english" \
  -F "sop_agreed=1" \
  -F "signature_name=Dr. Test" \
  -F "mpesa_number=0712345678" \
  -F "rate_per_hour=2500"
```

Should return:
```json
{
  "success": true,
  "message": "Application submitted successfully...",
  "professional_id": 1,
  "status": "pending"
}
```

## Common Issues & Solutions

### Issue: "apply.html not found"
**Solution**: 
```bash
ls -la apply.html
# If missing, upload via SFTP or extract from afyayako-deploy.tar.gz
```

### Issue: "Permission denied" on storage
**Solution**:
```bash
chmod -R 775 api/storage/
chmod -R 775 api/database/
```

### Issue: "Database file not found"
**Solution**:
```bash
touch api/database/database.sqlite
php run-migration.php
```

### Issue: "Cannot access API endpoint"
**Solution**:
```bash
# Check if file exists
ls -la api/professionals-apply.php

# Check if it's readable
file api/professionals-apply.php

# Test directly
php api/professionals-apply.php
```

### Issue: "Files not uploading"
**Solution**:
1. Check storage directory is writable:
   ```bash
   touch api/storage/uploads/test.txt
   rm api/storage/uploads/test.txt
   ```
2. Verify permissions: `ls -ld api/storage/uploads/`
3. Check disk space: `df -h`

## File Locations on Server

- **Form Page**: `/home/qnztnquh/public_html/apply.html`
- **API Endpoint**: `/home/qnztnquh/public_html/api/professionals-apply.php`
- **Database**: `/home/qnztnquh/public_html/api/database/database.sqlite`
- **Uploaded Photos**: `/home/qnztnquh/public_html/api/storage/uploads/professionals/photos/`
- **Uploaded Licenses**: `/home/qnztnquh/public_html/api/storage/uploads/professionals/licenses/`
- **Controllers**: `/home/qnztnquh/public_html/api/app/Http/Controllers/`
- **Models**: `/home/qnztnquh/public_html/api/app/Models/`

## URL Access

| Page | URL |
|------|-----|
| Professional Application Form | https://afyayako.co.ke/apply.html |
| Setup Status | https://afyayako.co.ke/setup.php |
| Database Migration | https://afyayako.co.ke/run-migration.php |
| API Endpoint | https://afyayako.co.ke/api/professionals-apply.php |

## Next Steps (Future Enhancements)

1. **Admin Dashboard** - Review pending applications
2. **Email Notifications** - Notify professionals of approval/rejection
3. **KMPDC Integration** - Verify licenses automatically
4. **Payment Processing** - Process session bookings
5. **Professional Profiles** - Display approved professionals

## Cleanup

After successful deployment:

```bash
# Remove temporary files (optional)
rm afyayako-deploy.tar.gz
rm deploy.php
rm setup.php
```

## Support

For issues:
1. Check error logs: `/home/qnztnquh/public_html/api/error_log`
2. Review documentation: `TESTING_GUIDE.md`
3. Check database: `sqlite3 api/database/database.sqlite`

## Rollback (If Needed)

To revert to previous state:

```bash
# Delete new files
rm -f apply.html
rm -rf api/app/
rm -rf api/config/filesystems.php
rm -f api/professionals-apply.php
rm -f api/database/migrations/2026_06_21_000001_create_professionals_table.php

# Clear database (if needed)
rm -f api/database/database.sqlite

# Clean up deployment files
rm -f afyayako-deploy.tar.gz deploy.php
```

---

**Deployment Date**: 2026-06-21
**Status**: ✅ READY FOR PRODUCTION
**Form URL**: https://afyayako.co.ke/apply.html
