import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link to="/" className="text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Data & Privacy Policy</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-start gap-3 bg-teal-50 border border-teal-200 rounded-xl px-5 py-4 mb-8">
          <Shield size={20} className="text-teal-700 shrink-0 mt-0.5" />
          <p className="text-teal-800 text-sm">
            This policy is written in plain language. We are bound by the <strong>Kenya Data Protection Act 2019</strong> (DPA 2019), the Data Protection (General) Regulations 2021, and health-specific obligations under the Kenya Health Act 2017 and Mental Health Act. Where these laws conflict, the stricter standard applies.
          </p>
        </div>

        <p className="text-gray-500 text-xs mb-8">Last updated: June 2025</p>

        <div className="prose prose-gray prose-sm max-w-none">
          <h2>1. Who We Are</h2>
          <p>
            Afya Yako Siri Yako ("we," "us," "Data Controller") operates the Afya Yako Siri Yako mental health platform at mhapke.com. Our Data Protection Officer can be reached at <a href="mailto:privacy@mhapke.com" className="text-teal-700">privacy@mhapke.com</a>.
          </p>

          <h2>2. What Data We Collect</h2>
          <h3>Account data</h3>
          <ul>
            <li>Email address or username (pseudonym accepted)</li>
            <li>Password (stored as a one-way bcrypt hash — never readable)</li>
            <li>Display name and optional profile picture</li>
            <li>Role (patient, professional, corporate)</li>
          </ul>

          <h3>Clinical / health data (sensitive)</h3>
          <ul>
            <li>Assessment responses and scored results (PHQ-9, GAD-7, AUDIT, DAST-10, PGSI)</li>
            <li>Mood logs, craving logs, sobriety tracker data</li>
            <li>Session notes and SOAP records created by your therapist</li>
            <li>Session feedback and follow-up survey responses</li>
          </ul>

          <h3>Usage data</h3>
          <ul>
            <li>Pages visited, session durations, feature interactions (aggregated and anonymised for service improvement)</li>
            <li>Online presence signals (last seen, whether you are active in a session) — used only for real-time care coordination</li>
            <li>IP address and device type (for security logging only)</li>
          </ul>

          <h3>Payment data</h3>
          <ul>
            <li>M-Pesa transaction references and timestamps only — we never see or store your M-Pesa PIN or card number</li>
          </ul>

          <h2>3. Why We Process Your Data (Legal Basis)</h2>
          <table className="text-xs border border-gray-200 rounded w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-3 text-left">Purpose</th>
                <th className="py-2 px-3 text-left">Legal basis (DPA 2019)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ['Providing the platform and matching you with a therapist', 'Performance of a contract (s.30(b))'],
                ['Processing clinical assessments and session notes', 'Medical purpose / vital interest (s.30(f))'],
                ['Payment processing', 'Performance of a contract (s.30(b))'],
                ['Safety and crisis intervention', 'Vital interests / public interest (s.30(d)(e))'],
                ['Improving the platform (anonymised analytics)', 'Legitimate interests (s.30(f))'],
                ['Legal compliance', 'Legal obligation (s.30(c))'],
              ].map(([p, b]) => (
                <tr key={p}>
                  <td className="py-2 px-3 text-gray-700">{p}</td>
                  <td className="py-2 px-3 text-gray-500">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>4. Data Retention Periods</h2>
          <table className="text-xs border border-gray-200 rounded w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-3 text-left">Data type</th>
                <th className="py-2 px-3 text-left">Retention period</th>
                <th className="py-2 px-3 text-left">Authority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ['Clinical records (assessments, session notes)', '7 years from last interaction', 'Kenya Health Act 2017, s.72; KMPDC guidelines'],
                ['Mood & sobriety tracker data', '7 years or until deletion request', 'As above'],
                ['Payment transaction records', '7 years', 'Kenya Tax Procedures Act 2015'],
                ['Audit logs (login, security events)', '2 years', 'DPA 2019 security obligations'],
                ['Account profile data', '90 days after account closure', 'DPA 2019 s.25 (retention minimisation)'],
                ['Anonymised analytics', 'Indefinite (no personal identifiers)', 'N/A — anonymised data'],
                ['Crisis event records', '10 years', 'Professional liability + Health Act'],
                ['Support group messages', '2 years or upon group closure', 'DPA 2019 proportionality'],
              ].map(([d, r, a]) => (
                <tr key={d}>
                  <td className="py-2 px-3 text-gray-700">{d}</td>
                  <td className="py-2 px-3 text-gray-600">{r}</td>
                  <td className="py-2 px-3 text-gray-400 italic">{a}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-2">
            Retention periods reflect a balance between clinical best practice (mental health records should be available if a patient returns after years), legal obligations, and the DPA 2019's data minimisation principle. Clinical records are kept for 7 years because Kenya's professional standards align with international mental health practice guidelines and the Limitation of Actions Act 2012.
          </p>

          <h2>5. Who Sees Your Data</h2>
          <ul>
            <li><strong>Your therapist:</strong> Assessment results, session notes, mood trends you share with them</li>
            <li><strong>Platform admins:</strong> Account status, billing records, anonymised usage metrics — not clinical content</li>
            <li><strong>Payment processor:</strong> Transaction reference only — no clinical data</li>
            <li><strong>AI services (Anthropic Claude):</strong> Text you send in the AI chat, assessment scores for insight generation — processed under a data processing agreement with strict confidentiality terms and no training use</li>
            <li><strong>No one else</strong> — we do not sell data, share with employers, or provide to insurers</li>
          </ul>

          <h2>6. Your Rights Under DPA 2019</h2>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access</strong> your personal data (s.26) — request a copy within 21 days</li>
            <li><strong>Correction</strong> of inaccurate data (s.27)</li>
            <li><strong>Deletion</strong> ("right to be forgotten") where retention is not legally required (s.28)</li>
            <li><strong>Restriction</strong> of processing in certain circumstances (s.29)</li>
            <li><strong>Data portability</strong> — receive your data in a common machine-readable format (s.38)</li>
            <li><strong>Object</strong> to processing based on legitimate interests</li>
            <li><strong>Withdraw consent</strong> where consent was the legal basis</li>
          </ul>
          <p>
            To exercise any right, email <a href="mailto:privacy@mhapke.com" className="text-teal-700">privacy@mhapke.com</a>. We will respond within 21 days. If you believe we have mishandled your data, you may lodge a complaint with the <strong>Office of the Data Protection Commissioner</strong> (Kenya) at odpc.go.ke.
          </p>

          <h2>7. Security</h2>
          <ul>
            <li>All data in transit is encrypted with TLS 1.3</li>
            <li>Database data is encrypted at rest (AES-256)</li>
            <li>Passwords are stored as bcrypt hashes — never in plain text</li>
            <li>Access to clinical data is role-restricted and audit-logged</li>
            <li>We conduct annual security reviews of the platform</li>
          </ul>
          <p>
            In the event of a data breach affecting personal data, we will notify the Data Protection Commissioner within 72 hours and affected users without undue delay, as required by DPA 2019 s.43.
          </p>

          <h2>8. Data Responsibility for Physical Referrals</h2>
          <p>
            When you book an in-person (physical) session, certain data is shared with the professional to ensure safe, effective care:
          </p>
          <ul>
            <li><strong>Shared with in-person therapist:</strong> Your display name (or pseudonym), relevant assessment scores, mood/health history you've logged, and any session notes from previous sessions</li>
            <li><strong>Location data:</strong> If you enable geolocation, your county (not precise GPS) is used to match you with nearby professionals. The professional will not receive your exact coordinates unless you explicitly share them</li>
            <li><strong>Parent/guardian consent (minors):</strong> If you are under 18, your parent/guardian's phone number is stored solely for OTP verification and is not shared with the professional</li>
            <li><strong>Confidentiality agreement:</strong> All in-person professionals sign a confidentiality agreement affirming they will not share your identity or health information with anyone except in emergencies (where legally mandated by the Mental Health Act or Professional Ethics Code)</li>
            <li><strong>Session records:</strong> The professional may create session notes in your clinical record. These notes remain on the platform and are not transmitted outside our infrastructure</li>
            <li><strong>Emergencies:</strong> In a mental health emergency (imminent risk of harm to self/others), professionals may contact emergency services or next-of-kin without consent, as required by law</li>
          </ul>

          <h2>9. Cookies</h2>
          <p>
            We use only essential cookies: a session token (JWT stored in memory, not cookies) and a language preference (localStorage). We do not use advertising, tracking, or third-party analytics cookies. No consent banner is required because we do not use non-essential cookies.
          </p>

          <h2>10. Changes to This Policy</h2>
          <p>
            Material changes to this policy will be emailed to registered users at least 14 days before taking effect. The current version is always available at mhapke.com/privacy.
          </p>

          <div className="mt-8 flex gap-4 text-sm">
            <Link to="/terms" className="text-teal-700 hover:underline">Terms of Service</Link>
            <Link to="/refund-policy" className="text-teal-700 hover:underline">Refund Policy</Link>
            <Link to="/faq" className="text-teal-700 hover:underline">FAQ</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
