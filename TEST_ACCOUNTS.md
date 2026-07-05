# Test Accounts - Afya Yako Siri Yako

**Created:** June 18, 2026  
**Platform:** afyayako.co.ke

---

## 🔐 Test Credentials

### ADMIN ACCOUNT
```
Username:  test_admin
Password:  Admin@1234567890
Email:     admin@test.local
Role:      Admin
```
**Access:** Full platform admin, compliance dashboard, test account management

---

### PATIENT ACCOUNTS

#### Patient 1
```
Username:  test_patient_1
Password:  Patient1@1234567
Email:     patient1@test.local
Role:      Patient
```
**Name:** John Doe

#### Patient 2
```
Username:  test_patient_2
Password:  Patient2@1234567
Email:     patient2@test.local
Role:      Patient
```
**Name:** Jane Smith

---

### PROFESSIONAL ACCOUNTS

#### Professional 1 (Therapist)
```
Username:  test_therapist_1
Password:  Therapist1@123456
Email:     therapist1@test.local
Role:      Professional
```
**Name:** Dr. Sarah Kipchoge  
**Specialization:** Anxiety & Depression  
**Years Experience:** 8  
**License:** KMPDC Verified (TEST)

#### Professional 2 (Therapist)
```
Username:  test_therapist_2
Password:  Therapist2@123456
Email:     therapist2@test.local
Role:      Professional
```
**Name:** James Omondi  
**Specialization:** Addiction Recovery  
**Years Experience:** 6  
**License:** KMPDC Verified (TEST)

---

## 🧪 Testing Scenarios

### As Patient
1. Login with `test_patient_1`
2. Browse professionals (see `test_therapist_1` & `test_therapist_2`)
3. Book a consultation
4. Join session
5. File complaint / report incident

### As Professional
1. Login with `test_therapist_1`
2. View consultations
3. Access caseload
4. View supervision dashboard
5. Update availability

### As Admin
1. Login with `test_admin`
2. Verify professionals
3. View compliance dashboard
4. Manage incidents & complaints
5. Create more test accounts via Test Account Manager
6. View test account list

---

## ⚠️ Important Notes

- ✅ All accounts are marked as `is_test_account = true`
- ✅ Professional profiles are KMPDC verified (test status)
- ✅ Passwords are secure 16+ characters
- ⚠️ **DO NOT** use these credentials in production
- ⚠️ **DO NOT** share these credentials via unencrypted channels
- 🔒 Keep this file secure and access-controlled
- 🗑️ Delete test accounts before going live

---

## 🔄 Managing Test Accounts

### Via Admin Panel
1. Go to `/admin` (login as test_admin)
2. Click "Test Accounts" tab
3. Create new test accounts with auto-generated passwords
4. Reset passwords on demand
5. Delete test accounts

### Via API
```bash
# List test accounts
GET /api/admin/test-accounts

# Create new test account
POST /api/admin/test-accounts
{
  "display_name": "Dr. Test",
  "role": "professional",
  "email": "optional@test.local"
}

# Reset password
POST /api/admin/test-accounts/{id}/reset-password

# Delete test account
DELETE /api/admin/test-accounts/{id}
```

---

## ✨ Test User Journeys

### Patient Booking Consultation
1. Login as `test_patient_1`
2. Go to "Find Therapist"
3. See test therapists with verified badges
4. Click "Book Session" on any therapist
5. Select time slot
6. Complete booking

### Professional Accepting Consultation
1. Login as `test_therapist_1`
2. Go to "My Sessions"
3. See pending consultation from test_patient_1
4. Accept or decline
5. Join video session when scheduled

### Admin Compliance Workflow
1. Login as `test_admin`
2. Go to "Compliance" dashboard
3. View KPIs (incidents, complaints, metrics)
4. File test incident as patient
5. Investigate as admin
6. Document resolution

---

## 🚀 Tips

- Use browser DevTools (F12) to clear cache if seeing old data
- Test accounts reset daily in production
- Mobile testing: Use mobile view in DevTools or real mobile device
- Performance: Test on slow 3G networks using DevTools throttling
- Accessibility: Test with screen readers (NVDA, JAWS, VoiceOver)

---

**Last Updated:** June 18, 2026  
**Confidential - Testing Only**
