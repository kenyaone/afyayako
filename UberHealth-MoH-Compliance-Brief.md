# Tele-Mental Health Compliance Brief
### UberHealth ("Afya Yako Siri Yako")

**Alignment with the MoH National Tele-Mental Health Guidelines (January 2021)**
**Prepared for:** Ministry of Health, Division of Mental Health
**Date:** 15 June 2026

---

## 1. Purpose
This brief presents how the UberHealth tele-mental health platform (api.uberhealth.co.ke / uberhealth.co.ke) has been aligned with the Ministry of Health National Tele-Mental Health Guidelines (January 2021). It is submitted to support review and approval for operation.

## 2. About the platform
UberHealth is a Kenyan tele-mental health platform delivering psychiatric, psychotherapy and counselling services over a distance via secure video, audio and chat. Its guiding principle, "Afya Yako Siri Yako" (Your Health, Your Secret), reflects a commitment to confidentiality and access to quality mental health care, including for those in remote areas and vulnerable groups.

## 3. Executive summary
The platform implements the safeguards set out across the ten Guidelines. Services are restricted to registered mental health practitioners who meet a defined competence floor. All clinical records are encrypted at rest, access is audited, and informed consent is documented. Crisis and suicide-risk handling, emergency referral lines, supervision of practitioners, and a closed-loop referral system are in place. Age is verified before service, and minors require both guardian consent and the minor's own assent. The implementation has been verified end-to-end on the live system.

## 4. Compliance with the Guidelines

**Guideline 1 — Artificial Intelligence.** AI is used only as first-line support for mild-to-moderate concerns, under strict guardrails (it never diagnoses or addresses medication). Severe screening results are routed to a qualified human professional. *[Implemented]*

**Guideline 2 — Testing & Assessment.** Validated instruments are used (PHQ-9, GAD-7, AUDIT, PGSI, FTND) with suicide-risk screening and assessment of client suitability before tele-services. *[Implemented]*

**Guideline 3 — Legislative & Regulatory.** The platform operates in line with relevant Kenyan law, including the Mental Health Act (CAP 248), the Data Protection Act 2019, the Health Act 2017 and the Counsellors and Psychologists Act 2014. *[Implemented]*

**Guideline 4 — Ethical Issues.** A versioned informed-consent document is presented and its acceptance recorded (with version, time and IP). Clinical data is encrypted at rest; access to records is logged; sessions are recorded only with explicit prior consent and recordings are securely deleted on request. *[Implemented]*

**Guideline 5 — Capacity Building.** Practitioners must declare qualifications and are oriented to the guidelines; the platform enforces a competence floor and supports ongoing review. *[Implemented; ongoing]*

**Guideline 6 — Emergency Planning.** The official national toll-free lines are integrated and surfaced to clients (incl. 1199, 116, 1192, 0800 720 608, GBV and emergency/ambulance lines). *[Implemented]*

**Guideline 7 — Suicidal Clients.** Suicide risk is screened and detected; events escalate to administrators and the client's assigned therapist, are tracked to resolution, and clients are guided to create a safety plan. *[Implemented]*

**Guideline 8 — Self-Care.** Practitioners have access to a validated burnout assessment (ProQOL-5) to monitor their own well-being. *[Implemented]*

**Guideline 9 — Supervision.** Supervisors can be assigned to practitioners and supervision sessions are formally logged. *[Implemented; management console in progress]*

**Guideline 10 — Referral System.** A referral management system supports internal and external referrals with feedback from the receiving provider back to the referrer (closed loop). *[Implemented; console in progress]*

## 5. Data protection & confidentiality
- Clinical records (assessment responses, clinical notes, crisis disclosures, mood notes and safety plans) are encrypted at rest.
- Access to patient records and any data export is recorded in an audit trail.
- Informed consent is documented and versioned; recording requires explicit consent and can be withdrawn.
- Age is verified before any service; minors require guardian consent and the minor's own assent.
- Only verified, registered practitioners (KMPDC / Counsellors and Psychologists Board) who meet the competence floor (minimum a diploma and at least three years of experience) may offer services.

## 6. Assurance & verification
The implementation has been verified on the live system through end-to-end testing of the critical journeys: account creation with age verification, informed consent, screening with encrypted storage, the AI-to-human referral safeguard, crisis reporting and escalation, professional registration controls, and session booking. All checks passed and test data was removed.

## 7. Items in progress
- User-facing administrative consoles for the supervision, referral, crisis-queue and audit-log functions (the underlying safeguards are already active).
- Expanded cognitive/mental-status screening options.
- Routine independent security review and periodic guideline re-alignment as the field evolves.

## 8. Declaration
UberHealth is committed to operating within the National Tele-Mental Health Guidelines and applicable Kenyan law, and to updating these measures as the guidelines evolve. We respectfully submit this brief for the Ministry's review and approval.

**Contact:** info@uberhealth.co.ke | https://uberhealth.co.ke
