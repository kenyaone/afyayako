import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import { TrendingUp, CreditCard, Users, Building2, Wallet } from 'lucide-react'

export default function RevenueDashboard() {
  const user = useAuthStore(s => s.user)
  const navigate = useNavigate()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/dashboard'); return }
    api.get('/payments/revenue')
      .then(res => setData(res.data))
      .catch(err => console.error('Revenue error:', err))
      .finally(() => setLoading(false))
  }, [user, navigate])

  if (loading) return <div className="text-center py-10 text-gray-400">Loading revenue data...</div>
  if (!data) return <div className="text-center py-10 text-red-500">Failed to load revenue data</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Revenue Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">All revenue streams at a glance.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3">
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">KES {Math.round(data.total_platform_revenue).toLocaleString()}</div>
          <div className="text-sm font-medium text-gray-700 mt-1">Total Platform Revenue</div>
          <div className="text-xs text-gray-400 mt-0.5">Commissions + subscriptions</div>
        </div>

        <div className="card">
          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mb-3">
            <CreditCard size={20} className="text-primary-600" />
          </div>
          <div className="text-2xl font-bold text-primary-600">KES {Math.round(data.sessions.platform_share).toLocaleString()}</div>
          <div className="text-sm font-medium text-gray-700 mt-1">Session Commissions</div>
          <div className="text-xs text-gray-400 mt-0.5">{data.sessions.count} sessions × 35%</div>
        </div>

        <div className="card">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-3">
            <Users size={20} className="text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">KES {Math.round(data.subscriptions.revenue).toLocaleString()}</div>
          <div className="text-sm font-medium text-gray-700 mt-1">Subscription Revenue</div>
          <div className="text-xs text-gray-400 mt-0.5">{data.subscriptions.active_count} active subscribers</div>
        </div>

        <div className="card">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
            <Building2 size={20} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">KES {Math.round(data.corporate_eap.revenue).toLocaleString()}</div>
          <div className="text-sm font-medium text-gray-700 mt-1">Corporate EAP Revenue</div>
          <div className="text-xs text-gray-400 mt-0.5">{data.corporate_eap.active_count} active companies</div>
        </div>
      </div>

      {/* Session breakdown */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Session Revenue Breakdown</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Total session payments collected</span>
            <span className="font-semibold text-gray-900">KES {Math.round(data.sessions.total_revenue).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Platform commission (35%)</span>
            <span className="font-semibold text-green-600">KES {Math.round(data.sessions.platform_share).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Professional payouts (65%)</span>
            <span className="font-semibold text-blue-600">KES {Math.round(data.sessions.professional_share).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Professional earnings */}
      {data.sessions.by_professional && data.sessions.by_professional.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Earnings by Professional</h2>
          <div className="space-y-2">
            {data.sessions.by_professional.map((pro: any) => (
              <div key={pro.professional_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100">
                <div>
                  <div className="font-medium text-gray-900">{pro.name}</div>
                  <div className="text-xs text-gray-500">{pro.sessions} sessions</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">KES {Math.round(pro.total_amount).toLocaleString()}</div>
                  <div className="text-xs text-green-600 font-medium">Earns: KES {Math.round(pro.professional_share).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending payouts */}
      {data.payouts.pending_count > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Wallet size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-800">
              {data.payouts.pending_count} pending payout{data.payouts.pending_count > 1 ? 's' : ''} — KES {Math.round(data.payouts.pending_amount).toLocaleString()}
            </div>
            <p className="text-amber-700 text-sm mt-0.5">
              Professional earnings waiting to be disbursed via M-Pesa B2C.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
