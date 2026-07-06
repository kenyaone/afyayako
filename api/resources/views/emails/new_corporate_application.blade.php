<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>New EAP application — {{ $company->name }}</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f7fa;margin:0;padding:24px;color:#1f2937">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.05)">

    <div style="padding:24px 28px;background:linear-gradient(135deg,#f97316,#ec4899);color:#fff">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:2px;opacity:.85">Sales lead</div>
        <div style="font-size:22px;font-weight:800;margin-top:4px">{{ $company->name }}</div>
        <div style="font-size:13px;opacity:.9;margin-top:4px">
            {{ $tierName }} tier · {{ $company->employee_count }} employees · {{ $company->industry ?: 'industry unspecified' }}
        </div>
    </div>

    <div style="padding:24px 28px">
        <h2 style="font-size:14px;margin:0 0 12px;color:#0f766e;text-transform:uppercase;letter-spacing:1px">Contact</h2>
        <table style="width:100%;font-size:14px;border-collapse:collapse">
            <tr><td style="padding:6px 0;color:#6b7280;width:35%">Name</td><td style="padding:6px 0;font-weight:600">{{ $company->contact_name }}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280">Email</td><td style="padding:6px 0"><a href="mailto:{{ $company->contact_email }}" style="color:#0d9488">{{ $company->contact_email }}</a></td></tr>
            <tr><td style="padding:6px 0;color:#6b7280">Phone</td><td style="padding:6px 0"><a href="tel:{{ $company->contact_phone }}" style="color:#0d9488">{{ $company->contact_phone }}</a></td></tr>
            @if ($company->kra_pin)
            <tr><td style="padding:6px 0;color:#6b7280">KRA PIN</td><td style="padding:6px 0">{{ $company->kra_pin }}</td></tr>
            @endif
        </table>

        <h2 style="font-size:14px;margin:20px 0 12px;color:#0f766e;text-transform:uppercase;letter-spacing:1px">Preferred payment</h2>
        <div style="background:#f0fdf9;border:1px solid #a7f3d0;border-radius:8px;padding:12px 14px;font-size:14px">
            @php
                $labels = [
                    'invoice_net30' => 'Invoice — Net 30 days',
                    'bank_transfer' => 'Bank transfer (RTGS/EFT)',
                    'cheque'        => 'Cheque',
                ];
            @endphp
            <strong>{{ $labels[$paymentMethod] ?? ($paymentMethod ?: 'Not specified') }}</strong>
            @if ($billingNotes)
                <div style="margin-top:8px;color:#374151;font-size:13px;line-height:1.5"><em>Billing notes:</em> {{ $billingNotes }}</div>
            @endif
        </div>

        <h2 style="font-size:14px;margin:20px 0 12px;color:#0f766e;text-transform:uppercase;letter-spacing:1px">Deal size</h2>
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 14px;font-size:14px;color:#78350f">
            <b>Employees:</b> {{ $company->employee_count }} &nbsp;·&nbsp;
            <b>Session allocation:</b> {{ $subscription->sessions_total }} / period
            <br>
            <b>Application submitted at:</b> {{ $subscription->created_at->format('D d M Y · H:i') }}
        </div>

        <div style="text-align:center;margin:24px 0 0">
            <a href="{{ env('FRONTEND_URL','https://afyayako.co.ke') }}/admin/eap-applications"
               style="background:#0d9488;color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;display:inline-block">
                Approve / activate in admin →
            </a>
        </div>

        <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;text-align:center">
            SLA: contact this buyer within <strong>1 business day</strong>.
        </p>
    </div>

    <div style="background:#f9fafb;padding:14px 28px;text-align:center;font-size:11px;color:#6b7280;border-top:1px solid #e5e7eb">
        Afya Yako Siri Yako · Sales notification
    </div>
</div>
</body></html>
