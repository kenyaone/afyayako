import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link to="/" className="text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Terms of Service</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 prose prose-gray prose-sm max-w-none">
        <p className="text-gray-500 text-xs mb-8">Last updated: June 2025 | Governed by the laws of the Republic of Kenya</p>

        <h2>1. About This Platform</h2>
        <p>
          Afya Yako Siri Yako ("the Platform," "we," "us") is a digital mental health and addiction recovery service accessible at mhapke.com and related applications. By creating an account or using any feature of the Platform, you agree to these Terms of Service ("Terms") in full.
        </p>
        <p>
          If you do not agree to these Terms, you must not use the Platform.
        </p>

        <h2>2. Not a Substitute for Emergency Services</h2>
        <p>
          This Platform is <strong>not an emergency service</strong>. If you or someone else is in immediate danger, call <strong>999</strong> or go to the nearest hospital emergency department. For mental health crisis support, contact Befrienders Kenya (0800 723 253, free 24/7), NACADA (1192), or Kenya Red Cross (1199).
        </p>

        <h2>3. Eligibility</h2>
        <ul>
          <li>You must be at least 18 years of age to create an account.</li>
          <li>Minors (13–17) may use the Platform only with documented parental or guardian consent provided to us at consent@mhapke.com.</li>
          <li>You must be located in Kenya or accessing services intended for Kenyan residents.</li>
          <li>You confirm that you are not prohibited from receiving mental health services by any applicable law.</li>
        </ul>

        <h2>4. Accounts and Security</h2>
        <p>
          You are responsible for maintaining the confidentiality of your login credentials. You must notify us immediately at security@mhapke.com if you suspect unauthorised access to your account. We will never ask for your password by email, phone, or message.
        </p>
        <p>
          You may use a pseudonym. You are not required to provide your real name unless a licensed professional providing clinical care requires it for statutory clinical records.
        </p>

        <h2>5. Nature of Services</h2>
        <p>
          The Platform connects users with licensed mental health professionals (psychologists, counsellors, therapists) who are independently contracted professionals, not employees of Afya Yako Siri Yako. The therapeutic relationship is between you and the professional; Afya Yako Siri Yako facilitates the connection and the technology infrastructure.
        </p>
        <p>
          AI-generated content (assessment insights, match explanations, progress summaries) is for informational purposes only and does not constitute a clinical diagnosis or treatment recommendation. Only a licensed professional can diagnose or treat a mental health condition.
        </p>

        <h2>6. Professional Standards</h2>
        <p>
          All professionals on this Platform must hold current, valid registration with the Kenya Medical Practitioners and Dentists Council (KMPDC) or the Kenya Counsellors and Psychologists Association (KCPA). They are bound by their respective professional codes of conduct, including confidentiality obligations under the Mental Health Act (Cap. 248), the Health Act 2017, and the KMPDC Code of Professional Conduct.
        </p>

        <h2>7. Confidentiality and Mandatory Disclosure</h2>
        <p>
          Sessions are confidential with the following legal exceptions where professionals are <em>required</em> to disclose:
        </p>
        <ul>
          <li>Imminent risk of serious harm to you or another person</li>
          <li>Abuse of a child or vulnerable adult</li>
          <li>A valid court order</li>
          <li>Reporting to public health authorities as required by law</li>
        </ul>
        <p>Wherever possible, professionals will discuss disclosure with you before acting.</p>

        <h2>8. Payments and Billing</h2>
        <p>
          Session fees are published on each professional's profile. Payment is collected at the time of booking. All charges are in Kenya Shillings (KES). Disputed charges must be raised within 14 days of the transaction by emailing billing@mhapke.com with your transaction reference.
        </p>
        <p>
          See our <Link to="/refund-policy" className="text-teal-700 underline">Refund Policy</Link> for cancellation and refund terms.
        </p>

        <h2>9. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Platform to harass, threaten, or abuse any professional or user</li>
          <li>Impersonate another person or falsely claim professional qualifications</li>
          <li>Attempt to circumvent the Platform to engage a professional outside it to avoid fees</li>
          <li>Record sessions without the explicit consent of all parties</li>
          <li>Share another user's personal information without their consent</li>
          <li>Use automated scripts, bots, or scrapers on any part of the Platform</li>
          <li>Post commercial solicitations, spam, or harmful content in group chat or messages</li>
        </ul>
        <p>
          Violation of these terms may result in immediate account suspension and, where applicable, referral to relevant authorities.
        </p>

        <h2>10. Intellectual Property</h2>
        <p>
          The Platform, its software, content, design, and clinical tools are the intellectual property of Afya Yako Siri Yako. You may not copy, reproduce, distribute, or create derivative works without written permission. Content you create (mood logs, journal entries) remains yours; you grant us a limited licence to store and process it to provide the service.
        </p>

        <h2>11. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by Kenyan law, Afya Yako Siri Yako is not liable for: (a) the clinical decisions of independently contracted professionals; (b) outcomes of therapy or recovery programmes; (c) technical interruptions beyond our reasonable control; (d) indirect, consequential, or punitive damages.
        </p>
        <p>
          Our total aggregate liability for any claim arising from your use of the Platform shall not exceed the total amount you paid to us in the 3 months preceding the claim.
        </p>

        <h2>12. Governing Law and Disputes</h2>
        <p>
          These Terms are governed by and construed in accordance with the laws of the Republic of Kenya. Any dispute shall first be subject to good-faith mediation. If unresolved within 30 days, disputes shall be submitted to the exclusive jurisdiction of the courts of Nairobi, Kenya.
        </p>

        <h2>13. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. Material changes will be notified to your registered email at least 14 days before they take effect. Continued use of the Platform after the effective date constitutes acceptance of the revised Terms.
        </p>

        <h2>14. Contact</h2>
        <p>
          Afya Yako Siri Yako, Nairobi, Kenya<br />
          Email: <a href="mailto:legal@mhapke.com" className="text-teal-700">legal@mhapke.com</a><br />
          General support: <a href="mailto:support@mhapke.com" className="text-teal-700">support@mhapke.com</a>
        </p>

        <div className="mt-8 flex gap-4 text-sm">
          <Link to="/privacy" className="text-teal-700 hover:underline">Data & Privacy Policy</Link>
          <Link to="/refund-policy" className="text-teal-700 hover:underline">Refund Policy</Link>
          <Link to="/faq" className="text-teal-700 hover:underline">FAQ</Link>
        </div>
      </div>
    </div>
  )
}
