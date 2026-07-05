# Deploy runbook — Tele-Mental Health compliance release

**Author note:** the compliance changes were made in the **staging** copy
(`/home/qnztnquh/public_html/api`, SQLite). The **live** site
(`api.uberhealth.co.ke` → `/home/qnztnquh/api`, MySQL `qnztnquh_uberhealth`)
is an **older release** (28 migrations applied vs 60 in staging) and holds real
data (24 users, 34 consultations, 3 professionals at time of writing).

Deploying these changes therefore ships the **whole staging release**, not just
the 8 compliance items, and runs **~32 pending migrations** against the live
MySQL database — including an encryption backfill of real patient data. Read the
caveats before running.

---

## 0. Pre-flight (do not skip)

1. **Back up the live MySQL DB:**
   ```
   mysqldump -u <user> -p qnztnquh_uberhealth > ~/backup_uberhealth_$(date +%F_%H%M).sql
   ```
2. **Confirm `APP_KEY` is set in the live `.env`** (`/home/qnztnquh/api/.env`):
   ```
   grep '^APP_KEY=base64' /home/qnztnquh/api/.env
   ```
   PHI is encrypted with this key. **Never rotate `APP_KEY` after the backfill** —
   doing so makes all encrypted clinical data unreadable.
3. Put the site in maintenance mode if your pipeline supports it
   (`php artisan down` from `/home/qnztnquh/api`).

## 1. Deploy code (your normal staging → live process)

Sync the staging codebase to `/home/qnztnquh/api`. New files that MUST land:

- `app/Support/Hotlines.php`, `app/Support/TelehealthConsent.php`, `app/Support/Severity.php`
- `app/Services/CrisisEscalator.php`
- `app/Console/Commands/EncryptPhi.php`
- `app/Http/Controllers/ConsentController.php`, `SupervisionController.php`
- `app/Models/UserConsent.php`, `AuditLog.php`, `Supervision.php`, `SupervisionSession.php`
- `database/migrations/2026_06_15_0000{02..09}_*.php` (8 new migrations)

Modified files: `routes/api.php`, `AuthController`, `ConsultationController`,
`ParentalConsentController`, `AssessmentController`, `CrisisController`,
`AdminController`, `ReferralController`, `ProfessionalController`, `AiController`,
`AiService`, `SafetyPlanController`, `CaseloadController`, and models
`User`, `Consultation`, `CrisisEvent`, `MoodLog`, `Assessment`, `SafetyPlan`,
`Professional`, `Referral`, `ParentalConsent`.

> Because live is a full release behind, prefer syncing the whole app rather than
> hand-picking files (the compliance changes depend on staging-only features such
> as ParentalConsent).

## 2. Migrate the live database

From `/home/qnztnquh/api`:
```
php artisan migrate --force
```
This runs every pending migration (the staging release + the 8 compliance ones).
All use standard schema builder calls and are MySQL-compatible.

## 3. Encrypt existing PHI at rest

Still from `/home/qnztnquh/api` (this one touches real data — backup first!):
```
php artisan phi:encrypt --dry-run    # review what will change
php artisan phi:encrypt              # apply
```
Idempotent and safe to re-run. Encrypts: consultation notes, crisis content,
mood notes, assessment responses, and safety-plan fields.

## 4. Clear / rebuild caches

```
php artisan optimize:clear
# if you use cached config/routes in production, rebuild them:
php artisan config:cache
php artisan route:cache
```

## 5. Verify live

```
curl -s https://api.uberhealth.co.ke/api/crisis/hotlines        # expect 13 entries
curl -s -o /dev/null -w "%{http_code}\n" \
     https://api.uberhealth.co.ke/api/consent/telehealth          # expect 200
```
Bring the site back up (`php artisan up`).

## 6. Deploy the frontend TOGETHER with this

The API now enforces several **breaking** contracts (see
`API_CHANGELOG_TeleMentalHealth.md`). The current production frontend does **not**
send the new required fields, so until it's updated:

- new bookings will fail (DOB required),
- professional registration will fail (qualification + 3-yr minimum),
- minor parental-consent verification will fail (minor_assent required),
- recording save will fail (recording consent required).

Ship the frontend changes from the changelog in the same release.

---

## Rollback

- Code: restore the previous `/home/qnztnquh/api` from your deploy snapshot.
- DB: restore the mysqldump from step 0. (Schema changes are additive, but the
  PHI backfill is one-way per the live `APP_KEY`; the dump is the clean rollback.)
