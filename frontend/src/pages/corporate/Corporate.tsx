import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'
import { Building2, CheckCircle, Users, BarChart3, Shield, TrendingDown, Zap } from 'lucide-react'

interface EAPTier { id: number; name: string; min_employees: number; max_employees: number; price_kes_annual: string; sessions_per_employee: number; features: string[] }
interface FormData {
  company_name: string; contact_name: string; contact_email: string; contact_phone: string
  industry: string; employee_count: number; kra_pin: string; tier_id: number; phone: string
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
    <div className="max-w-lg mx-auto card text-center py-14 mt-8">
      <Building2 size={52} className="text-blue-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Received!</h2>
      <p className="text-gray-600 mb-2">Check your phone for the M-Pesa payment request.</p>
      <p className="text-gray-500 text-sm mb-6">Once payment is confirmed, your company account will be activated and your HR contact will receive onboarding instructions.</p>
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800 text-left space-y-1">
        <div>✅ Account activated within 1 business day</div>
        <div>✅ Employee access codes sent to HR contact</div>
        <div>✅ Onboarding call scheduled</div>
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
            const annualPerEmployee = Number(tier.price_kes_annual) || 0
            const monthlyPerEmployee = annualPerEmployee ? Math.round(annualPerEmployee / 12) : 0
            const isCustom = annualPerEmployee === 0
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
                ) : (
                  <>
                    <div className="text-xl font-bold text-primary-700">
                      KSh {monthlyPerEmployee.toLocaleString()}
                      <span className="text-sm text-gray-500 font-normal"> per employee / month</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ≈ KSh {annualPerEmployee.toLocaleString()} per employee / year
                    </div>
                  </>
                )}
                <div className="text-xs text-gray-600 mt-2">
                  {tier.sessions_per_employee} in-person session{tier.sessions_per_employee === 1 ? '' : 's'} per employee / year · 24/7 tele-therapy
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

        {selectedTier && (
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="font-medium text-blue-900 mb-2">Order Summary</div>
            <div className="flex justify-between text-sm text-blue-800">
              <span>{selectedTier.name} EAP Package (1 year)</span>
              <span className="font-bold">KES {Number(selectedTier.price_kes_annual).toLocaleString()}</span>
            </div>
            <div className="text-xs text-blue-600 mt-1">{watch('employee_count') || selectedTier.max_employees} employees × {selectedTier.sessions_per_employee} sessions each</div>
          </div>
        )}

        <input type="hidden" {...register('tier_id')} value={selectedTier?.id} />

        <button type="submit" disabled={loading || !selectedTier} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50">
          {loading ? 'Submitting...' : `Apply & Pay KES ${selectedTier ? Number(selectedTier.price_kes_annual).toLocaleString() : '—'}`}
        </button>
      </form>
    </div>
  )
}
