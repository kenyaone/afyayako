import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import { TrendingUp, CreditCard, Users, Building2, Wallet } from 'lucide-react'

interface RevenueData {
  sessions: { count: number; total_revenue: number; platform_share: number; professional_share: number }
  payouts: { pending_count: number; pending_total: number }
  subscriptions: { active_count: number; revenue: number }
  corporate_eap: { active_count: number; revenue: number }
  total_platform_revenue: number
}

export default function RevenueDashboard() {
  const user = useAuthStore(s => s.user)
  const navigate = useNavigate()
  const [data, setData] = useState<RevenueData | null>(null)
  const [payouts, setPayouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/dashboard'); return }
    Promise.all([
      api.get('/payments/revenue'),
      api.get('/professionals/admin/all/?status=verified'),
    ]).then(([rev, pros]) => {
      setData(rev.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-10 text-gray-400">Loading revenue data...</div>
  if (!data) return null

  const cards = [
    {
      title: 'Total Platform Revenue',
      value: `KES ${Math.round(data.total_platform_revenue).toLocaleString()}`,
      sub: 'Commissions + subscriptions + EAP',
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Session Commissions',
      value: `KES ${Math.round(data.sessions.platform_share).toLocaleString()}`,
      sub: `${data.sessions.count} sessions × 20%`,
      icon: CreditCard,
      color: 'text-primary-600',
      bg: 'bg-primary-50',
    },
    {
      title: 'Subscription Revenue',
      value: `KES ${Math.round(data.subscriptions.revenue).toLocaleString()}`,
      sub: `${data.subscriptions.active_count} active subscribers`,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Corporate EAP Revenue',
      value: `KES ${Math.round(data.corporate_eap.revenue).toLocaleString()}`,
      sub: `${data.corporate_eap.active_count} active companies`,
      icon: Building2,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Revenue Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">All revenue streams at a glance.</p>
      </div>

      {/* Revenue cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ title, value, sub, icon: Icon, color, bg }) => (
          <div key={title} className="card">
            <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-sm font-medium text-gray-700 mt-1">{title}</div>
            <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Session breakdown */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Session Revenue Breakdown</h2>
        <div className="space-y-3">
          {[
            { label: 'Total session payments collected', value: data.sessions.total_revenue, color: 'text-gray-900' },
            { label: 'Platform commission (20%)', value: data.sessions.platform_share, color: 'text-green-600' },
            { label: 'Professional payouts (80%)', value: data.sessions.professional_share, color: 'text-blue-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-600">{label}</span>
              <span className={`font-semibold ${color}`}>KES {Math.round(value).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pending payouts alert */}
      {data.payouts.pending_count > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Wallet size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-800">
              {data.payouts.pending_count} pending payout{data.payouts.pending_count > 1 ? 's' : ''} — KES {Math.round(data.payouts.pending_total).toLocaleString()}
            </div>
            <p className="text-amber-700 text-sm mt-0.5">
              These are professional earnings waiting to be disbursed via M-Pesa B2C.
              Trigger payouts from the Django admin → Professional Payouts.
            </p>
          </div>
        </div>
      )}

      {/* Revenue model summary */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Revenue Model</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              channel: '1. Session Commission',
              model: '20% per session',
              example: 'KES 2,500 session → KES 500 platform',
              status: '✅ Live',
            },
            {
              channel: '2. Premium Subscriptions',
              model: 'KES 299/month per user',
              example: '1,000 users × KES 299 = KES 299K/mo',
              status: '✅ Live',
            },
            {
              channel: '3. Corporate EAP',
              model: 'KES 50K–500K/year per company',
              example: '10 companies = KES 1M–5M/year',
              status: '✅ Live',
            },
            {
              channel: '4. Pro Tier (Professionals)',
              model: 'KES 500/month per professional',
              example: '100 pros × KES 500 = KES 50K/mo',
              status: '✅ Live',
            },
          ].map(({ channel, model, example, status }) => (
            <div key={channel} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="font-medium text-gray-900 text-sm">{channel}</div>
              <div className="text-xs text-primary-700 font-medium mt-1">{model}</div>
              <div className="text-xs text-gray-500 mt-1">{example}</div>
              <div className="text-xs text-green-600 font-medium mt-2">{status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
