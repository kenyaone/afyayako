import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link to="/" className="text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Refund &amp; Cancellation Policy</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <p className="text-gray-500 text-xs mb-8">Last updated: June 2025</p>

        <div className="prose prose-gray prose-sm max-w-none">

          <h2>Summary</h2>
          <div className="not-prose overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-600">Scenario</th>
                  <th className="py-3 px-4 text-gray-600 text-center">Refund</th>
                  <th className="py-3 px-4 text-gray-600 text-center">How to claim</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ['You cancel ≥ 24 hours before session', '100% refund', 'Automatic'],
                  ['You cancel < 24 hours before session', '50% refund', 'Support email'],
                  ['You do not attend (no-show)', 'No refund', '—'],
                  ['Therapist cancels for any reason', '100% refund + KES 200 credit', 'Automatic within 24 hrs'],
                  ['Therapist does not attend (no-show)', '100% refund + KES 500 credit', 'Raise within 48 hrs'],
                  ['Technical issue prevents the session', '100% refund or reschedule', 'Support email within 24 hrs'],
                  ['Session quality complaint', 'Partial or full — reviewed case-by-case', 'Support email within 7 days'],
                  ['Subscription — unused months', 'Pro-rated refund', 'Support email'],
                ].map(([s, r, h]) => (
                  <tr key={s} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-700">{s}</td>
                    <td className="py-3 px-4 text-center font-medium text-teal-700">{r}</td>
                    <td className="py-3 px-4 text-center text-gray-500 text-xs">{h}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>1. Patient Cancellations</h2>
          <p>
            You may cancel a booked session at any time through the My Consultations page.
          </p>
          <ul>
            <li>
              <strong>More than 24 hours before the scheduled start time:</strong> Full refund to your M-Pesa or original payment method, processed within 3–5 business days. No questions asked.
            </li>
            <li>
              <strong>Between 2 and 24 hours before the session:</strong> 50% of the session fee is refunded. The remaining 50% compensates the professional for the reserved time slot.
            </li>
            <li>
              <strong>Less than 2 hours before the session or no-show:</strong> No refund is issued. The session fee is retained by the professional.
            </li>
          </ul>
          <p>
            Exceptional circumstances (bereavement, hospitalisation, natural disaster) will be considered on a case-by-case basis. Email billing@mhapke.com within 48 hours of the missed session with documentation.
          </p>

          <h2>2. Professional Cancellations</h2>
          <p>
            If a professional cancels your session for any reason, you receive:
          </p>
          <ul>
            <li>A full 100% refund of the session fee, processed automatically within 24 hours</li>
            <li>An additional KES 200 platform credit applied to your account</li>
            <li>Preferential access to rebook with the same or another professional at the next available slot</li>
          </ul>
          <p>
            If a professional does not join the session within 10 minutes of the scheduled start time, the session is automatically flagged as a professional no-show. You will receive a full refund plus KES 500 credit. Please report non-attendance via the session page or at support@mhapke.com within 48 hours.
          </p>

          <h2>3. Technical Issues</h2>
          <p>
            If a verified technical failure on our infrastructure (server outage, payment gateway failure, video platform error) prevents your session, you are entitled to:
          </p>
          <ul>
            <li>A full refund, or</li>
            <li>A free rescheduled session at your preference</li>
          </ul>
          <p>
            You must report the issue within 24 hours of the affected session to billing@mhapke.com with the session ID and a brief description. We will investigate and respond within 2 business days.
          </p>
          <p>
            Technical issues on your end (poor internet connection, incompatible device) do not qualify for a refund. We recommend testing your video setup before the session using the test call option in the session page.
          </p>

          <h2>4. Session Quality Complaints</h2>
          <p>
            If you believe a session was conducted unprofessionally, below the standard of care, or in violation of ethical guidelines, you may raise a quality complaint within 7 days of the session. Email support@mhapke.com with:
          </p>
          <ul>
            <li>Your session ID</li>
            <li>A description of the concern</li>
            <li>Any supporting information</li>
          </ul>
          <p>
            Quality complaints are reviewed by our clinical lead. Depending on the outcome: a partial refund (25–75%), full refund, or other remedial action may be offered. Severe complaints are also referred to the relevant professional regulatory body.
          </p>

          <h2>5. Subscriptions</h2>
          <p>
            Monthly or annual subscription plans may be cancelled at any time from your Profile page. You will retain access until the end of your paid billing period. We do not charge for the next cycle after cancellation.
          </p>
          <p>
            If you cancel within 7 days of subscribing and have not used any subscription benefits (booked or attended sessions, accessed premium content), you may request a full refund. After 7 days or after using any benefit, a pro-rated refund for unused whole months may be requested via billing@mhapke.com.
          </p>

          <h2>6. How Refunds Are Processed</h2>
          <p>
            All refunds are returned to the original payment method:
          </p>
          <ul>
            <li><strong>M-Pesa:</strong> Reversal to the originating number within 3–5 business days. You will receive an M-Pesa confirmation SMS.</li>
            <li><strong>Card:</strong> Credit to the original card within 5–10 business days depending on your bank.</li>
            <li><strong>Platform credit:</strong> Credited to your account instantly; visible on your Profile page. Credit can be used for any future booking.</li>
          </ul>

          <h2>7. Contact</h2>
          <p>
            For all refund queries:<br />
            Email: <a href="mailto:billing@mhapke.com" className="text-teal-700">billing@mhapke.com</a><br />
            Please include your registered email, session ID or transaction reference, and a brief description.
          </p>
          <p>Response time: 2 business days.</p>

          <div className="mt-8 flex gap-4 text-sm">
            <Link to="/terms" className="text-teal-700 hover:underline">Terms of Service</Link>
            <Link to="/privacy" className="text-teal-700 hover:underline">Privacy Policy</Link>
            <Link to="/faq" className="text-teal-700 hover:underline">FAQ</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
