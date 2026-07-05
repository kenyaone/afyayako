import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, ArrowLeft, Phone } from 'lucide-react'

const FAQS = [
  {
    q: 'Is my identity kept private?',
    a: `Yes. Afya Yako Siri Yako (Your Health Is Your Secret) is the platform's founding principle. You may sign up with a username only. No national ID, real name, or employer details are ever required. All consultation data is encrypted in transit (TLS 1.3) and at rest (AES-256). Your data is never sold or shared with third parties, including employers, insurers, or government agencies, without a court order.`,
  },
  {
    q: 'Are the therapists on this platform licensed?',
    a: `All mental health professionals on this platform are verified against the Kenya Medical Practitioners and Dentists Council (KMPDC) register before their profiles are activated. Their license numbers are displayed on their profile pages. We re-verify credentials every 12 months. If you have concerns about a specific professional, contact us through the support page.`,
  },
  {
    q: 'Can SHA or my insurance company pay for my sessions?',
    a: `Yes — we support insurance and SHA (Social Health Authority) billing. When booking a session, select "Insurance / SHA" as your payment method. You will be asked to enter your SHA member number or insurance card details. We then generate a claim reference that can be submitted to your insurer. Please note: insurance coverage for mental health varies by plan. SHA's Primary Health Care benefit currently covers outpatient mental health consultations at registered facilities. We are in the process of formal SHA provider registration. In the meantime, we can issue a clinical receipt for you to claim reimbursement from your insurer directly. For companies on our EAP programme, sessions are billed directly to the employer.`,
  },
  {
    q: 'How do video sessions work? Do I need to create any accounts?',
    a: `Sessions use Jitsi Meet — an open-source, encrypted video platform. You do not need a Jitsi account. When it is time for your session, click "Join Session" on your consultations page. The same link works for both you and your therapist. No downloads are required on desktop; on mobile, the Jitsi Meet app may be requested. Sessions are not recorded by default unless both parties consent.`,
  },
  {
    q: 'What is the cancellation policy?',
    a: `You may cancel free of charge up to 24 hours before the scheduled session. Cancellations within 24 hours incur a 50% charge. No-shows are charged in full. If your therapist cancels for any reason, you receive a full credit to your account. See our full Refund Policy for details.`,
  },
  {
    q: 'What happens if I am in crisis during or after a session?',
    a: `Your therapist is trained to provide crisis first-response. If you are at immediate risk, they will escalate to emergency services on your behalf. At any time you can also contact: Befrienders Kenya 0800 723 253 (free, 24/7), NACADA helpline 1192, or Kenya Red Cross 1199. The platform also shows emergency contacts prominently at all times. Do not wait — reach out immediately.`,
  },
  {
    q: 'Which payment methods are accepted?',
    a: `We accept: M-Pesa STK Push (enter your number, confirm PIN on phone), insurance / SHA billing (enter your member number — we generate a claim reference), and corporate/EAP invoicing for companies. Payments are processed securely. We never store your M-Pesa PIN or card details.`,
  },
  {
    q: 'How long is my data kept?',
    a: `Clinical records (assessment results, session notes, mood logs) are retained for 7 years in compliance with the Kenya Health Act and professional standards guidelines. Account data is deleted 90 days after you close your account, except where retention is legally required. You may request a copy of your data or deletion at any time — see our full Data & Privacy Policy for details.`,
  },
  {
    q: 'Where do I find peer support groups?',
    a: `Peer support groups are accessible from the sidebar once you are logged in — look for "Support Groups" in the navigation menu. There are separate groups for depression, anxiety, alcohol recovery, substance use, and gambling. Groups are moderated by licensed professionals. Your display name is shown — not your real name. What is shared in the group stays confidential to the group.`,
  },
  {
    q: 'Is peer group chat anonymous?',
    a: `Yes. In peer support groups, your display name is shown — not your real name or profile picture unless you have chosen to set one. Group facilitators are licensed professionals. What is shared in the group is confidential to the group; facilitators may break confidentiality only if there is a serious risk of harm to you or others.`,
  },
  {
    q: 'Can I use the platform in Kiswahili?',
    a: `Yes. Use the language toggle (EN / SW) in the navigation bar to switch the interface to Kiswahili. Several therapists also conduct sessions in Kiswahili — filter by language on the Find Therapist page.`,
  },
  {
    q: 'What is included in the free assessment?',
    a: `The free assessment includes clinically validated screening tools (PHQ-9 for depression, GAD-7 for anxiety, AUDIT for alcohol, DAST-10 for drugs, and PGSI for gambling). Completing an assessment takes 5–10 minutes. Results are confidential, shown only to you and the therapist you choose to book with. Taking an assessment does not commit you to any purchase.`,
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link to="/" className="text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-3">
        {FAQS.map((item, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="font-semibold text-gray-900 pr-4">{item.q}</span>
              {open === i ? (
                <ChevronUp size={18} className="text-teal-600 shrink-0" />
              ) : (
                <ChevronDown size={18} className="text-gray-400 shrink-0" />
              )}
            </button>
            {open === i && (
              <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                {item.a}
              </div>
            )}
          </div>
        ))}

        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-800 flex gap-3 items-start mt-6">
          <Phone size={16} className="shrink-0 mt-0.5 text-red-600" />
          <div>
            <strong>Crisis lines (free, 24/7):</strong>{' '}
            Befrienders Kenya <a href="tel:0800723253" className="underline font-bold">0800 723 253</a>{' | '}
            NACADA <a href="tel:1192" className="underline font-bold">1192</a>{' | '}
            Kenya Red Cross <a href="tel:1199" className="underline font-bold">1199</a>
          </div>
        </div>

        <p className="text-center text-gray-400 text-xs pt-4">
          Question not answered?{' '}
          <a href="mailto:support@mhapke.com" className="text-teal-600 hover:underline">
            Email support@mhapke.com
          </a>
        </p>
      </div>
    </div>
  )
}
