import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'
import { Building2, CheckCircle, Users, BarChart3, Shield, TrendingDown, Zap, Landmark, FileText, Smartphone, Receipt, Copy } from 'lucide-react'

interface EAPTier { id: number; name: string; min_employees: number; max_employees: number; price_kes_annual: string; sessions_per_employee: number; features: string[]; pricing_model?: 'flat_monthly' | 'per_employee_month' | 'custom' }
type PaymentMethod = 'bank_transfer' | 'cheque' | 'invoice_net30' | 'mpesa'
interface FormData {
  company_name: string; contact_name: string; contact_email: string; contact_phone: string
  industry: string; employee_count: number; kra_pin: string; tier_id: number; phone: string
  payment_method: PaymentMethod
  billing_notes?: string
}

export default function Corporate() {
  const [tiers, setTiers] = useState<EAPTier[]>([])
  const [selectedTier, setSelectedTier] = useState<EAPTier | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>()
  const employeeCount = watch('employee_count')

  useEffect(() => {
    api.get('/corporate/tiers').then(r => {
      const list: EAPTier[] = Array.isArray(r.data) ? r.data : (r.data?.tiers ?? [])
      setTiers(list)
      if (list.length) setSelectedTier(list[0])
    }).catch(() => setTiers([]))
  }, [])

  useEffect(() => {
    if (employeeCount && tiers.length) {
      const matching = tiers.find(t => Number(employeeCount) >= t.min_employees && Number(employeeCount) <= t.max_employees)
      if (matching) { setSelectedTier(matching); setValue('tier_id', matching.id) }
    }
  }, [employeeCount, tiers])

  const onSubmit = async (data: FormData) => {
    if (!selectedTier) { setError('Please select a tier.'); return }
    setLoading(true)
    setError('')
    try {
      await api.post('/corporate/apply', { ...data, tier_id: selectedTier.id })
      setSubmitted(true)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return (
    <div className="max-w-lg mx-auto mt-8">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
        <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={30} className="text-primary-600" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Application received</h2>
        <p className="text-gray-600 mb-6">
          Thank you. Our team will reach out within <strong>1 business day</strong> with your
          invoice / payment instructions and set up your HR account.
        </p>
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-sm text-primary-900 text-left space-y-1.5">
          <div className="flex items-center gap-2"><CheckCircle size={14} className="text-primary-600"/> Invoice emailed to your billing contact</div>
          <div className="flex items-center gap-2"><CheckCircle size={14} className="text-primary-600"/> HR dashboard access provisioned on payment</div>
          <div className="flex items-center gap-2"><CheckCircle size={14} className="text-primary-600"/> Onboarding call scheduled</div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Corporate EAP Packages</h1>
        <p className="text-gray-500 mt-2">Give your employees private, professional mental health support. Improve retention, reduce burnout, boost productivity.</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          <TrendingDown size={18} className="text-green-600" />
          <span className="text-sm font-semibold text-green-700">Up to 81% cheaper than market competitors</span>
        </div>
      </div>

      {/* Competitive Comparison */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
        <div className="flex items-start gap-3 mb-4">
          <Zap size={24} className="text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">Why Afya Yako Beats Traditional EAP Providers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-900">Market Standard (50-200 employees)</div>
                <div className="text-gray-600">KES 1,000–1,500 per employee/month</div>
              </div>
              <div>
                <div className="font-medium text-green-700">Afya Yako Pricing</div>
                <div className="text-green-600 font-semibold">KES 188–750 per employee/month</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Annual Cost (100 employees)</div>
                <div className="text-red-600 line-through">KES 1,800,000</div>
              </div>
              <div>
                <div className="font-medium text-green-700">Your Cost at Afya Yako</div>
                <div className="text-green-600 font-semibold">KES 450,000</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="text-sm font-semibold text-blue-900">💰 You save: KES 1,350,000 annually (75% savings)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Why EAP */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3 text-center">Built for Modern Workforces</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Users, title: 'Anonymous Access', desc: 'Employees access support privately — HR only sees aggregate stats, never individual data.' },
            { icon: BarChart3, title: 'HR Dashboard', desc: 'Track utilisation, trending issues, and ROI. Monthly reports delivered automatically.' },
            { icon: Shield, title: 'KMPDC Verified', desc: 'All therapists are licensed professionals. Sessions are encrypted end-to-end.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card text-center">
              <Icon size={28} className="text-blue-500 mx-auto mb-2" />
              <div className="font-semibold text-gray-900 mb-1">{title}</div>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Transparent Pricing Advantage */}
      <div className="card bg-white border-l-4 border-green-500">
        <h3 className="font-semibold text-gray-900 mb-2">✅ Transparent Pricing (No Hidden Fees)</h3>
        <p className="text-sm text-gray-600 mb-3">Unlike traditional EAP providers that require custom quotes for large teams, Afya Yako offers <strong>predictable, flat-rate pricing</strong> that scales with your company. No vendor lock-in. No surprises.</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-gray-900">Traditional EAP</div>
            <div className="text-gray-500">Custom enterprise quotes (opaque pricing)</div>
          </div>
          <div>
            <div className="font-medium text-green-700">Afya Yako</div>
            <div className="text-green-600 font-medium">Clear pricing for all team sizes</div>
          </div>
        </div>
      </div>

      {/* Tier selector */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Select Your Package</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tiers.map(tier => {
            const annual   = Number(tier.price_kes_annual) || 0
            const monthly  = annual ? Math.round(annual / 12) : 0
            const model    = tier.pricing_model || (annual === 0 ? 'custom' : 'per_employee_month')
            const isCustom = model === 'custom'
            const isFlat   = model === 'flat_monthly'
            const maxEmpDisplay = tier.max_employees >= 1000 ? `${tier.min_employees}+` : `${tier.min_employees}–${tier.max_employees}`
            return (
              <button
                key={tier.id}
                onClick={() => { setSelectedTier(tier); setValue('tier_id', tier.id) }}
                className={`card text-left border-2 transition-all ${selectedTier?.id === tier.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}
              >
                <div className="font-semibold text-gray-900">{tier.name} Enterprise</div>
                <div className="text-xs text-gray-500 mb-2">{maxEmpDisplay} employees</div>
                {isCustom ? (
                  <>
                    <div className="text-xl font-bold text-primary-700">Custom pricing</div>
                    <div className="text-xs text-gray-500 mt-1">Tailored to your organization</div>
                  </>
                ) : isFlat ? (
                  <>
                    <div className="text-xl font-bold text-primary-700">
                      KSh {monthly.toLocaleString()}
                      <span className="text-sm text-gray-500 font-normal"> flat / month</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Same monthly cost for teams up to {tier.max_employees}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-xl font-bold text-primary-700">
                      KSh {monthly.toLocaleString()}
                      <span className="text-sm text-gray-500 font-normal"> per employee / month</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ≈ KSh {annual.toLocaleString()} per employee / year
                    </div>
                  </>
                )}
                <div className="text-xs text-gray-600 mt-2">
                  Up to {tier.sessions_per_employee} in-person session{tier.sessions_per_employee === 1 ? '' : 's'} per employee / month · 24/7 tele-therapy
                </div>
                {selectedTier?.id === tier.id && <CheckCircle size={16} className="text-primary-500 mt-2" />}
              </button>
            );
          })}
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      {/* Application form */}
      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
        <h2 className="font-semibold text-gray-900 text-lg">Company Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label>
            <input {...register('company_name', { required: true })} className="input-field" placeholder="Acme Kenya Ltd" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            <input {...register('industry')} className="input-field" placeholder="Banking, Tech, Healthcare..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Employees <span className="text-red-500">*</span></label>
            <input {...register('employee_count', { required: true, valueAsNumber: true, min: 5 })} type="number" min={5} className="input-field" placeholder="50" />
            {selectedTier && <p className="text-xs text-blue-600 mt-1">→ Recommended: {selectedTier.name} package</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">KRA PIN (optional)</label>
            <input {...register('kra_pin')} className="input-field" placeholder="P051234567A" />
          </div>
        </div>

        <h2 className="font-semibold text-gray-900">HR Contact</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name <span className="text-red-500">*</span></label>
            <input {...register('contact_name', { required: true })} className="input-field" placeholder="Jane Wanjiku" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email <span className="text-red-500">*</span></label>
            <input {...register('contact_email', { required: true })} type="email" className="input-field" placeholder="hr@company.co.ke" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone <span className="text-red-500">*</span></label>
            <input {...register('contact_phone', { required: true })} className="input-field" placeholder="0712345678" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">M-Pesa Payment Number <span className="text-red-500">*</span></label>
            <input {...register('phone', { required: true })} className="input-field" placeholder="0712345678" />
          </div>
        </div>

        {selectedTier && (() => {
          const emp    = Number(watch('employee_count')) || Number(selectedTier.max_employees) || 0
          const model  = selectedTier.pricing_model
                     || (Number(selectedTier.price_kes_annual) === 0 ? 'custom' : 'per_employee_month')
          const isCustom = model === 'custom'
          const isFlat   = model === 'flat_monthly'

          const monthlyPerEmp = Number(selectedTier.price_kes_annual) / 12
          const monthlyTotal  = isCustom ? 0
                             : isFlat   ? monthlyPerEmp                        // for flat, price_kes_annual/12 IS the monthly total
                                        : monthlyPerEmp * emp
          const annualTotal   = monthlyTotal * 12

          return (
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-5">
              <div className="font-bold text-primary-900 text-base mb-3">Order summary</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-primary-900">
                  <span>{selectedTier.name} EAP · {emp} employees</span>
                  <span>
                    {isCustom ? 'Custom'
                     : isFlat  ? `Flat KSh ${Math.round(monthlyTotal).toLocaleString()}/mo`
                              : `KSh ${Math.round(monthlyPerEmp).toLocaleString()}/emp/mo`}
                  </span>
                </div>
                <div className="flex justify-between text-primary-900">
                  <span>Session allocation</span>
                  <span>{emp * selectedTier.sessions_per_employee} sessions / month</span>
                </div>
                <div className="border-t border-primary-200 my-2" />
                <div className="flex justify-between font-bold text-primary-900 text-base">
                  <span>Monthly bill</span>
                  <span>{isCustom ? 'Contact sales' : `KSh ${Math.round(monthlyTotal).toLocaleString()}`}</span>
                </div>
                {!isCustom && (
                  <div className="text-xs text-primary-700">
                    {isFlat
                      ? `Flat rate — same monthly bill from 1 up to ${selectedTier.max_employees} employees · cancel any time`
                      : `≈ KSh ${Math.round(annualTotal).toLocaleString()} / year · cancel any time`}
                  </div>
                )}
              </div>
            </div>
          )
        })()}

        <PaymentMethodPicker register={register} watch={watch} />

        <input type="hidden" {...register('tier_id')} value={selectedTier?.id} />

        <button
          type="submit"
          disabled={loading || !selectedTier}
          className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
          style={{ background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)' }}
        >
          {loading ? 'Submitting…' : 'Submit application'}
        </button>
        <p className="text-xs text-gray-500 text-center">
          You'll receive an invoice or payment instructions within 1 business day. No card charged today.
        </p>
      </form>
    </div>
  )
}

// ── Payment method picker ─────────────────────────────────────────────
// Kenyan corporates rarely pay via M-Pesa STK for enterprise invoicing —
// bank transfer (RTGS/EFT), cheque, or a Net-30 invoice is the norm.
// M-Pesa Business is still offered for small SMEs who want to move fast.

interface PickerProps {
  register: any
  watch: any
}

function PaymentMethodPicker({ register, watch }: PickerProps) {
  const method = watch('payment_method') || 'invoice_net30'

  const options: { value: 'invoice_net30' | 'bank_transfer' | 'cheque' | 'mpesa'; icon: any; label: string; blurb: string }[] = [
    { value: 'invoice_net30', icon: Receipt,    label: 'Request an invoice (Net 30)',  blurb: 'We email a PDF invoice. Pay within 30 days via any method.' },
    { value: 'bank_transfer', icon: Landmark,   label: 'Bank transfer (RTGS / EFT)',   blurb: 'Send from your business account. Bank details below.' },
    { value: 'cheque',        icon: FileText,   label: 'Cheque',                        blurb: 'Corporate cheque payable to Afya Yako Health Ltd.' },
    { value: 'mpesa',         icon: Smartphone, label: 'M-Pesa Business (small SMEs)',  blurb: 'Paybill 4-digit code — best for teams under ~20.' },
  ]

  return (
    <div>
      <div className="mb-3">
        <div className="font-bold text-gray-900 text-base">Preferred payment method</div>
        <div className="text-xs text-gray-500 mt-0.5">No card charged today. We'll follow up within 1 business day.</div>
      </div>

      <div className="space-y-2.5">
        {options.map(({ value, icon: Icon, label, blurb }) => {
          const active = method === value
          return (
            <label
              key={value}
              className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                active ? 'border-primary-600 bg-primary-50' : 'border-gray-200 bg-white hover:border-primary-300'
              }`}
            >
              <input
                type="radio"
                {...register('payment_method', { required: true })}
                value={value}
                defaultChecked={value === 'invoice_net30'}
                className="sr-only"
              />
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                <Icon size={18}/>
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm ${active ? 'text-primary-800' : 'text-gray-900'}`}>{label}</div>
                <div className="text-xs text-gray-600 mt-0.5">{blurb}</div>
              </div>
              <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${active ? 'border-primary-600 bg-primary-600' : 'border-gray-300'}`}>
                {active && <div className="w-2 h-2 bg-white rounded-full"/>}
              </div>
            </label>
          )
        })}
      </div>

      {(method === 'bank_transfer' || method === 'cheque') && (
        <BankDetails method={method as 'bank_transfer' | 'cheque'} />
      )}

      <div className="mt-4">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Billing notes (optional)</label>
        <textarea
          {...register('billing_notes')}
          rows={2}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Purchase-order number, VAT status, procurement contact… anything we should reference on the invoice."
        />
      </div>
    </div>
  )
}

function BankDetails({ method }: { method: 'bank_transfer' | 'cheque' }) {
  const [copied, setCopied] = useState<string | null>(null)
  const copy = (label: string, val: string) => {
    try { navigator.clipboard.writeText(val); setCopied(label); setTimeout(() => setCopied(null), 1500) } catch {}
  }

  const rows = method === 'bank_transfer' ? [
    ['Account name',  'Afya Yako Health Ltd'],
    ['Bank',          'Equity Bank Kenya'],
    ['Branch',        'Nairobi CBD'],
    ['Account number','1234567890123'],
    ['Swift code',    'EQBLKENAXXX'],
    ['Reference',     'Use your company name as reference'],
  ] : [
    ['Payable to',    'Afya Yako Health Ltd'],
    ['Deliver to',    'PO Box 12345 · 00100 Nairobi'],
    ['Reference',     'Write your company name on the back'],
    ['Clearance',     'Cheque cleared within 3–5 business days'],
  ]

  return (
    <div className="mt-3 bg-slate-900 rounded-xl p-5 text-white">
      <div className="text-xs uppercase tracking-widest text-primary-300 font-semibold mb-3">
        {method === 'bank_transfer' ? 'Bank details' : 'Cheque details'}
      </div>
      <div className="space-y-2 text-sm">
        {rows.map(([label, val]) => (
          <div key={label} className="flex items-center justify-between gap-3 border-b border-slate-800 py-2 last:border-b-0">
            <span className="text-slate-400 text-xs">{label}</span>
            <span className="font-mono text-white text-right">{val}</span>
            <button type="button" onClick={() => copy(label, val)}
              className={`text-xs px-2 py-1 rounded ${copied === label ? 'bg-emerald-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>
              {copied === label ? 'Copied' : <Copy size={12}/>}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

