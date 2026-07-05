import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Phone, Send, CheckCircle2, Shield, Lock } from 'lucide-react'
import api from '../../api/axios'

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

  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request')
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
      setStep('success')
      setTimeout(() => {
        if (isPostSignup) {
          navigate('/dashboard')
        } else if (isConsultationFlow && professionalId) {
          navigate(`/professionals/${professionalId}`)
        } else {
          navigate('/consultations')
        }
      }, 2000)
    } catch (error: any) {
      setMessage(error.response?.data?.error || error.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          {!isPostSignup && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              {isPostSignup ? 'Parental Consent Required' : 'Guardian Verification'}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Progress Indicator */}
        {step !== 'success' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition ${
                    step === 'request'
                      ? 'bg-blue-600 text-white'
                      : 'bg-green-500 text-white'
                  }`}
                >
                  {step === 'request' ? '1' : '✓'}
                </div>
                <div className="flex-1 h-1 bg-gray-200"></div>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition ${
                    step === 'verify'
                      ? 'bg-blue-600 text-white'
                      : step === 'request'
                      ? 'bg-gray-200 text-gray-500'
                      : 'bg-green-500 text-white'
                  }`}
                >
                  {step === 'verify' ? '2' : step === 'success' ? '✓' : '2'}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center">
              Step {step === 'request' ? 1 : 2} of 2: {step === 'request' ? 'Guardian Details' : 'Verify OTP'}
            </p>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Info Banner */}
          <div className="bg-blue-50 border-b border-blue-200 p-6">
            <div className="flex gap-4">
              <Shield size={24} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-bold text-blue-900 mb-2">Your Parent/Guardian's Permission is Required</h2>
                <p className="text-blue-800 text-sm leading-relaxed">
                  {isPostSignup
                    ? "Since you're under 18, your parent or guardian must verify their identity. We'll send them a 6-digit code via SMS."
                    : "Since you're under 18, your parent or guardian must consent to this appointment. We'll send them a 6-digit code via SMS."}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {step === 'request' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Parent/Guardian Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Relationship
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="parent">Parent</option>
                    <option value="guardian">Guardian</option>
                    <option value="caregiver">Caregiver</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Parent/Guardian Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="0712 345 678"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-lg"
                  />
                  <p className="text-xs text-gray-500 mt-2">Kenyan phone number (e.g. 0712345678 or +254712345678)</p>
                  {guardianPhone && !phoneValid && (
                    <p className="text-red-600 text-xs mt-2 font-semibold">
                      ✗ Enter a valid Kenyan number (e.g. 0712345678)
                    </p>
                  )}
                </div>

                {message && (
                  <div
                    className={`p-4 rounded-lg text-sm font-medium ${
                      message.includes('sent')
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
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
              </div>
            )}

            {step === 'verify' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Enter the 6-Digit Code</h3>
                  <p className="text-gray-600 text-sm mb-6">
                    Your guardian should have received a 6-digit code on <strong>{guardianPhone.replace(/^254/, '+254')}</strong>. Ask them to share it with you.
                  </p>

                  <div className="flex gap-2 mb-6">
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
                        disabled={loading}
                        className="w-14 h-16 text-center text-3xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                        placeholder="—"
                      />
                    ))}
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition">
                    <input
                      type="checkbox"
                      checked={minorAssent}
                      onChange={(e) => setMinorAssent(e.target.checked)}
                      disabled={loading}
                      className="mt-1 w-5 h-5 accent-blue-600 flex-shrink-0 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 leading-relaxed font-medium">
                      I agree to {isPostSignup ? 'use this platform and receive' : 'receive'} these mental health services
                      <span className="text-gray-500 text-xs block mt-1">(Your own consent/assent)</span>
                    </span>
                  </label>
                </div>

                {message && (
                  <div
                    className={`p-4 rounded-lg text-sm font-medium ${
                      message.toLowerCase().includes('invalid')
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-green-50 text-green-700 border border-green-200'
                    }`}
                  >
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

                <button
                  onClick={() => setStep('request')}
                  disabled={loading}
                  className="w-full py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors"
                >
                  Change Guardian Details
                </button>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={32} className="text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Parental Consent Verified!</h2>
                <p className="text-gray-600 mb-1">Your guardian has verified their identity.</p>
                <p className="text-gray-500 text-sm">You're all set to start therapy. Redirecting...</p>
              </div>
            )}
          </div>
        </div>

        {/* Why Section */}
        {step !== 'success' && (
          <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock size={18} className="text-blue-600" />
              Why We Need Your Guardian's Consent
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold text-lg flex-shrink-0">✓</span>
                <span className="text-sm text-gray-700">
                  <strong>Legal requirement</strong> — Kenya mental health regulations require parental consent for minors
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold text-lg flex-shrink-0">✓</span>
                <span className="text-sm text-gray-700">
                  <strong>Ensures awareness</strong> — Your guardian knows you're getting mental health support
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold text-lg flex-shrink-0">✓</span>
                <span className="text-sm text-gray-700">
                  <strong>Protects privacy</strong> — Guardian contact is for verification only, never shared with therapists
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold text-lg flex-shrink-0">✓</span>
                <span className="text-sm text-gray-700">
                  <strong>Your voice matters</strong> — You must also give your own consent/assent to use the service
                </span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
