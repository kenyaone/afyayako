<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>New EAP session booked — Afya Yako</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f7fa;margin:0;padding:24px;color:#1f2937">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.05)">
    <div style="padding:24px;background:linear-gradient(135deg,#0d9488,#7c3aed);color:#fff;text-align:center">
        <div style="font-size:20px;font-weight:800">New EAP session booked</div>
        <div style="font-size:13px;opacity:.9;margin-top:4px">{{ $company->name }}</div>
    </div>
    <div style="padding:26px">
        <p style="margin:0 0 18px;color:#374151;line-height:1.6">
            An employee at your organisation has booked a session under your Employee Assistance Programme.
            No identifying details are shared — you see only the anonymous employee code and the shape of the session.
        </p>

        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px 18px;margin:0 0 18px">
            <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse">
                <tr>
                    <td style="padding:6px 0;color:#6b7280;width:40%">Employee code</td>
                    <td style="padding:6px 0;font-family:monospace;font-weight:700;color:#0f766e">{{ $employeeCode }}</td>
                </tr>
                <tr>
                    <td style="padding:6px 0;color:#6b7280">Session date</td>
                    <td style="padding:6px 0">{{ optional($consultation->scheduled_at)->format('D, d M Y · H:i') }}</td>
                </tr>
                <tr>
                    <td style="padding:6px 0;color:#6b7280">Duration</td>
                    <td style="padding:6px 0">{{ $consultation->duration_minutes }} minutes</td>
                </tr>
                <tr>
                    <td style="padding:6px 0;color:#6b7280">Mode</td>
                    <td style="padding:6px 0;text-transform:capitalize">{{ $consultation->mode }}</td>
                </tr>
            </table>
        </div>

        <div style="background:#f0fdf9;border:2px dashed #14b8a6;border-radius:10px;padding:16px 18px;margin:0 0 18px">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#0f766e;font-weight:700">This employee's usage this month</div>
            <div style="font-size:22px;font-weight:800;color:#0f766e;margin-top:6px">
                {{ $sessionsUsedThisMonth }} of {{ $sessionsAllowedPerEmployee }} sessions
            </div>
        </div>

        <div style="background:#fef3c7;border-radius:8px;padding:12px 14px;margin:0;font-size:12px;color:#78350f;line-height:1.5">
            <strong>Anonymity by design.</strong> You will never receive an employee's name, contact details, therapist assignment, or clinical information from Afya Yako — that's the whole promise of the EAP.
        </div>
    </div>
    <div style="background:#f9fafb;padding:14px 28px;text-align:center;font-size:11px;color:#6b7280;border-top:1px solid #e5e7eb">
        Reply to this email for support · Afya Yako Siri Yako · Nairobi
    </div>
</div>
</body></html>
