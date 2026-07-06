<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>How was your session?</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f7fa; margin: 0; padding: 24px; color: #1f2937;">
    <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,.05);">

        <div style="padding: 28px 28px 20px; background: linear-gradient(135deg, #0d9488, #0f766e); color: white;">
            <div style="font-size: 20px; font-weight: 700;">How was your session with {{ $therapistName }}?</div>
            <div style="font-size: 13px; opacity: .9; margin-top: 4px;">{{ $sessionDateLabel }}</div>
        </div>

        <div style="padding: 26px 28px;">
            <p style="margin: 0 0 16px; color: #374151; line-height: 1.6;">
                Hi {{ $recipientName }},
            </p>
            <p style="margin: 0 0 16px; color: #374151; line-height: 1.6;">
                Three quick questions — about 30 seconds. Your answers are <b>completely anonymous</b>.
                Your employer never sees who filled this in, only aggregate quality signals across all sessions.
            </p>

            <div style="background: #f0fdf9; border-left: 3px solid #0d9488; padding: 14px 16px; margin: 20px 0; font-size: 13px; color: #0f766e;">
                <b>What we'll ask:</b> did the therapist show up on time? · how helpful was it (1–5)? · would you book again?
            </div>

            <div style="text-align: center; margin: 26px 0 0;">
                <a href="{{ $feedbackUrl }}"
                   style="background: #0d9488; color: white; text-decoration: none; padding: 14px 34px; border-radius: 10px; font-weight: 700; display: inline-block;">
                    Rate my session →
                </a>
                <div style="font-size: 11px; color: #6b7280; margin-top: 10px;">Anonymous · 30 seconds</div>
            </div>

            <p style="margin: 26px 0 0; font-size: 12px; color: #9ca3af; line-height: 1.6; text-align: center;">
                If the button doesn't work, copy this link:<br>
                <a href="{{ $feedbackUrl }}" style="color: #0d9488; word-break: break-all;">{{ $feedbackUrl }}</a>
            </p>
        </div>

        <div style="background: #f9fafb; padding: 14px 28px; text-align: center; font-size: 11px; color: #6b7280; border-top: 1px solid #e5e7eb;">
            Afya Yako Siri Yako · Nairobi, Kenya
        </div>
    </div>
</body>
</html>
