# UberHealth API — Tele-Mental Health Compliance Changelog

**Date:** 2026-06-15
**Scope:** Backend changes aligning the API with the Kenya MoH National Tele-Mental
Health Guidelines (January 2021). All changes are live in the API. **The frontend
must be updated to match the stricter contracts below** — several are breaking.

Base URL: `https://api.uberhealth.co.ke/api`

---

## ⚠️ Breaking changes (update frontend before/with this release)

1. **Booking requires date of birth.** `POST /consultations` returns `422 {requires_date_of_birth:true}` if the user has no DOB on file. Collect DOB at signup or profile.
2. **Parental consent requires minor assent.** `POST /parental-consent/verify` now requires `minor_assent` (true).
3. **Recording requires prior consent.** `POST /consultations/{id}/recording` returns `422 {requires_recording_consent:true}` unless recording consent was granted first.
4. **Professional registration floor.** `POST /professionals/register` and `/professionals/apply` now require `qualification` and `years_experience >= 3`.
5. **Referral approve/reject is admin-only.** Professionals calling these get `403`.

---

## New endpoints

### Consent
- `GET /consent/telehealth` *(public)* — current informed-consent document. Returns `{ type, version, title, body, hash }`. Show before signup/booking.
- `GET /consent/telehealth/status` *(auth)* — `{ current_version, accepted, accepted_version, accepted_at }`.
- `POST /consent/telehealth/accept` *(auth)* — records explicit acceptance of the current version.

### Recording consent
- `POST /consultations/{id}/recording-consent` *(auth, patient)* — body `{ consent: boolean }`. Grants/withdraws permission to record. Must be `true` before a recording can be saved.

### Referral feedback loop (professional)
- `GET /referrals/incoming` — internal referrals addressed to the logged-in professional.
- `POST /referrals/{id}/respond` — body `{ response: "accepted"|"declined", receiver_notes?: string }`. Notifies the referrer.
- `POST /referrals/{id}/outcome` — body `{ outcome: string }`. Marks completed, notifies the referrer.

### Supervision (professional)
- `GET /supervision/supervisees` — active supervisions where I am supervisor.
- `GET /supervision/supervisors` — active supervisions where I am supervisee.
- `POST /supervision/{id}/sessions` — body `{ session_date, duration_minutes?, notes }`. Supervisor only.
- `GET /supervision/{id}/sessions` — supervisor or supervisee.

### Admin
- `GET /admin/crisis?status=unresolved|resolved` — crisis-event queue.
- `PUT /admin/crisis/{id}/resolve` — body `{ resolution_notes }`.
- `GET /admin/audit-logs?action=&user_id=` — access/audit trail.
- `GET /admin/supervisions` · `POST /admin/supervisions` (body `{ supervisor_id, supervisee_id }`) · `PUT /admin/supervisions/{id}/end`.

---

## Changed endpoints

### Auth & profile
- `POST /auth/signup` — new optional `date_of_birth` (`YYYY-MM-DD`, before today). Collect it.
- `PUT /auth/me` — accepts `date_of_birth` (settable once; ignored if already set).

### Booking
- `POST /consultations` — still needs `consent_accepted: true`; now also requires the user to have a DOB (`422 requires_date_of_birth`); minor without parental consent → `422 requires_parental_consent`. Telehealth consent is auto-recorded on success.

### Parental consent
- `POST /parental-consent/verify` — add required `minor_assent` (boolean, must be accepted) alongside `otp`, guardian fields.

### Recording
- `POST /consultations/{id}/recording` — gated on recording consent (see new endpoint).
- `GET /consultations/{id}/recording/share` — response now `{ share_url, consultation_id, notice }` (the fake `expires_in` was removed).

### AI
- `POST /ai/assessment-insight` — response now `{ insight, requires_human_referral, referral? }`. When `requires_human_referral` is true, `referral` = `{ message, action: "find_therapist", hotlines[] }`. Surface a "find a professional" CTA.
- `POST /ai/chat` — response now includes `requires_human_referral`.

### Crisis & assessments
- `POST /crisis/report` — response now `{ message, event, hotlines, prompt_safety_plan: true }` and escalates internally.
- `POST /assessments` — response now includes `prompt_safety_plan` (boolean). When true, prompt the user to create/review a safety plan.
- `GET /crisis/hotlines` — now returns the full official MoH directory (13 entries), each `{ name, phone, available, category }`.

### Professional registration
- `POST /professionals/register`, `POST /professionals/apply` — new required `qualification` (string); `years_experience` minimum is now **3** (was 0); new optional `cpb_license`, `credential_document` (URL to uploaded proof).

### Admin
- `PUT /admin/professionals/{id}/verify` — verifying now returns `422` if the competence floor is unmet (years < 3, missing qualification, or missing license).

---

## Behavioural changes (no new UI, but good to know)
- **Clinical data is encrypted at rest** (notes, crisis content, mood notes, assessment responses, safety plans). API responses are unchanged — values are returned decrypted.
- **Access auditing** records views of patient records/safety plans, shared-session data, exports, and professional verification.
- **Recording deletion** now removes the stored file from disk (secure disposal), not just the reference.

---

## Suggested rollout order
1. Add DOB capture (signup + profile) and minor-assent checkbox.
2. Add the consent document screen + acceptance.
3. Add recording-consent toggle before enabling recording.
4. Handle the AI `requires_human_referral` CTA and `prompt_safety_plan`.
5. Update professional onboarding form (qualification, credential upload, 3-yr minimum).
6. Build admin crisis queue, audit-log viewer, and supervision screens.
