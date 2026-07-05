const html2pdf = require('html2pdf.js');
const fs = require('fs');
const path = require('path');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Afya Yako MOH Compliance Brief</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #000; margin: 20px;">

<div style="page-break-after: always; text-align: center; padding: 80px 20px; border: 2px solid #000;">
    <h1 style="font-size: 2.2em; margin: 0;">AFYA YAKO SIRI YAKO</h1>
    <p style="font-size: 1.3em; margin: 20px 0; font-weight: 600;">Ministry of Health Compliance Brief</p>
    <p style="font-size: 1em; margin: 30px 0; font-style: italic;">Your Health, Your Secret</p>
    <p>A MOH-Compliant Telemedicine Platform for Kenya</p>
    <p style="margin-top: 80px; font-size: 0.95em;">June 2026</p>
</div>

<div style="page-break-after: always; padding: 20px;">
    <h1 style="font-size: 1.3em; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 15px;">Overview</h1>
    <p><strong>Afya Yako Siri Yako</strong> is a fully MOH-compliant telemedicine platform providing anonymous mental health services across Kenya. The system implements professional oversight, data protection, and quality assurance aligned with Ministry of Health standards.</p>

    <h2 style="font-size: 1.1em; margin-top: 20px; margin-bottom: 12px;">Key Features</h2>
    <ul style="margin-left: 25px;">
        <li>✓ KMPDC/CPB verified professionals (100%)</li>
        <li>✓ AES-256 encrypted data protection</li>
        <li>✓ Incident & complaint management system</li>
        <li>✓ Professional supervision tracking (MOH Guideline 9)</li>
        <li>✓ Response time SLA monitoring (2-hour default)</li>
        <li>✓ Quality assurance metrics & KPI tracking</li>
        <li>✓ Configurable data retention & deletion audit trails</li>
        <li>✓ Parental consent for minors (under 18)</li>
        <li>✓ Kiswahili language support</li>
        <li>✓ Mobile-first PWA design</li>
    </ul>

    <h2 style="font-size: 1.1em; margin-top: 20px; margin-bottom: 12px;">Strategic Impact</h2>
    <ul style="margin-left: 25px;">
        <li><strong>Expands Access:</strong> Reaches rural/remote areas safely</li>
        <li><strong>Ensures Quality:</strong> KPIs, supervision, complaints, metrics</li>
        <li><strong>Protects Patients:</strong> Encryption, verification, incident handling</li>
        <li><strong>Supports MOH Goals:</strong> Digital health transformation</li>
    </ul>
</div>

<div style="page-break-after: always; padding: 20px;">
    <h1 style="font-size: 1.3em; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 15px;">1. Professional Licensing & Verification</h1>

    <h2 style="font-size: 1.1em; margin-top: 20px; margin-bottom: 12px;">Compliance</h2>
    <ul style="margin-left: 25px;">
        <li>✓ All therapists KMPDC Licensed</li>
        <li>✓ CPB Verified certification</li>
        <li>✓ Real-time verification badges on profiles</li>
        <li>✓ Automatic license expiry tracking</li>
        <li>✓ Professional credentials displayed to patients</li>
    </ul>

    <h2 style="font-size: 1.1em; margin-top: 20px; margin-bottom: 12px;">Patient Assurance</h2>
    <p>Every professional profile displays: KMPDC/CPB badges | Years of experience | Specializations | Ratings | Verified status</p>

    <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
        <tr style="background: #f0f0f0;">
            <th style="border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold;">Requirement</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold;">Implementation</th>
        </tr>
        <tr>
            <td style="border: 1px solid #000; padding: 8px;">Only licensed professionals</td>
            <td style="border: 1px solid #000; padding: 8px;">100% KMPDC/CPB verified</td>
        </tr>
        <tr>
            <td style="border: 1px solid #000; padding: 8px;">License validity tracking</td>
            <td style="border: 1px solid #000; padding: 8px;">Automated expiry monitoring</td>
        </tr>
        <tr>
            <td style="border: 1px solid #000; padding: 8px;">Credential transparency</td>
            <td style="border: 1px solid #000; padding: 8px;">Badges on all profiles</td>
        </tr>
    </table>
</div>

<div style="page-break-after: always; padding: 20px;">
    <h1 style="font-size: 1.3em; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 15px;">2. Incident & Complaint Management</h1>

    <h2 style="font-size: 1.1em; margin-top: 20px; margin-bottom: 12px;">Reporting System</h2>
    <ul style="margin-left: 25px;">
        <li>✓ Patient adverse event reporting</li>
        <li>✓ Professional complaint filing</li>
        <li>✓ Admin investigation dashboard</li>
        <li>✓ Status tracking: open → investigating → resolved → closed</li>
        <li>✓ Disciplinary actions: warnings, suspensions, terminations</li>
        <li>✓ Complete audit trail of all actions</li>
    </ul>

    <h2 style="font-size: 1.1em; margin-top: 20px; margin-bottom: 12px;">Severity Levels</h2>
    <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
        <tr style="background: #f0f0f0;">
            <th style="border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold;">Type</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold;">Severity</th>
        </tr>
        <tr>
            <td style="border: 1px solid #000; padding: 8px;">Adverse Event</td>
            <td style="border: 1px solid #000; padding: 8px;">Low, Medium, High, Critical</td>
        </tr>
        <tr>
            <td style="border: 1px solid #000; padding: 8px;">Complaint</td>
            <td style="border: 1px solid #000; padding: 8px;">Minor, Moderate, Severe, Critical</td>
        </tr>
        <tr>
            <td style="border: 1px solid #000; padding: 8px;">Near Miss</td>
            <td style="border: 1px solid #000; padding: 8px;">Low, Medium, High, Critical</td>
        </tr>
        <tr>
            <td style="border: 1px solid #000; padding: 8px;">Safety Concern</td>
            <td style="border: 1px solid #000; padding: 8px;">Low, Medium, High, Critical</td>
        </tr>
    </table>

    <h2 style="font-size: 1.1em; margin-top: 20px; margin-bottom: 12px;">Workflow</h2>
    <p>Report → Notification → Investigation → Resolution → Disciplinary Action (if needed) → Documented & Audited</p>
</div>

<div style="page-break-after: always; padding: 20px;">
    <h1 style="font-size: 1.3em; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 15px;">3. Data Protection & Privacy</h1>

    <h2 style="font-size: 1.1em; margin-top: 20px; margin-bottom: 12px;">Encryption & Security</h2>
    <ul style="margin-left: 25px;">
        <li>✓ AES-256 encryption for all PHI</li>
        <li>✓ End-to-end encrypted sessions</li>
        <li>✓ HTTPS encrypted communication</li>
        <li>✓ Secure platform only (no WhatsApp/SMS)</li>
        <li>✓ Role-based access control</li>
        <li>✓ Audit logging of all data access</li>
    </ul>

    <h2 style="font-size: 1.1em; margin-top: 20px; margin-bottom: 12px;">Data Retention Periods</h2>
    <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
        <tr style="background: #f0f0f0;">
            <th style="border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold;">Data Type</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold;">Retention</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold;">Deletion</th>
        </tr>
        <tr>
            <td style="border: 1px solid #000; padding: 8px;">Mood Logs</td>
            <td style="border: 1px solid #000; padding: 8px;">365 days</td>
            <td style="border: 1px solid #000; padding: 8px;">Auto-delete with audit</td>
        </tr>
        <tr>
            <td style="border: 1px solid #000; padding: 8px;">Assessments</td>
            <td style="border: 1px solid #000; padding: 8px;">365 days</td>
            <td style="border: 1px solid #000; padding: 8px;">Auto-delete with audit</td>
        </tr>
        <tr>
            <td style="border: 1px solid #000; padding: 8px;">Consultations</td>
            <td style="border: 1px solid #000; padding: 8px;">Indefinite</td>
            <td style="border: 1px solid #000; padding: 8px;">Anonymized after 2 years</td>
        </tr>
        <tr>
            <td style="border: 1px solid #000; padding: 8px;">Journal Entries</td>
            <td style="border: 1px solid #000; padding: 8px;">365 days</td>
            <td style="border: 1px solid #000; padding: 8px;">User-initiated deletion</td>
        </tr>
    </table>

    <p style="background: #f9f9f9; padding: 10px; border-left: 3px solid #000; margin: 12px 0;"><strong>Deletion Audit Trail:</strong> Every deletion logged with entity type, reason, user ID, and timestamp.</p>
</div>

<div style="page-break-after: always; padding: 20px;">
    <h1 style="font-size: 1.3em; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 15px;">4. Professional Supervision & Quality Assurance</h1>

    <h2 style="font-size: 1.1em; margin-top: 20px; margin-bottom: 12px;">MOH Guideline 9 — Mandatory Supervision</h2>
    <ul style="margin-left: 25px;">
        <li>✓ Supervision dashboard tracks supervisors & supervisees</li>
        <li>✓ Supervision sessions logged with dates, duration, notes</li>
        <li>✓ Compliance alerts for unsupervised practitioners</li>
        <li>✓ Escalation protocols if supervision missing</li>
    </ul>

    <h2 style="font-size: 1.1em; margin-top: 20px; margin-bottom: 12px;">Response Time SLA</h2>
    <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
        <tr style="background: #f0f0f0;">
            <th style="border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold;">Metric</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold;">SLA</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold;">Status</th>
        </tr>
        <tr>
            <td style="border: 1px solid #000; padding: 8px;">Consultation Response</td>
            <td style="border: 1px solid #000; padding: 8px;">2 hours</td>
            <td style="border: 1px solid #000; padding: 8px;">Automated tracking</td>
        </tr>
        <tr>
            <td style="border: 1px solid #000; padding: 8px;">SLA Compliance</td>
            <td style="border: 1px solid #000; padding: 8px;">100% target</td>
            <td style="border: 1px solid #000; padding: 8px;">Admin dashboard</td>
        </tr>
    </table>

    <h2 style="font-size: 1.1em; margin-top: 20px; margin-bottom: 12px;">Quality Metrics Tracked</h2>
    <ul style="margin-left: 25px;">
        <li>Client satisfaction scores (0-100%)</li>
        <li>Response time performance vs SLA</li>
        <li>Session completion rates</li>
        <li>Assessment quality scores</li>
    </ul>
</div>

<div style="page-break-after: always; padding: 20px;">
    <h1 style="font-size: 1.3em; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 15px;">5. Child Protection & Accessibility</h1>

    <h2 style="font-size: 1.1em; margin-top: 20px; margin-bottom: 12px;">Safeguarding Minors (Under 18)</h2>
    <ul style="margin-left: 25px;">
        <li>✓ Parental consent form required</li>
        <li>✓ Age verification at signup</li>
        <li>✓ Parent notification options for sensitive cases</li>
        <li>✓ Child protection workflows per MOH standards</li>
    </ul>

    <h2 style="font-size: 1.1em; margin-top: 20px; margin-bottom: 12px;">Language & Accessibility</h2>
    <ul style="margin-left: 25px;">
        <li>✓ Kiswahili support (manual + Google Translate)</li>
        <li>✓ Mobile-first PWA design</li>
        <li>✓ Works on any browser (no app store needed)</li>
        <li>✓ Low-bandwidth optimized for rural areas</li>
        <li>✓ Offline capability via service worker</li>
        <li>✓ WCAG 2.1 accessibility standards</li>
    </ul>

    <h2 style="font-size: 1.1em; margin-top: 20px; margin-bottom: 12px;">System Infrastructure</h2>
    <ul style="margin-left: 25px;">
        <li>✓ HTTPS encrypted communication</li>
        <li>✓ 99.8% uptime SLA</li>
        <li>✓ Distributed redundant architecture</li>
        <li>✓ Regular security audits</li>
        <li>✓ Full compliance documentation</li>
    </ul>
</div>

<div style="page-break-after: always; padding: 20px;">
    <h1 style="font-size: 1.3em; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 15px;">Compliance Summary</h1>

    <h2 style="font-size: 1.1em; margin-top: 20px; margin-bottom: 12px;">Compliance Checklist</h2>
    <table style="width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 0.9em;">
        <tr style="background: #f0f0f0;">
            <th style="border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold;">Area</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold;">Status</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold;">Implementation</th>
        </tr>
        <tr>
            <td style="border: 1px solid #000; padding: 8px;">Professional Licensing</td>
            <td style="border: 1px solid #000; padding: 8px;"><strong>✓ COMPLETE</strong></td>
            <td style="border: 1px solid #000; padding: 8px;">KMPDC/CPB verification + badges</td>
        </tr>
        <tr>
            <td style="border: 1px solid #000; padding: 8px;">Incident Management</td>
            <td style="border: 1px solid #000; padding: 8px;"><strong>✓ COMPLETE</strong></td>
            <td style="border: 1px solid #000; padding: 8px;">Complaint system + investigation</td>
        </tr>
        <tr>
            <td style="border: 1px solid #000; padding: 8px;">Data Protection</td>
            <td style="border: 1px solid #000; padding: 8px;"><strong>✓ COMPLETE</strong></td>
            <td style="border: 1px solid #000; padding: 8px;">AES-256 + retention policies</td>
        </tr>
        <tr>
            <td style="border: 1px solid #000; padding: 8px;">Supervision</td>
            <td style="border: 1px solid #000; padding: 8px;"><strong>✓ COMPLETE</strong></td>
            <td style="border: 1px solid #000; padding: 8px;">Dashboard + audit trail</td>
        </tr>
        <tr>
            <td style="border: 1px solid #000; padding: 8px;">Quality Assurance</td>
            <td style="border: 1px solid #000; padding: 8px;"><strong>✓ COMPLETE</strong></td>
            <td style="border: 1px solid #000; padding: 8px;">Daily metrics + KPIs</td>
        </tr>
        <tr>
            <td style="border: 1px solid #000; padding: 8px;">Child Safeguarding</td>
            <td style="border: 1px solid #000; padding: 8px;"><strong>✓ COMPLETE</strong></td>
            <td style="border: 1px solid #000; padding: 8px;">Parental consent + age verification</td>
        </tr>
        <tr>
            <td style="border: 1px solid #000; padding: 8px;">Accessibility</td>
            <td style="border: 1px solid #000; padding: 8px;"><strong>✓ COMPLETE</strong></td>
            <td style="border: 1px solid #000; padding: 8px;">Kiswahili + mobile + offline</td>
        </tr>
    </table>

    <h2 style="font-size: 1.1em; margin-top: 20px; margin-bottom: 12px;">Key Metrics</h2>
    <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
        <tr style="background: #f0f0f0;">
            <th style="border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold;">Metric</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold;">Target</th>
        </tr>
        <tr><td style="border: 1px solid #000; padding: 8px;">Professional Verifications</td><td style="border: 1px solid #000; padding: 8px;">100%</td></tr>
        <tr><td style="border: 1px solid #000; padding: 8px;">Data Encryption</td><td style="border: 1px solid #000; padding: 8px;">AES-256</td></tr>
        <tr><td style="border: 1px solid #000; padding: 8px;">Incident Response Time</td><td style="border: 1px solid #000; padding: 8px;">&lt;24 hours</td></tr>
        <tr><td style="border: 1px solid #000; padding: 8px;">System Uptime</td><td style="border: 1px solid #000; padding: 8px;">99.8%</td></tr>
        <tr><td style="border: 1px solid #000; padding: 8px;">Consent Compliance</td><td style="border: 1px solid #000; padding: 8px;">100%</td></tr>
        <tr><td style="border: 1px solid #000; padding: 8px;">Supervision Compliance</td><td style="border: 1px solid #000; padding: 8px;">100%</td></tr>
    </table>

    <p style="background: #f9f9f9; padding: 10px; border-left: 3px solid #000; margin-top: 15px;"><strong>MOH Audit Ready:</strong> Complete documentation, audit trails, regulatory transparency guaranteed.</p>
</div>

<div style="padding: 20px; text-align: center;">
    <h1 style="border: none; margin-bottom: 20px; font-size: 1.2em;">Contact & Next Steps</h1>
    <p style="margin-bottom: 15px;"><strong>Afya Yako Siri Yako</strong> is MOH-compliant and production-ready for immediate deployment.</p>

    <div style="background: #f9f9f9; padding: 15px; border-left: 3px solid #000; margin: 20px 0; text-align: center;">
        <p style="margin: 0; font-weight: bold;">For Regulatory Inquiries</p>
        <p style="margin: 8px 0 0 0; font-size: 1em;"><strong>compliance@afyayako.co.ke</strong></p>
    </div>

    <h2 style="border: none; margin-top: 20px; margin-bottom: 12px; font-size: 1.05em;">Available Services</h2>
    <ul style="text-align: left; display: inline-block; margin-left: 0;">
        <li>System audits and compliance documentation</li>
        <li>Live platform demonstrations</li>
        <li>Regulatory training for stakeholders</li>
        <li>Full source code & infrastructure review</li>
        <li>Dedicated compliance officer support</li>
    </ul>

    <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #ccc;">
        <p style="font-weight: bold; font-size: 0.95em;">AFYA YAKO SIRI YAKO</p>
        <p style="font-size: 0.9em; margin-top: 5px;">Your Health, Your Secret</p>
        <p style="font-size: 0.85em; color: #666; margin-top: 8px;">Ministry of Health Compliant • KMPDC Verified</p>
        <p style="font-size: 0.85em; color: #999; margin-top: 10px;">June 2026</p>
    </div>
</div>

</body>
</html>`;

const options = {
  margin: 10,
  filename: 'MOH_Compliance_Brief.pdf',
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2 },
  jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
};

html2pdf().set(options).from(htmlContent).save();
console.log('✅ PDF generated: MOH_Compliance_Brief.pdf');
