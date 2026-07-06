<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Monthly EAP summary — {{ $company->name }}</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f7fa; margin: 0; padding: 24px; color: #1f2937;">
    <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,.05);">

        <div style="background: linear-gradient(135deg, #0d9488, #0f766e); padding: 28px; text-align: center; color: white;">
            <div style="font-size: 22px; font-weight: 700;">Monthly EAP summary</div>
            <div style="font-size: 14px; opacity: .9; margin-top: 4px;">{{ $company->name }} · {{ $monthLabel }}</div>
        </div>

        <div style="padding: 28px;">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                @php
                    $stats = [
                        ['label' => 'Employees covered', 'value' => $totalEmployees],
                        ['label' => 'Used the EAP (rounded)', 'value' => $activeEmployees],
                        ['label' => 'Sessions delivered',  'value' => $sessionsDelivered],
                        ['label' => 'Total spend',          'value' => 'KSh '.number_format($totalSpendKes)],
                    ];
                @endphp
                @foreach ($stats as $s)
                    <div style="background: #f0fdf9; border-radius: 10px; padding: 16px;">
                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #0f766e; font-weight: 600;">{{ $s['label'] }}</div>
                        <div style="font-size: 22px; font-weight: 700; color: #0f766e; margin-top: 4px;">{{ $s['value'] }}</div>
                    </div>
                @endforeach
            </div>

            <div style="margin-top: 24px; text-align: center;">
                <a href="{{ env('FRONTEND_URL','https://afyayako.co.ke') }}/eap-verify"
                   style="background: #0d9488; color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; display: inline-block;">
                    Full anonymized report →
                </a>
            </div>

            <div style="background: #f9fafb; border-left: 3px solid #6b7280; padding: 14px 16px; margin: 28px 0 0; font-size: 12px; color: #4b5563; line-height: 1.5;">
                <strong>Privacy:</strong> Employee counts are rounded to the nearest 5 to prevent identity inference on small teams.
                Session content and employee identities are never included in this report.
            </div>
        </div>
    </div>
</body>
</html>
