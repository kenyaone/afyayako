<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>You're in — Afya Yako EAP</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f7fa; margin: 0; padding: 24px; color: #1f2937;">
    <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,.05);">

        <div style="background: linear-gradient(135deg, #0d9488, #0f766e); padding: 32px 28px; text-align: center;">
            <div style="color: white; font-size: 24px; font-weight: 700; margin-bottom: 6px;">🌿 Afya Yako Siri Yako</div>
            <div style="color: rgba(255,255,255,.85); font-size: 14px;">Your Health, Your Secret</div>
        </div>

        <div style="padding: 32px 28px;">
            <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 12px; color: #0f766e;">Welcome, {{ $recipientName }}</h1>
            <p style="margin: 0 0 20px; line-height: 1.6; color: #374151;">
                You've joined <strong>{{ $companyName }}</strong>'s Employee Assistance Programme.
                Everything from here on is <strong>completely confidential</strong> — your employer
                cannot see who you are, what you discuss with a therapist, or when you use the service.
            </p>

            <div style="background: #f0fdf9; border: 2px dashed #14b8a6; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #0f766e; font-weight: 600;">Your anonymous code</div>
                <div style="font-size: 32px; font-weight: 800; color: #0f766e; margin-top: 6px; letter-spacing: 2px; font-family: monospace;">
                    {{ $employee->employee_code }}
                </div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 8px;">
                    Save this. It's how the system identifies you internally, but no one at
                    {{ $companyName }} will ever see it linked to your name.
                </div>
            </div>

            <h2 style="font-size: 16px; font-weight: 700; margin: 28px 0 10px; color: #111827;">Next steps</h2>
            <ol style="padding-left: 20px; margin: 0; line-height: 1.7; color: #374151;">
                <li>Browse CPB-licensed therapists at <a href="{{ config('app.frontend_url', 'https://afyayako.co.ke') }}/professionals" style="color: #0d9488;">Find a Therapist</a>.</li>
                <li>Book a session — 6 face-to-face sessions per year are fully covered by {{ $companyName }}.</li>
                <li>Chat 24/7 with the crisis helpline if you're not ready to book yet.</li>
            </ol>

            <div style="text-align: center; margin: 28px 0 0;">
                <a href="{{ config('app.frontend_url', 'https://afyayako.co.ke') }}/professionals"
                   style="background: #0d9488; color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; display: inline-block;">
                    Find a therapist →
                </a>
            </div>

            <div style="background: #fef3c7; border-radius: 8px; padding: 14px 16px; margin: 28px 0 0; font-size: 13px; color: #78350f; line-height: 1.5;">
                <strong>Privacy reminder:</strong> Do not forward this email or share your code with anyone at
                {{ $companyName }}. This is your private access to the service.
            </div>
        </div>

        <div style="background: #f9fafb; padding: 18px 28px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
            Sent because you signed up to your employer's EAP at Afya Yako Siri Yako.<br>
            Reply to this email to reach support · Nairobi, Kenya
        </div>
    </div>
</body>
</html>
