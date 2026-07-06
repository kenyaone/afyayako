<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>EAP invoice — {{ $company->name }}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f7fa; margin: 0; padding: 24px; color: #1f2937;">
    <div style="max-width: 620px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,.05);">

        <div style="padding: 28px 32px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <div style="font-size: 22px; font-weight: 700; color: #0f766e;">Afya Yako Siri Yako</div>
                <div style="font-size: 12px; color: #6b7280;">Employee Assistance Programme</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 11px; text-transform: uppercase; color: #6b7280; letter-spacing: 1px;">Invoice</div>
                <div style="font-family: monospace; font-size: 14px; font-weight: 600;">{{ $invoiceNumber }}</div>
            </div>
        </div>

        <div style="padding: 28px 32px;">
            <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 20px;">Invoice · {{ $company->name }}</h1>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
                <tr>
                    <td style="padding: 8px 0; color: #6b7280; width: 40%;">Billed to</td>
                    <td style="padding: 8px 0; color: #111827; font-weight: 500;">{{ $company->contact_name }} · {{ $company->name }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Contact</td>
                    <td style="padding: 8px 0; color: #111827;">{{ $company->contact_email }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Period</td>
                    <td style="padding: 8px 0; color: #111827;">{{ $periodStart }} → {{ $periodEnd }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Invoice date</td>
                    <td style="padding: 8px 0; color: #111827;">{{ now()->format('d M Y') }}</td>
                </tr>
            </table>

            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
                <thead>
                    <tr style="background: #f9fafb;">
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Item</th>
                        <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Qty</th>
                        <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Unit</th>
                        <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 14px 12px; border-bottom: 1px solid #f1f5f9;">
                            <div style="font-weight: 600;">{{ $tierName }} EAP tier</div>
                            <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">24/7 tele-therapy · 6 in-person sessions/employee/year · CPB-licensed therapists</div>
                        </td>
                        <td style="padding: 14px 12px; border-bottom: 1px solid #f1f5f9; text-align: right;">{{ $employeesCovered }}</td>
                        <td style="padding: 14px 12px; border-bottom: 1px solid #f1f5f9; text-align: right;">
                            @if ($subscription->eapTier && $subscription->eapTier->price_kes_annual)
                                KSh {{ number_format($subscription->eapTier->price_kes_annual / 12) }}/mo
                            @else
                                Custom
                            @endif
                        </td>
                        <td style="padding: 14px 12px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 600;">
                            KSh {{ number_format($totalKes) }}
                        </td>
                    </tr>
                    <tr>
                        <td colspan="3" style="padding: 14px 12px; text-align: right; font-weight: 600; color: #6b7280;">Total due</td>
                        <td style="padding: 14px 12px; text-align: right; font-weight: 700; font-size: 18px; color: #0f766e;">
                            KSh {{ number_format($totalKes) }}
                        </td>
                    </tr>
                </tbody>
            </table>

            <div style="background: #f0fdf9; border-left: 3px solid #0d9488; padding: 14px 16px; margin: 24px 0; font-size: 13px; color: #0f766e; line-height: 1.5;">
                <strong>Employee anonymity guaranteed.</strong> This invoice contains no employee identities.
                The count above is aggregate only — the platform does not disclose which of your employees have used the service.
            </div>

            <p style="margin: 20px 0 0; font-size: 13px; color: #6b7280; line-height: 1.6;">
                Reply to this email if the invoice needs adjustment or a formal PDF is required.
                Payment details will follow separately.
            </p>
        </div>

        <div style="background: #f9fafb; padding: 18px 32px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
            Afya Yako Siri Yako · Nairobi, Kenya · afyayako.co.ke
        </div>
    </div>
</body>
</html>
