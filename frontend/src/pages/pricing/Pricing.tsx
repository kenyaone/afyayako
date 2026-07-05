import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import { CheckCircle, Zap, Stethoscope, Clock, Mail } from 'lucide-react'

interface Plan {
  id: number; name: string; tier: string; price_kes: number
  interval: string; features: string[]; assessment_limit: number; lesson_limit: number
}

export default function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const user = useAuthStore(s => s.user)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/subscriptions/plans')
      .then(r => setPlans(r.data.plans ?? r.data))
      .finally(() => setLoading(false))
  }, [])

  const userPlans = plans.filter(p => p.tier !== 'pro')
  const proPlans  = plans.filter(p => p.tier === 'pro')

  const borderStyle: Record<string, string> = {
    free:    'border-gray-200',
    premium: 'border-teal-400 ring-2 ring-teal-300',
    pro:     'border-orange-400 ring-2 ring-orange-300',
  }

  if (loading) return <div className="text-center py-16 text-gray-400">Loading plans…</div>

  return (
    <div className="space-y-14 max-w-5xl mx-auto">

      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Simple, Transparent Pricing</h1>
        <p className="text-gray-500 mt-2">Start free. Upgrade when you're ready.</p>
      </div>

      {/* Coming soon notice */}
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
        <Clock size={18} className="text-amber-600 flex-shrink-0" />
        <div className="text-sm text-amber-800">
          <strong>Paid plans are coming soon.</strong> Payment processing is being set up.
          Email <a href="mailto:support@mhapke.com" className="underline font-medium">support@mhapke.com</a> to be notified when it goes live.
        </div>
      </div>

      {/* Personal plans */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Zap size={18} className="text-teal-600" /> Personal Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {userPlans.map(plan => (
            <div key={plan.id} className={`card border-2 ${borderStyle[plan.tier]} relative flex flex-col`}>
              {plan.tier === 'premium' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
              <div className="mb-4">
                {plan.price_kes === 0 ? (
                  <span className="text-3xl font-bold text-gray-900">Free</span>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-teal-700">KES {plan.price_kes.toLocaleString()}</span>
                    <span className="text-gray-500 text-sm">/month</span>
                  </div>
                )}
              </div>
              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={14} className="text-teal-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.price_kes === 0 ? (
                <Link to={user ? '/dashboard' : '/signup'} className="btn-secondary text-center text-sm py-2.5">
                  {user ? 'Current Plan' : 'Get Started Free'}
                </Link>
              ) : (
                <button
                  onClick={() => navigate('/subscribe', { state: { plan } })}
                  className="btn-primary text-sm py-2.5 flex items-center justify-center gap-2"
                >
                  <Clock size={14} /> Coming Soon
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Professional Pro plan */}
      {proPlans.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Stethoscope size={18} className="text-orange-500" /> For Mental Health Professionals
          </h2>
          <div className="max-w-sm">
            {proPlans.map(plan => (
              <div key={plan.id} className={`card border-2 ${borderStyle['pro']}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-bold text-orange-600">KES {plan.price_kes.toLocaleString()}</span>
                      <span className="text-gray-500 text-sm">/month</span>
                    </div>
                  </div>
                  <Stethoscope size={28} className="text-orange-400 mt-1" />
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle size={14} className="text-orange-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/subscribe', { state: { plan } })}
                  className="w-full text-sm py-2.5 border border-orange-300 text-orange-700 rounded-lg flex items-center justify-center gap-2 hover:bg-orange-50 transition-colors"
                >
                  <Clock size={14} /> Coming Soon
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How session revenue works */}
      <div className="card bg-gray-50 border border-gray-200">
        <h2 className="font-semibold text-gray-800 mb-4">How revenue works for professionals</h2>
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          {[
            { label: 'Patient pays', value: 'KES 2,500', style: 'text-gray-700 text-base font-semibold' },
            { label: 'You receive (65%)', value: 'KES 1,625', style: 'text-green-600 text-xl font-bold' },
            { label: 'Platform fee (35%)', value: 'KES 875', style: 'text-gray-500 text-base' },
          ].map(({ label, value, style }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className={style}>{value}</div>
              <div className="text-gray-400 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">Payouts within 24 hours of each completed session.</p>
      </div>

      {/* EAP teaser */}
      <div className="bg-slate-800 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-5">
        <div>
          <h2 className="text-lg font-bold mb-1">Corporate Employee Assistance Programme</h2>
          <p className="text-slate-300 text-sm">Private mental health support for your team — coming soon. Contact us for early access.</p>
        </div>
        <a
          href="mailto:corporate@mhapke.com"
          className="flex items-center gap-2 bg-white text-slate-800 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-slate-100 transition-colors flex-shrink-0"
        >
          <Mail size={15} /> Contact Us
        </a>
      </div>

    </div>
  )
}
