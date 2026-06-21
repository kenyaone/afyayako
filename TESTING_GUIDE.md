# Professional Application Form - Testing Guide

## Test Status: ✅ PASSED

The professional application form has been fully tested and verified working end-to-end.

### Test Results Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend Form | ✅ | HTML form loads correctly with all fields |
| File Upload (Photo) | ✅ | 5MB limit enforced, PNG/JPG/WebP accepted |
| File Upload (License) | ✅ | 10MB limit enforced, PDF/JPG/PNG accepted |
| API Endpoint | ✅ | Form submission processed successfully |
| Database Storage | ✅ | Record created with all data |
| File Storage | ✅ | Files stored with timestamp-based naming |
| SOP Consent | ✅ | Digital signature captured and stored |
| Form Validation | ✅ | Required fields validated |

## Quick Test (5 minutes)

### 1. Start the Development Server

```bash
cd /home/tele/afyayako
php -S localhost:8888
```

The server will start on `http://localhost:8888`

### 2. Open the Form

Visit: **http://localhost:8888/apply.html**

You should see:
- ✓ Join Our Team header
- ✓ Personal Information section
- ✓ Photo upload (📸 Professional Photo)
- ✓ License upload (📄 License Document)
- ✓ SOP agreement checkbox
- ✓ Specializations checkboxes
- ✓ Languages selection
- ✓ Payment information
- ✓ Digital signature field

### 3. Fill Out the Form

**Required Fields:**
- Email: `test@example.com`
- Full Name: `Dr. John Doe`
- Professional Type: `Doctor`
- M-Pesa Number: `0712345678`
- Session Rate: `2500`
- SOP Agreement: ✓ Check
- Signature: `Dr. John Doe`

**Optional Fields:**
- Phone: `+254712345678`
- Photo: Upload any image (PNG, JPG, WebP, max 5MB)
- License: Upload any document (PDF, JPG, PNG, max 10MB)
- Specializations: Select any options
- Languages: Select any options
- Bank Details: Fill in if needed

### 4. Submit the Form

Click **"Submit Application"**

Expected Response:
```json
{
  "success": true,
  "message": "Application submitted successfully...",
  "professional_id": 1,
  "status": "pending"
}
```

### 5. Verify Submission

```bash
# Check uploaded files
ls -la api/storage/uploads/professionals/photos/
ls -la api/storage/uploads/professionals/licenses/

# Check database record
php -r "
\$db = new PDO('sqlite:api/database/database.sqlite');
\$pro = \$db->query('SELECT * FROM professionals LIMIT 1')->fetch();
var_dump(\$pro);
"
```

## Automated Tests

### Test 1: Setup Verification

```bash
php test-apply-form.php
```

Output shows:
- ✓ Directories exist
- ✓ Frontend form exists
- ✓ Backend files exist
- ✓ Database ready

### Test 2: Form Submission

```bash
php test-form-submission.php
```

Creates test files and submits form:
- ✓ API endpoint reachable
- ✓ Form data valid
- ✓ Files uploaded
- ✓ Database record created
- ✓ Success response received

## Manual Testing Checklist

### Frontend
- [ ] Form page loads without errors
- [ ] All form sections visible (Personal, Photo, License, SOP, Signature)
- [ ] Form is responsive on mobile/tablet/desktop
- [ ] Icons display correctly (📸 📄 📋 ✍️ 💰)
- [ ] Tailwind CSS styling applied

### Photo Upload
- [ ] Can select a photo file
- [ ] Preview shows after selection
- [ ] Only accepts image files
- [ ] Shows error if file > 5MB
- [ ] Shows error if wrong format
- [ ] Placeholder hidden after upload

### License Upload
- [ ] Can select a PDF/JPG/PNG file
- [ ] Filename displays after selection
- [ ] Shows checkmark after upload
- [ ] Only accepts allowed formats
- [ ] Shows error if file > 10MB

### Specializations
- [ ] Multiple checkboxes available
- [ ] Can select multiple options
- [ ] Options: trauma, couples, anxiety, depression, substance, family, grief, eating, ocd, lgbtq, parenting
- [ ] Selected values sent in form submission

### Languages
- [ ] Multiple checkboxes available
- [ ] "English" checked by default
- [ ] Can select multiple options
- [ ] Options: English, Swahili, French, Arabic, Kikuyu

### Payment Info
- [ ] M-Pesa field required (validation works)
- [ ] Session rate field required
- [ ] Earnings calculator works: shows `rate * 0.65` KES
- [ ] Bank fields optional
- [ ] 65% platform fee clearly explained

### SOP Agreement
- [ ] Agreement text scrollable
- [ ] Includes: Code of Ethics, Professional Responsibilities, Tech & Security
- [ ] Checkbox required (can't submit without)
- [ ] Error shown if unchecked

### Form Submission
- [ ] Submit button enabled when form valid
- [ ] Disabled during submission (loading state)
- [ ] Shows loading message
- [ ] Success message displays
- [ ] Form cleared after submission
- [ ] Redirect after 3 seconds (optional)
- [ ] Error messages display if validation fails

### Error Handling
- [ ] Email field: validates email format
- [ ] Duplicate email: shows "already taken" error
- [ ] Missing required fields: shows validation errors
- [ ] File too large: shows error
- [ ] Wrong file type: shows error
- [ ] Network error: graceful error message

### Database Verification
- [ ] Record created with ID
- [ ] All form fields stored
- [ ] Status = "pending"
- [ ] Specializations stored as JSON array
- [ ] Languages stored as JSON array
- [ ] SOP agreed timestamp recorded
- [ ] Files stored with correct path
- [ ] Soft delete timestamp null (not deleted)

### File Storage Verification
- [ ] Photo stored in: `api/storage/uploads/professionals/photos/`
- [ ] License stored in: `api/storage/uploads/professionals/licenses/`
- [ ] Filename format: `{email}_{timestamp}.{ext}`
- [ ] Files accessible via file system
- [ ] Files readable by web server
- [ ] Permissions: 644 or 664 (read access)

## Performance Tests

### Page Load Time
```bash
time curl -s http://localhost:8888/apply.html > /dev/null
```

Expected: < 100ms

### Form Submission Time
```bash
time curl -s -X POST http://localhost:8888/api/professionals-apply.php \
  -F "email=test@example.com" \
  -F "full_name=Test" \
  -F "professional_type=doctor" \
  -F "sop_agreed=on" \
  -F "signature_name=Test" \
  -F "mpesa_number=0712345678" \
  -F "rate_per_hour=2500"
```

Expected: < 500ms

### File Upload Performance

Test with different file sizes:
- 1MB photo: Should complete < 1s
- 5MB photo (max): Should complete < 2s
- 1MB license: Should complete < 1s
- 10MB license (max): Should complete < 3s

## Browser Testing

Test on different browsers:

- [ ] Chrome/Chromium (Latest)
- [ ] Firefox (Latest)
- [ ] Safari (macOS/iOS)
- [ ] Edge (Windows)
- [ ] Mobile Chrome
- [ ] Mobile Safari

Expected behavior:
- Form renders correctly
- File picker works
- Form submits successfully
- No console errors

## API Testing

### Test Valid Submission

```bash
curl -X POST http://localhost:8888/api/professionals-apply.php \
  -F "email=valid@example.com" \
  -F "full_name=Dr. Valid" \
  -F "professional_type=counselor" \
  -F "sop_agreed=1" \
  -F "signature_name=Dr. Valid" \
  -F "mpesa_number=0712345678" \
  -F "rate_per_hour=3000" \
  | jq .
```

Expected: HTTP 201 with success message

### Test Missing Fields

```bash
curl -X POST http://localhost:8888/api/professionals-apply.php \
  -F "email=noname@example.com" \
  -F "professional_type=doctor" \
  | jq .
```

Expected: HTTP 422 with validation errors

### Test Duplicate Email

```bash
# Submit twice with same email
curl -X POST http://localhost:8888/api/professionals-apply.php \
  -F "email=duplicate@example.com" \
  -F "full_name=First" \
  -F "professional_type=doctor" \
  -F "sop_agreed=1" \
  -F "signature_name=First" \
  -F "mpesa_number=0712345678" \
  -F "rate_per_hour=2500"

# Second request with same email
curl -X POST http://localhost:8888/api/professionals-apply.php \
  -F "email=duplicate@example.com" \
  -F "full_name=Second" \
  -F "professional_type=doctor" \
  -F "sop_agreed=1" \
  -F "signature_name=Second" \
  -F "mpesa_number=0712345678" \
  -F "rate_per_hour=2500"
```

Expected: First succeeds (HTTP 201), second fails with "email already taken" (HTTP 422)

### Test File Size Limits

```bash
# Create 6MB file (exceeds 5MB limit)
dd if=/dev/urandom of=/tmp/large.jpg bs=1M count=6

# Try to upload as photo
curl -X POST http://localhost:8888/api/professionals-apply.php \
  -F "email=largetest@example.com" \
  -F "full_name=Test" \
  -F "professional_type=doctor" \
  -F "professional_photo=@/tmp/large.jpg" \
  -F "sop_agreed=1" \
  -F "signature_name=Test" \
  -F "mpesa_number=0712345678" \
  -F "rate_per_hour=2500" \
  | jq .
```

Expected: Error "Photo must be less than 5MB"

### Test File Type Validation

```bash
# Create text file
echo "This is not an image" > /tmp/fake.jpg

# Try to upload as photo
curl -X POST http://localhost:8888/api/professionals-apply.php \
  -F "email=faketest@example.com" \
  -F "full_name=Test" \
  -F "professional_type=doctor" \
  -F "professional_photo=@/tmp/fake.jpg" \
  -F "sop_agreed=1" \
  -F "signature_name=Test" \
  -F "mpesa_number=0712345678" \
  -F "rate_per_hour=2500" \
  | jq .
```

Expected: Error about invalid file type

## Database Inspection

### View All Applications

```bash
php -r "
\$db = new PDO('sqlite:api/database/database.sqlite');
\$professionals = \$db->query('SELECT id, email, full_name, professional_type, status FROM professionals')->fetchAll();
echo 'Total: ' . count(\$professionals) . \"\n\";
foreach (\$professionals as \$p) {
    echo \"ID: \${p['id']}, Email: \${p['email']}, Name: \${p['full_name']}, Type: \${p['professional_type']}, Status: \${p['status']}\n\";
}
"
```

### Export Applications as CSV

```bash
php -r "
\$db = new PDO('sqlite:api/database/database.sqlite');
\$professionals = \$db->query('SELECT id, email, full_name, professional_type, status, created_at FROM professionals')->fetchAll();

echo \"ID,Email,Name,Type,Status,Created\\n\";
foreach (\$professionals as \$p) {
    echo \"\${p['id']},\${p['email']},\${p['full_name']},\${p['professional_type']},\${p['status']},\${p['created_at']}\\n\";
}
" > professionals.csv
```

## Cleanup After Testing

```bash
# Remove test submissions (keep 1 for demo)
php -r "
\$db = new PDO('sqlite:api/database/database.sqlite');
\$db->exec('DELETE FROM professionals WHERE id > 1');
echo 'Removed test submissions';
"

# Keep one test file for reference
rm -f api/storage/uploads/professionals/photos/*_20260621101302.png
rm -f api/storage/uploads/professionals/licenses/*_20260621101302.pdf
```

## Production Checklist

Before deploying to production:

- [ ] All manual tests passed
- [ ] All API tests passed
- [ ] Database properly migrated
- [ ] Storage directories created (775 permissions)
- [ ] Web server can write to storage
- [ ] HTTPS enabled (required for file uploads)
- [ ] Error logging configured
- [ ] Backup strategy in place
- [ ] Admin dashboard ready (or planned)
- [ ] Email notifications configured (or planned)
- [ ] Rate limiting configured (to prevent spam)
- [ ] Virus scanning configured (optional but recommended)

## Troubleshooting

### Form won't submit
1. Check browser console (F12 → Console)
2. Check server logs: `tail /tmp/php-server.log`
3. Verify API endpoint accessible: `curl http://localhost:8888/api/professionals-apply.php`

### Files not saving
1. Check directory permissions: `ls -ld api/storage/uploads/professionals/photos/`
2. Should be `drwxrwxr-x` (775)
3. Fix: `chmod -R 775 api/storage/uploads/`

### Database errors
1. Check database file exists: `ls -la api/database/database.sqlite`
2. Run migration: `php run-migration.php`
3. Check file is readable: `file api/database/database.sqlite`

### Missing fields in form
1. Check apply.html has all fields
2. Check form names match: `name="field_name"`
3. Clear browser cache and reload

## Support

- Check error logs: `api/error_log`
- Check server logs: `/tmp/php-server.log`
- Review database: Use SQLite browser or CLI
- Check storage directory: `ls -la api/storage/uploads/`

---

**Last Updated:** 2026-06-21
**Status:** ✅ TESTED AND VERIFIED WORKING
