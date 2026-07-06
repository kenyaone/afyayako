<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Your HR account is ready — Afya Yako</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f7fa;margin:0;padding:24px;color:#1f2937">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.05)">
    <div style="padding:28px;background:linear-gradient(135deg,#0d9488,#7c3aed);color:#fff;text-align:center">
        <div style="font-size:22px;font-weight:800">You're all set</div>
        <div style="font-size:13px;opacity:.9;margin-top:4px">HR access for {{ $company->name }}</div>
    </div>
    <div style="padding:28px">
        <p style="margin:0 0 16px;color:#374151;line-height:1.6">
            Hi {{ $user->display_name }}, your EAP is active and your HR dashboard is ready.
            Use the credentials below to log in.
        </p>
        <div style="background:#f0fdf9;border:2px dashed #14b8a6;border-radius:10px;padding:18px 20px;margin:16px 0">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#0f766e;font-weight:700">Username</div>
            <div style="font-family:monospace;font-size:18px;font-weight:700;color:#0f766e;margin-top:4px">{{ $user->username }}</div>
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#0f766e;font-weight:700;margin-top:14px">Temporary password</div>
            <div style="font-family:monospace;font-size:18px;font-weight:700;color:#0f766e;margin-top:4px">{{ $tempPassword }}</div>
        </div>
        <div style="text-align:center;margin:24px 0 8px">
            <a href="{{ $loginUrl }}" style="background:#0d9488;color:#fff;text-decoration:none;padding:14px 34px;border-radius:10px;font-weight:700;display:inline-block">
                Log in to HR dashboard →
            </a>
        </div>
        <div style="background:#fef3c7;border-radius:8px;padding:12px 14px;margin:22px 0 0;font-size:12px;color:#78350f;line-height:1.5">
            <strong>Change your password on first login.</strong> Anyone with this email holds admin access to your programme.
        </div>
        <h2 style="font-size:14px;margin:24px 0 8px;color:#0f766e;text-transform:uppercase;letter-spacing:1px">What to do next</h2>
        <ol style="padding-left:20px;margin:0;line-height:1.7;color:#374151;font-size:14px">
            <li>Log in and click <b>Invite Employees</b> to generate a reusable invite link</li>
            <li>Post the link in Slack / intranet / all-staff BCC email</li>
            <li>Watch the anonymised uptake in your <b>EAP Overview</b> dashboard</li>
        </ol>
    </div>
    <div style="background:#f9fafb;padding:14px 28px;text-align:center;font-size:11px;color:#6b7280;border-top:1px solid #e5e7eb">
        Reply to this email for support · Afya Yako Siri Yako · Nairobi
    </div>
</div>
</body></html>
