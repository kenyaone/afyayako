<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Free confidential therapy — from {{ $company->name }}</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f7fa; margin: 0; padding: 24px; color: #1f2937;">
    <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,.05);">

        <div style="background: linear-gradient(135deg, #0d9488, #0f766e); padding: 32px 28px; color: white;">
            <div style="font-size: 22px; font-weight: 700;">🌿 A confidential benefit from {{ $company->name }}</div>
            <div style="font-size: 14px; opacity: .9; margin-top: 4px;">Free access to CPB-licensed therapists</div>
        </div>

        <div style="padding: 28px;">
            @if ($customMessage)
                <div style="background: #f0fdf9; border-left: 3px solid #0d9488; padding: 14px 16px; margin-bottom: 20px; font-size: 14px; line-height: 1.6;">
                    {!! nl2br(e($customMessage)) !!}
                </div>
            @endif

            <p style="margin: 0 0 16px; line-height: 1.6; color: #374151;">
                {{ $company->name }} has partnered with <strong>Afya Yako Siri Yako</strong> to give every
                member of the team confidential mental-health support — completely free to you, and completely
                private.
            </p>

            <h2 style="font-size: 15px; font-weight: 700; margin: 24px 0 8px; color: #111827;">What you get</h2>
            <ul style="padding-left: 20px; margin: 0 0 20px; line-height: 1.7; color: #374151;">
                <li>Unlimited 24/7 tele-therapy with licensed Kenyan therapists</li>
                <li>6 in-person sessions per year (fully covered)</li>
                <li>Anonymous crisis helpline</li>
                <li>Support for depression, anxiety, burnout, addiction, and more</li>
            </ul>

            <div style="background: #fef3c7; border-radius: 8px; padding: 14px 16px; margin-bottom: 22px; font-size: 13px; color: #78350f; line-height: 1.6;">
                <strong>Nobody at {{ $company->name }} will ever know if or when you use this.</strong>
                Not HR, not your manager, not your team. You sign up with any username you choose.
                Your therapy sessions are between you and your therapist only.
            </div>

            <div style="text-align: center; margin: 24px 0;">
                <a href="{{ $inviteUrl }}"
                   style="background: #0d9488; color: white; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: 600; font-size: 16px; display: inline-block;">
                    Sign up anonymously →
                </a>
                <div style="font-size: 12px; color: #6b7280; margin-top: 12px;">Takes 60 seconds. No corporate email required.</div>
            </div>

            <p style="margin: 24px 0 0; font-size: 12px; color: #9ca3af; line-height: 1.6; text-align: center;">
                You received this because {{ $company->name }} added your email to the EAP roll-out.
                Your employer does not receive any notification when you click, sign up, or use the service.
            </p>
        </div>
    </div>
</body>
</html>
