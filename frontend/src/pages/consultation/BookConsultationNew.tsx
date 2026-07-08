import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Video, MapPin, Shield, AlertCircle } from 'lucide-react'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import type { Professional } from '../../types'
import ConsentForm from '../../components/ConsentForm'
import { loadTriage, clearTriage } from '../../lib/triage'

type BookStep = 'mode' | 'consent' | 'fee' | 'confirm' | 'payment' | 'processing' | 'success'
type SessionMode = 'virtual' | 'physical'

interface BookingData {
  mode: SessionMode
  scheduled_at: string
  duration_minutes: number
  share_assessments: boolean
  is_user_minor?: boolean
}

type PaymentMethod = 'mpesa' | 'pesapal' | 'insurance' | null

export default function BookConsultation() {
  const user = useAuthStore(s => s.user)
  const { professionalId } = useParams()
  const navigate = useNavigate()

  const [pro, setPro] = useState<Professional | null>(null)
  const [step, setStep] = useState<BookStep>('mode')
  const [booking, setBooking] = useState<BookingData>({
    mode: 'virtual',
    scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    duration_minutes: 60,
    share_assessments: false,
  })
  const [consentOpen, setConsentOpen] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [consultationId, setConsultationId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const BOOKING_FEE = 500 // KES

  const isEap = user?.is_eap_employee ?? false
  const sessionsUsed = user?.eap_sessions_used ?? 0
  const sessionsAllowed = user?.eap_sessions_allowed ?? 0

  const sessionCost = pro?.session_rate || 0
  const totalCost = sessionCost + BOOKING_FEE

  useEffect(() => {
    api.get(`/professionals/${professionalId}`)
      .then(r => setPro(r.data.professional ?? r.data))
      .catch(() => navigate('/professionals'))
  }, [professionalId, navigate])

  const handleNext = () => {
    if (step === 'mode') {
      // Validate mode is selected
      if (!booking.mode) {
        setError('Please select a session mode')
        return
      }
      setStep('consent')
    } else if (step === 'consent') {
      // EAP employees never see the paid-fee summary — their employer covers it.
      setStep(isEap ? 'confirm' : 'fee')
    } else if (step === 'fee') {
      setStep('confirm')
    }
  }

  const handleConsent = (consented: boolean) => {
    if (consented) {
      setStep(isEap ? 'confirm' : 'fee')
    }
  }

  const handleConfirm = async () => {
    setLoading(true)
    setError('')
    try {
      const triage = loadTriage()
      // Create consultation with all details
      const res = await api.post('/consultations', {
        professional_id: Number(professionalId),
        mode: booking.mode,
        scheduled_at: new Date(booking.scheduled_at).toISOString(),
        duration_minutes: booking.duration_minutes,
        share_assessments: booking.share_assessments,
        consent_accepted: true,
        booking_fee: BOOKING_FEE,
        triage_snapshot: triage,
      })

      setConsultationId(res.data.consultation.consultation_id)
      if (triage) clearTriage()
      // Backend signals "no more payment steps" via next_step === 'none'
      // (EAP-covered bookings, cash bookings). Skip straight to success.
      setStep(res.data.next_step === 'none' ? 'success' : 'payment')
    } catch (err: any) {
      const d = err.response?.data
      if (d?.requires_parental_consent) {
        navigate(`/parental-consent?professional_id=${professionalId}&flow=consultation`)
        return
      }
      if (d?.requires_date_of_birth) {
        setError('Please add your date of birth in your profile before booking.')
        setTimeout(() => navigate('/profile'), 1500)
        return
      }
      setError(d?.error || d?.message || 'Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!consultationId) {
      setError('Consultation ID missing')
      return
    }

    if (!paymentMethod) {
      setError('Please select a payment method')
      return
    }

    setLoading(true)
    setError('')
    try {
      if (paymentMethod === 'mpesa') {
        if (!phoneNumber) {
          setError('Please enter your M-Pesa phone number')
          setLoading(false)
          return
        }
        // Initiate M-Pesa payment
        const res = await api.post('/payments/initiate', {
          consultation_id: consultationId,
          phone: phoneNumber,
        })
        // STK Push sent, user will enter PIN
        setStep('processing')
        // Check payment status after timeout
        setTimeout(checkPaymentStatus, 30000)
      } else if (paymentMethod === 'pesapal') {
        const res = await api.post('/payments/pesapal/initiate', {
          consultation_id: consultationId,
          phone: phoneNumber,
          email: user?.email,
        })
        if (res.data.redirect_url) {
          window.location.href = res.data.redirect_url
        }
      } else if (paymentMethod === 'insurance') {
        navigate(`/insurance-claim/${consultationId}`)
      }
    } catch (err: any) {
      const d = err.response?.data
      setError(d?.error || d?.message || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const checkPaymentStatus = async () => {
    if (!consultationId) return
    try {
      const res = await api.get(`/consultations/${consultationId}`)
      if (res.data.consultation?.status === 'confirmed') {
        setStep('success')
      } else {
        setError('Payment not confirmed. Please try again.')
        setStep('payment')
      }
    } catch {
      setError('Failed to check payment status')
      setStep('payment')
    }
  }

  if (!pro) {
    return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading professional info...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Book Session with {pro.display_name}</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {(['mode', 'consent', 'fee', 'confirm', 'payment'] as const).map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                (['mode', 'consent', 'fee', 'confirm', 'payment'].indexOf(step) >= i)
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {i + 1}
              </div>
              {i < 4 && <div className={`h-1 flex-1 mx-2 ${
                (['mode', 'consent', 'fee', 'confirm', 'payment'].indexOf(step) > i) ? 'bg-teal-600' : 'bg-gray-200'
              }`} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Step 1: Mode Selection */}
        {step === 'mode' && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How would you like to connect?</h2>
            <div className="space-y-4">
              <button
                onClick={() => setBooking(prev => ({ ...prev, mode: 'virtual' }))}
                className={`w-full p-6 border-2 rounded-xl text-left transition-all ${
                  booking.mode === 'virtual'
                    ? 'border-teal-600 bg-teal-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600 flex-shrink-0">
                    <Video size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">Video Call</h3>
                    <p className="text-sm text-gray-500">Private encrypted video session</p>
                  </div>
                  {booking.mode === 'virtual' && <CheckCircle size={24} className="text-teal-600 flex-shrink-0" />}
                </div>
              </button>

              <button
                onClick={() => setBooking(prev => ({ ...prev, mode: 'physical' }))}
                className={`w-full p-6 border-2 rounded-xl text-left transition-all ${
                  booking.mode === 'physical'
                    ? 'border-teal-600 bg-teal-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">In-Person</h3>
                    <p className="text-sm text-gray-500">Meet with therapist face-to-face</p>
                  </div>
                  {booking.mode === 'physical' && <CheckCircle size={24} className="text-teal-600 flex-shrink-0" />}
                </div>
              </button>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Consent */}
        {step === 'consent' && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Consent</h2>
            <p className="text-gray-600 mb-6">Before we proceed, please review and agree to our session terms.</p>

            <div className="mb-8">
              <button
                onClick={() => setConsentOpen(true)}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Review Session Terms</p>
                  <p className="text-sm text-gray-500">Privacy, confidentiality, and your rights</p>
                </div>
                <ArrowRight size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setStep('mode')}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
              >
                I Agree & Continue <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Booking Fee */}
        {step === 'fee' && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Summary</h2>

            <div className="space-y-4 mb-8 pb-8 border-b border-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-600">Professional:</span>
                <span className="font-semibold text-gray-900">{pro.display_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Session Type:</span>
                <span className="font-semibold text-gray-900">{booking.mode === 'virtual' ? 'Video Call' : 'In-Person'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Session Time:</span>
                <span className="font-semibold text-gray-900">{new Date(booking.scheduled_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-semibold text-gray-900">{booking.duration_minutes} minutes</span>
              </div>
            </div>

            <div className="space-y-3 mb-8 bg-blue-50 rounded-lg p-6 border border-blue-100">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Session Rate:</span>
                <span className="font-semibold">KES {sessionCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Booking Fee:</span>
                <span className="font-semibold">KES {BOOKING_FEE.toFixed(2)}</span>
              </div>
              <div className="border-t border-blue-200 pt-3 flex justify-between items-center text-lg">
                <span className="font-bold text-gray-900">Total Amount:</span>
                <span className="font-black text-teal-600">KES {totalCost.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex gap-3">
              <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                The <strong>KES 500 booking fee is deducted from your final session cost.</strong> You'll only pay the difference if the session rate exceeds this amount.
              </p>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setStep('consent')}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
              >
                Continue to Confirmation <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirm & Book */}
        {(step === 'confirm' || step === 'processing') && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirm Booking</h2>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-teal-900 mb-4">Ready to book?</h3>
              <ul className="space-y-2 text-sm text-teal-800">
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-teal-600 flex-shrink-0 mt-0.5" />
                  Session with {pro.display_name}
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-teal-600 flex-shrink-0 mt-0.5" />
                  {booking.mode === 'virtual' ? 'Encrypted video call' : 'In-person appointment'}
                </li>
                {isEap ? (
                  <li className="flex gap-2">
                    <CheckCircle size={16} className="text-teal-600 flex-shrink-0 mt-0.5" />
                    Covered by your employer's EAP — no payment required
                    {sessionsAllowed > 0 && (
                      <span className="text-teal-700 opacity-80"> ({sessionsUsed + 1} of {sessionsAllowed} this month)</span>
                    )}
                  </li>
                ) : (
                  <li className="flex gap-2">
                    <CheckCircle size={16} className="text-teal-600 flex-shrink-0 mt-0.5" />
                    Total: KES {totalCost.toFixed(2)}
                  </li>
                )}
              </ul>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setStep(isEap ? 'consent' : 'fee')}
                disabled={step === 'processing'}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading || step === 'processing'}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
              >
                {step === 'processing' ? 'Creating Booking...' : (isEap ? 'Confirm booking' : 'Continue to Payment')}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Payment */}
        {(step === 'payment' || step === 'processing') && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment</h2>

            <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Consultation ID:</span>
                  <code className="font-mono font-semibold text-gray-900 bg-white px-3 py-1 rounded border border-gray-300">{consultationId}</code>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                  <span className="text-gray-600">Total Amount Due:</span>
                  <span className="font-bold text-lg text-teal-600">KES {totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer"
                style={{borderColor: paymentMethod === 'mpesa' ? '#0d9488' : '#e5e7eb'}}>
                <input type="radio" name="payment" value="mpesa" checked={paymentMethod === 'mpesa'}
                  onChange={() => setPaymentMethod('mpesa')} className="mr-3" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">M-Pesa</p>
                  <p className="text-sm text-gray-500">STK push to your phone</p>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer"
                style={{borderColor: paymentMethod === 'pesapal' ? '#0d9488' : '#e5e7eb'}}>
                <input type="radio" name="payment" value="pesapal" checked={paymentMethod === 'pesapal'}
                  onChange={() => setPaymentMethod('pesapal')} className="mr-3" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">PesaPal</p>
                  <p className="text-sm text-gray-500">Credit card, Airtel Money, bank transfer</p>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer"
                style={{borderColor: paymentMethod === 'insurance' ? '#0d9488' : '#e5e7eb'}}>
                <input type="radio" name="payment" value="insurance" checked={paymentMethod === 'insurance'}
                  onChange={() => setPaymentMethod('insurance')} className="mr-3" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Insurance Claim</p>
                  <p className="text-sm text-gray-500">Claim through your provider</p>
                </div>
              </label>
            </div>

            {paymentMethod === 'mpesa' && (
              <input type="tel" placeholder="254712345678" value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-8 focus:outline-none focus:ring-2 focus:ring-teal-600" />
            )}

            <div className="mt-8 flex gap-3">
              <button onClick={() => setStep('confirm')} disabled={step === 'processing'}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50">
                Back
              </button>
              <button onClick={handlePayment} disabled={loading || step === 'processing'}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold rounded-lg flex items-center justify-center gap-2">
                {step === 'processing' ? 'Processing Payment...' : 'Complete Payment'}
              </button>
            </div>
          </div>
        )}

        {/* Success State */}
        {step === 'success' && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">Your session has been scheduled. Check your email for details.</p>
            <button
              onClick={() => navigate('/consultations')}
              className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg"
            >
              View My Sessions
            </button>
          </div>
        )}
      </div>

      <ConsentForm
        isOpen={consentOpen}
        onClose={() => setConsentOpen(false)}
        onConsent={handleConsent}
        title="Session Consent & Terms"
        description="Please review our session policies, your rights, and privacy protections."
        type={booking.mode}
      />
    </div>
  )
}
