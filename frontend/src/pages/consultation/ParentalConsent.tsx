import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Phone, Send } from 'lucide-react'
import api from '../../api/axios'

// Normalise a Kenyan phone number to the 2547######## / 2541######## form the API expects.
function normalizePhone(input: string): string {
  let d = input.replace(/\D/g, '')
  if (d.startsWith('0')) d = '254' + d.slice(1)
  else if ((d.startsWith('7') || d.startsWith('1')) && d.length === 9) d = '254' + d
  return d
}

export default function ParentalConsent() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const consultationId = searchParams.get('consultation_id')
  const professionalId = searchParams.get('professional_id')
  const isPostSignup = searchParams.get('flow') === 'signup'
  const isConsultationFlow = searchParams.get('flow') === 'consultation'

  const [step, setStep] = useState<'request' | 'verify'>('request')
  const [guardianName, setGuardianName] = useState('')
  const [guardianPhone, setGuardianPhone] = useState('')
  const [relationship, setRelationship] = useState('parent')
  const [otp, setOtp] = useState('')
  const [minorAssent, setMinorAssent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const phoneValid = /^254\d{9}$/.test(normalizePhone(guardianPhone))

  const handleRequestOTP = async () => {
    setLoading(true)
    setMessage('')
    try {
      await api.post('/parental-consent/request', {
        guardian_name: guardianName,
        guardian_phone: normalizePhone(guardianPhone),
        relationship,
        consultation_id: consultationId,
      })
      setMessage('OTP sent to guardian phone')
      setStep('verify')
    } catch (error: any) {
      setMessage(error.response?.data?.error || error.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    setLoading(true)
    setMessage('')
    try {
      await api.post('/parental-consent/verify', {
        guardian_name: guardianName,
        guardian_phone: normalizePhone(guardianPhone),
        relationship,
        otp,
        minor_assent: minorAssent,
        consultation_id: consultationId,
      })
      if (isPostSignup) {
        navigate('/dashboard')
      } else if (isConsultationFlow && professionalId) {
        navigate(`/professionals/${professionalId}`)
      } else {
        navigate('/consultations')
      }
    } catch (error: any) {
      setMessage(error.response?.data?.error || error.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center gap-3">
          {!isPostSignup && (
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium">
              <ArrowLeft size={18} />
            </button>
          )}
          <h1 className="text-lg font-bold text-gray-900">
            {isPostSignup ? 'Complete Your Account Setup' : 'Guardian Consent Required'}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold text-blue-900 mb-2">Parent/Guardian Verification Required</h2>
            <p className="text-blue-800 text-sm leading-relaxed">
              {isPostSignup
                ? "Since you're under 18, your parent or guardian must verify their identity, and you must give your own assent to use this service. Your guardian will receive an SMS with a 6-digit code."
                : "Since you're under 18, your parent or guardian must consent to this appointment, and you must give your own assent. Your guardian will receive an SMS with a 6-digit code."}
            </p>
          </div>

          {step === 'request' ? (
            <>
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guardian's Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="parent">Parent</option>
                    <option value="guardian">Guardian</option>
                    <option value="caregiver">Caregiver</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guardian's Phone Number</label>
                  <input
                    type="tel"
                    placeholder="0712 345 678"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  />
                  {guardianPhone && !phoneValid && (
                    <p className="text-red-500 text-xs mt-1">Enter a valid Kenyan number (e.g. 0712345678).</p>
                  )}
                </div>
              </div>

              {message && (
                <div className={`p-4 rounded-lg mb-6 text-sm ${message.includes('sent') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {message}
                </div>
              )}

              <button
                onClick={handleRequestOTP}
                disabled={!guardianName || !phoneValid || loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Phone size={18} />
                {loading ? 'Sending OTP...' : 'Send OTP to Guardian'}
              </button>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Enter OTP</h3>
                <p className="text-gray-500 text-sm mb-4">Your guardian should have received a 6-digit code. Ask them to share it with you.</p>

                <div className="flex gap-2 mb-4">
                  {[0, 1, 2, 3, 4, 5].map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[i] || ''}
                      onChange={(e) => {
                        const newOtp = otp.split('')
                        newOtp[i] = e.target.value.replace(/\D/g, '')
                        setOtp(newOtp.join(''))
                        if (e.target.value && i < 5) {
                          (e.target.nextElementSibling as HTMLInputElement)?.focus()
                        }
                      }}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  ))}
                </div>

                <label className="flex items-start gap-3 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={minorAssent}
                    onChange={(e) => setMinorAssent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-blue-600 flex-shrink-0"
                  />
                  <span className="text-sm text-gray-600 leading-relaxed">
                    I agree to {isPostSignup ? 'use this platform and receive' : 'receive'} these tele-mental health services (my own assent).
                  </span>
                </label>

                <button
                  onClick={() => setStep('request')}
                  className="text-blue-600 text-sm font-semibold hover:underline"
                >
                  Change guardian details
                </button>
              </div>

              {message && (
                <div className={`p-4 rounded-lg mb-6 text-sm ${message.toLowerCase().includes('invalid') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {message}
                </div>
              )}

              <button
                onClick={handleVerifyOTP}
                disabled={otp.length !== 6 || !minorAssent || loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Send size={18} />
                {loading ? 'Verifying...' : 'Verify OTP & Continue'}
              </button>
            </>
          )}
        </div>

        <div className="bg-gray-50 rounded-xl p-6 text-sm text-gray-600">
          <p className="font-semibold text-gray-900 mb-2">Why we need this:</p>
          <ul className="space-y-1 text-xs">
            <li>✓ <strong>Legal requirement</strong> for minors (Kenya mental health regulations)</li>
            <li>✓ <strong>Ensures parental awareness</strong> — guardian knows their child is using the service</li>
            <li>✓ <strong>Protects your privacy &amp; safety</strong> — guardian contact is for verification only, not shared with therapists</li>
            <li>✓ <strong>Your autonomy respected</strong> — you must also agree (your own assent matters)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
