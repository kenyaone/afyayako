import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import type { Professional } from '../../types'
import { Shield, CheckCircle, Loader2, Clock, Video, CreditCard, Heart, Banknote } from 'lucide-react'

type Step = 'details' | 'paying' | 'success' | 'failed' | 'insurance_success' | 'cash_success'
type PayMethod = 'paystack' | 'insurance' | 'cash'

interface BookForm {
  scheduled_at: string
  duration_minutes: number
  share_assessments: boolean
  share_mood_logs: boolean
}

interface InsuranceForm {
  provider: string
  member_number: string
  id_number: string
  scheme_name: string
}

const INSURANCE_PROVIDERS = [
  'SHA (Social Health Authority)',
  'AAR Insurance',
  'Jubilee Health Insurance',
  'Madison Insurance',
  'CIC Insurance',
  'Britam Health',
  'Resolution Insurance',
  'GA Insurance',
  'Old Mutual',
  'Other',
]

export default function BookConsultation() {
  const user = useAuthStore(s => s.user)
  const { professionalId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const followUpState = (location.state as any)
  const [pro, setPro] = useState<Professional | null>(null)
  const [step, setStep] = useState<Step>('details')
  const [consultationId, setConsultationId] = useState<string | null>(null)
  const [numericId, setNumericId] = useState<number | null>(null)
  const [amount, setAmount] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [payMethod, setPayMethod] = useState<PayMethod>('paystack')
  const [claimRef, setClaimRef] = useState('')

  const isInstant = !!(location.state as any)?.instant

  // For instant booking pre-fill scheduled_at to 5 minutes from now
  const instantDefault = isInstant ? (() => {
    const d = new Date(Date.now() + 5 * 60 * 1000)
    d.setSeconds(0, 0)
    return d.toISOString().slice(0, 16)
  })() : ''

  const { register, handleSubmit, watch, formState: { errors } } = useForm<BookForm>({
    defaultValues: { duration_minutes: 60, share_assessments: false, share_mood_logs: false, scheduled_at: instantDefault }
  })
  const { register: regIns, handleSubmit: handleIns, formState: { errors: insErrors } } = useForm<InsuranceForm>({
    defaultValues: { provider: 'SHA (Social Health Authority)' }
  })
  const duration = watch('duration_minutes')

  useEffect(() => {
    api.get(`/professionals/${professionalId}`).then(r => setPro(r.data.professional ?? r.data))
  }, [professionalId])

  const computedAmount = pro ? Number(pro.rate_per_hour) * (Number(duration) / 60) : 0

  // Create the booking record first (shared between mpesa + insurance paths)
  const createBooking = async (data: BookForm) => {
    const endpoint = followUpState?.is_follow_up && followUpState?.parent_id
      ? `/consultations/${followUpState.parent_id}/follow-up`
      : '/consultations'
    const bookRes = await api.post(endpoint, {
      professional_id: Number(professionalId),
      scheduled_at: new Date(data.scheduled_at).toISOString(),
      duration_minutes: Number(data.duration_minutes),
      share_assessments: data.share_assessments,
      share_mood_logs: data.share_mood_logs,
    })
    return bookRes.data.consultation
  }

  const onSubmitPaystack = async (data: BookForm) => {
    setLoading(true)
    setError('')
    try {
      const c = await createBooking(data)
      setConsultationId(c.consultation_id)
      setNumericId(c.id)
      setAmount(c.amount)

      // Initialize Paystack transaction on backend
      const initRes = await api.post('/payments/paystack/initialize', {
        consultation_id: c.consultation_id,
      })
      const { access_code } = initRes.data

      // Load Paystack inline.js if needed
      if (!(window as any).PaystackPop) {
        await new Promise<void>((resolve) => {
          const s = document.createElement('script')
          s.src = 'https://js.paystack.co/v1/inline.js'
          s.onload = () => resolve()
          document.head.appendChild(s)
        })
      }

      const handler = (window as any).PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder',
        email: (user as any)?.email || `user@afyayako.com`,
        access_code,
        ref: `ps-${c.consultation_id}-${Date.now()}`,
        currency: 'KES',
        callback: async (response: { reference: string }) => {
          try {
            await api.post('/payments/paystack/verify', { reference: response.reference, consultation_id: c.consultation_id })
            setStep('success')
          } catch {
            setStep('failed')
          }
        },
        onClose: () => {
          setLoading(false)
          setStep('details')
        },
      })
      handler.openIframe()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Booking failed. Please try again.')
      setStep('details')
    } finally {
      setLoading(false)
    }
  }

  const [pendingBookData, setPendingBookData] = useState<BookForm | null>(null)

  const onSessionDetailsForInsurance = (data: BookForm) => {
    setPendingBookData(data)
  }

  const onSubmitInsurance = async (ins: InsuranceForm) => {
    if (!pendingBookData) return
    setLoading(true)
    setError('')
    try {
      const c = await createBooking(pendingBookData)
      setConsultationId(c.consultation_id)
      setNumericId(c.id)
      setAmount(c.amount)

      // Submit insurance claim record
      const ref = `CLM-${c.consultation_id}-${Date.now().toString(36).toUpperCase()}`
      await api.post('/payments/insurance-claim', {
        consultation_id: c.consultation_id,
        provider: ins.provider,
        member_number: ins.member_number,
        id_number: ins.id_number,
        scheme_name: ins.scheme_name,
        claim_reference: ref,
        amount: c.amount,
      })
      setClaimRef(ref)
      setStep('insurance_success')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const onSubmitCash = async (data: BookForm) => {
    setLoading(true)
    setError('')
    try {
      const endpoint = followUpState?.is_follow_up && followUpState?.parent_id
        ? `/consultations/${followUpState.parent_id}/follow-up`
        : '/consultations'
      const res = await api.post(endpoint, {
        professional_id: Number(professionalId),
        scheduled_at: new Date(data.scheduled_at).toISOString(),
        duration_minutes: Number(data.duration_minutes),
        share_assessments: data.share_assessments,
        share_mood_logs: data.share_mood_logs,
        payment_method: 'cash',
      })
      const c = res.data.consultation
      setConsultationId(c.consultation_id)
      setNumericId(c.id)
      setStep('cash_success')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!pro) return <div className="text-center py-10 text-gray-400">Loading…</div>

  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto mt-16 card text-center py-12">
        <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-1">Payment of <strong>KES {amount.toLocaleString()}</strong> received.</p>
        <p className="text-sm text-gray-500 mb-6">Session ID: <strong>{consultationId}</strong></p>
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6 text-sm text-primary-800 text-left">
          <div className="flex items-center gap-2 mb-1">
            <Video size={14} />
            <strong>How to join your session:</strong>
          </div>
          Go to <strong>My Sessions</strong> → click <strong>Join Session</strong> at the scheduled time. A private Jitsi video room will open.
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/consultations')} className="btn-primary flex-1">View My Sessions</button>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary flex-1">Dashboard</button>
        </div>
      </div>
    )
  }

  if (step === 'insurance_success') {
    return (
      <div className="max-w-lg mx-auto mt-16 card text-center py-10">
        <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Session Booked!</h2>
        <p className="text-gray-600 mb-1">Your session has been reserved and an insurance claim has been raised.</p>
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 my-5 text-left text-sm">
          <div className="font-semibold text-teal-900 mb-2 flex items-center gap-2">
            <Heart size={14} className="text-teal-600" /> Insurance Claim Details
          </div>
          <div className="space-y-1.5 text-teal-800">
            <div className="flex justify-between"><span>Claim Reference</span><strong>{claimRef}</strong></div>
            <div className="flex justify-between"><span>Session ID</span><strong>{consultationId}</strong></div>
            <div className="flex justify-between"><span>Amount</span><strong>KES {amount.toLocaleString()}</strong></div>
          </div>
          <p className="text-teal-700 text-xs mt-3">
            Save this claim reference. We will submit it to your insurer on your behalf. If your plan requires co-payment or direct submission, we will send a clinical receipt to your registered email.
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 mb-5">
          Your session is <strong>pending insurer confirmation</strong>. If the claim is not approved within 48 hours, you will be notified to complete payment directly.
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/consultations')} className="btn-primary flex-1">View My Sessions</button>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary flex-1">Dashboard</button>
        </div>
      </div>
    )
  }

  if (step === 'cash_success') {
    return (
      <div className="max-w-lg mx-auto mt-16 card text-center py-12">
        <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Session Confirmed!</h2>
        <p className="text-gray-600 mb-1">Your session has been booked. Payment will be made at the session.</p>
        <p className="text-sm text-gray-500 mb-6">Session ID: <strong>{consultationId}</strong></p>
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6 text-sm text-primary-800 text-left">
          <div className="flex items-center gap-2 mb-1">
            <Video size={14} />
            <strong>How to join your session:</strong>
          </div>
          Go to <strong>My Sessions</strong> → click <strong>Join Session</strong> at the scheduled time. A private Jitsi video room will open.
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/consultations')} className="btn-primary flex-1">View My Sessions</button>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary flex-1">Dashboard</button>
        </div>
      </div>
    )
  }

  if (step === 'failed') {
    return (
      <div className="max-w-lg mx-auto mt-16 card text-center py-10">
        <Clock size={48} className="text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Not Confirmed</h2>
        <p className="text-gray-600 mb-4">The payment was not confirmed in time. Your booking is pending — if you paid, it will confirm automatically.</p>
        <div className="flex gap-3">
          <button onClick={() => navigate('/consultations')} className="btn-primary flex-1">Check My Sessions</button>
          <button onClick={() => { setStep('details'); setError('') }} className="btn-secondary flex-1">Try Again</button>
        </div>
      </div>
    )
  }

  // ── Main booking form ──────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">
        {isInstant ? '⚡ Instant Session' : followUpState?.is_follow_up ? 'Book a Follow-up Session' : 'Book a Session'}
      </h1>
      {isInstant && (
        <div className="flex items-center gap-2 text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
          This therapist is online now — your session time has been pre-filled. You can adjust it if needed.
        </div>
      )}
      {followUpState?.is_follow_up && !isInstant && (
        <p className="text-sm text-primary-700 bg-primary-50 border border-primary-200 rounded-lg px-3 py-2">
          This is a follow-up to your previous session with this therapist.
        </p>
      )}

      {/* Professional card */}
      <div className="card flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl flex-shrink-0">
          {pro.display_name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{pro.display_name}</div>
          <div className="text-sm text-gray-500">{pro.specializations?.map(s => s.name).join(', ')}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-teal-700 bg-teal-50 border border-teal-200 px-2 py-1 rounded-lg">Rate agreed at booking</div>
          <div className="text-xs text-gray-400">{pro.years_experience} yrs exp</div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      {/* ── PAYMENT METHOD SELECTOR ── */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-3">How will you pay?</h2>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setPayMethod('paystack')}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
              payMethod === 'paystack'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${payMethod === 'paystack' ? 'bg-blue-600' : 'bg-gray-100'}`}>
              <CreditCard size={16} className={payMethod === 'paystack' ? 'text-white' : 'text-gray-500'} />
            </div>
            <div>
              <div className={`text-sm font-semibold ${payMethod === 'paystack' ? 'text-blue-900' : 'text-gray-700'}`}>Paystack</div>
              <div className="text-xs text-gray-400">Card · Bank transfer</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPayMethod('insurance')}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
              payMethod === 'insurance'
                ? 'border-teal-500 bg-teal-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${payMethod === 'insurance' ? 'bg-teal-600' : 'bg-gray-100'}`}>
              <Heart size={16} className={payMethod === 'insurance' ? 'text-white' : 'text-gray-500'} />
            </div>
            <div>
              <div className={`text-sm font-semibold ${payMethod === 'insurance' ? 'text-teal-900' : 'text-gray-700'}`}>Insurance / SHA</div>
              <div className="text-xs text-gray-400">SHA, AAR, Jubilee…</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPayMethod('cash')}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
              payMethod === 'cash'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${payMethod === 'cash' ? 'bg-green-600' : 'bg-gray-100'}`}>
              <Banknote size={16} className={payMethod === 'cash' ? 'text-white' : 'text-gray-500'} />
            </div>
            <div>
              <div className={`text-sm font-semibold ${payMethod === 'cash' ? 'text-green-900' : 'text-gray-700'}`}>Pay at Session</div>
              <div className="text-xs text-gray-400">Cash · In person</div>
            </div>
          </button>
        </div>
      </div>

      {payMethod === 'paystack' ? (
        /* ── PAYSTACK FLOW ── */
        <form onSubmit={handleSubmit(onSubmitPaystack)} className="space-y-5">
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900">Session Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date &amp; Time</label>
              <input
                {...register('scheduled_at', { required: 'Please select a date and time' })}
                type="datetime-local"
                min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
                className="input-field"
              />
              {errors.scheduled_at && <p className="text-red-500 text-xs mt-1">{errors.scheduled_at.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <select {...register('duration_minutes', { valueAsNumber: true })} className="input-field">
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes (recommended)</option>
                <option value={90}>90 minutes</option>
              </select>
            </div>
          </div>

          <div className="card space-y-3">
            <h2 className="font-semibold text-gray-900">Privacy Settings</h2>
            {[
              { name: 'share_assessments', label: 'Share my assessment results with therapist', desc: 'Helps them understand your condition better' },
              { name: 'share_mood_logs', label: 'Share my mood logs with therapist', desc: 'Shows your recent emotional patterns' },
            ].map(({ name, label, desc }) => (
              <label key={name} className="flex items-start gap-3 cursor-pointer">
                <input {...register(name as keyof BookForm)} type="checkbox" className="mt-1 rounded border-gray-300 text-primary-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{label}</div>
                  <div className="text-xs text-gray-500">{desc}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="card space-y-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard size={16} className="text-blue-600" /> Payment via Paystack
            </h2>
            <div className="flex items-start gap-2 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <Shield size={14} className="flex-shrink-0 mt-0.5 text-blue-600" />
              <span>Secure payment via Paystack. Choose Visa/Mastercard or bank transfer at checkout.</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span className="font-medium">Therapist's rate</span>
                <span className="font-medium text-teal-700">Agreed with therapist</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Final session fee is agreed with your therapist and confirmed at checkout.</p>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading
              ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Processing…</span>
              : 'Book & Pay with Paystack'
            }
          </button>
        </form>

      ) : payMethod === 'insurance' ? (
        /* ── INSURANCE / SHA FLOW ── */
        <>
          {/* Step 1: session details (re-use same form structure) */}
          {!pendingBookData ? (
            <form onSubmit={handleSubmit(onSessionDetailsForInsurance)} className="space-y-5">
              <div className="card space-y-4">
                <h2 className="font-semibold text-gray-900">Session Details</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date &amp; Time</label>
                  <input
                    {...register('scheduled_at', { required: 'Please select a date and time' })}
                    type="datetime-local"
                    min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
                    className="input-field"
                  />
                  {errors.scheduled_at && <p className="text-red-500 text-xs mt-1">{errors.scheduled_at.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <select {...register('duration_minutes', { valueAsNumber: true })} className="input-field">
                    <option value={30}>30 minutes — KES {Math.round(Number(pro.rate_per_hour) * 0.5).toLocaleString()}</option>
                    <option value={60}>60 minutes — KES {Number(pro.rate_per_hour).toLocaleString()} (recommended)</option>
                    <option value={90}>90 minutes — KES {Math.round(Number(pro.rate_per_hour) * 1.5).toLocaleString()}</option>
                  </select>
                </div>
              </div>

              <div className="card space-y-3">
                <h2 className="font-semibold text-gray-900">Privacy Settings</h2>
                {[
                  { name: 'share_assessments', label: 'Share my assessment results', desc: 'Helps therapist understand your condition' },
                  { name: 'share_mood_logs', label: 'Share my mood logs', desc: 'Shows recent emotional patterns' },
                ].map(({ name, label, desc }) => (
                  <label key={name} className="flex items-start gap-3 cursor-pointer">
                    <input {...register(name as keyof BookForm)} type="checkbox" className="mt-1 rounded border-gray-300 text-primary-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{label}</div>
                      <div className="text-xs text-gray-500">{desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <button type="submit" className="btn-primary w-full py-3">
                Continue to Insurance Details →
              </button>
            </form>

          ) : (
            /* Step 2: insurance details */
            <form onSubmit={handleIns(onSubmitInsurance)} className="space-y-5">
              <div className="card space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Heart size={16} className="text-teal-600" />
                  <h2 className="font-semibold text-gray-900">Insurance / SHA Details</h2>
                </div>

                <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs text-teal-800">
                  <strong>SHA members:</strong> Your National Social Health Insurance Fund (SHIF) covers outpatient mental health consultations. Use your SHA member number (linked to your National ID) to claim. Co-payments may apply depending on your SHA tier.
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
                  <select {...regIns('provider', { required: true })} className="input-field">
                    {INSURANCE_PROVIDERS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SHA Member Number / Insurance Card Number
                  </label>
                  <input
                    {...regIns('member_number', { required: 'Member number is required' })}
                    className="input-field"
                    placeholder="e.g. SHA-1234567 or your card number"
                  />
                  {insErrors.member_number && <p className="text-red-500 text-xs mt-1">{insErrors.member_number.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    National ID / Passport Number
                  </label>
                  <input
                    {...regIns('id_number', { required: 'ID number is required for verification' })}
                    className="input-field"
                    placeholder="e.g. 12345678"
                  />
                  {insErrors.id_number && <p className="text-red-500 text-xs mt-1">{insErrors.id_number.message}</p>}
                  <p className="text-xs text-gray-400 mt-1">Used only for insurance verification. Not stored in your profile.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheme / Plan Name <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    {...regIns('scheme_name')}
                    className="input-field"
                    placeholder="e.g. Jubilee Gold, SHA Tier 2"
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between text-gray-600 mb-1"><span>Session amount</span><span>KES {computedAmount.toLocaleString()}</span></div>
                  <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1.5"><span>Claimed from insurer</span><span>KES {computedAmount.toLocaleString()}</span></div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                  If your insurer rejects the claim or requires co-payment, we will contact you to complete the balance directly.
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setPendingBookData(null)} className="btn-secondary flex-1">
                  ← Back
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
                  {loading
                    ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" />Submitting…</span>
                    : 'Submit Insurance Claim'
                  }
                </button>
              </div>
            </form>
          )}
        </>
      ) : (
        /* ── CASH / PAY AT SESSION FLOW ── */
        <form onSubmit={handleSubmit(onSubmitCash)} className="space-y-5">
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900">Session Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date &amp; Time</label>
              <input
                {...register('scheduled_at', { required: 'Please select a date and time' })}
                type="datetime-local"
                min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
                className="input-field"
              />
              {errors.scheduled_at && <p className="text-red-500 text-xs mt-1">{errors.scheduled_at.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <select {...register('duration_minutes', { valueAsNumber: true })} className="input-field">
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes (recommended)</option>
                <option value={90}>90 minutes</option>
              </select>
            </div>
          </div>

          <div className="card space-y-3">
            <h2 className="font-semibold text-gray-900">Privacy Settings</h2>
            {[
              { name: 'share_assessments', label: 'Share my assessment results with therapist', desc: 'Helps them understand your condition better' },
              { name: 'share_mood_logs', label: 'Share my mood logs with therapist', desc: 'Shows your recent emotional patterns' },
            ].map(({ name, label, desc }) => (
              <label key={name} className="flex items-start gap-3 cursor-pointer">
                <input {...register(name as keyof BookForm)} type="checkbox" className="mt-1 rounded border-gray-300 text-primary-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{label}</div>
                  <div className="text-xs text-gray-500">{desc}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="card">
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
              <Banknote size={16} className="flex-shrink-0 mt-0.5 text-green-600" />
              <div>
                <div className="font-semibold mb-0.5">Pay at Session</div>
                <div>Your session will be <strong>confirmed immediately</strong>. Agree the fee directly with your therapist and pay in cash or bank transfer at the time of the session.</div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading
              ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" />Confirming…</span>
              : 'Confirm Booking'
            }
          </button>
        </form>
      )}
    </div>
  )
}
