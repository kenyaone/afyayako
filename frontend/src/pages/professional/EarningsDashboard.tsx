import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { DollarSign, TrendingUp, Wallet, Award } from 'lucide-react'

export default function EarningsDashboard() {
  const [data, setData] = useState<any>(null)
  const [dashboard, setDashboard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/professionals/me/analytics'),
      api.get('/professionals/me/dashboard')
    ])
      .then(([analyticsRes, dashboardRes]) => {
        setData(analyticsRes.data)
        setDashboard(dashboardRes.data)
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load earnings')
        console.error(err)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-10 text-gray-400">Loading earnings...</div>
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>
  if (!data || !dashboard) return null

  const summary = data.summary || {}
  const earnings = data.earnings_by_month || []
  const sessions = data.sessions_by_month || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Earnings</h1>
        <p className="text-gray-500 text-sm mt-1">Track your income and session analytics.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3">
            <DollarSign size={20} className="text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">KES {(summary.total_earned || 0).toLocaleString()}</div>
          <div className="text-sm font-medium text-gray-700 mt-1">Total Earned</div>
          <div className="text-xs text-gray-400 mt-0.5">From {summary.total_sessions} sessions (65% share)</div>
        </div>

        <div className="card">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
            <Wallet size={20} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">KES {(dashboard.pending_payouts || 0).toLocaleString()}</div>
          <div className="text-sm font-medium text-gray-700 mt-1">Pending Payout</div>
          <div className="text-xs text-gray-400 mt-0.5">Waiting to be disbursed</div>
        </div>

        <div className="card">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-3">
            <Award size={20} className="text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{summary.total_sessions}</div>
          <div className="text-sm font-medium text-gray-700 mt-1">Completed Sessions</div>
          <div className="text-xs text-gray-400 mt-0.5">Cancellation rate: {summary.cancellation_rate}%</div>
        </div>

        <div className="card">
          <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center mb-3">
            <TrendingUp size={20} className="text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{summary.avg_rating?.toFixed(1) || '—'}</div>
          <div className="text-sm font-medium text-gray-700 mt-1">Average Rating</div>
          <div className="text-xs text-gray-400 mt-0.5">From {summary.total_sessions} reviews</div>
        </div>
      </div>

      {/* Commission Explanation */}
      <div className="card bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-sm">ℹ</div>
          <div>
            <div className="font-semibold text-blue-900">Commission Structure</div>
            <div className="text-sm text-blue-800 mt-1">
              You earn <strong>65%</strong> of each session fee. The platform takes <strong>35%</strong> to cover operations and support. For example, a KES 1,000 session earns you KES 650.
            </div>
          </div>
        </div>
      </div>

      {/* Earnings by Month */}
      {earnings.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Earnings by Month</h2>
          <div className="space-y-2">
            {earnings.map((item: any) => (
              <div key={item.month} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-600">{item.month}</span>
                <span className="font-semibold text-green-600">KES {item.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sessions by Month */}
      {sessions.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Sessions by Month</h2>
          <div className="space-y-2">
            {sessions.map((item: any) => (
              <div key={item.month} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-600">{item.month}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{item.count} completed</span>
                  {item.cancelled > 0 && <span className="text-xs text-red-600">{item.cancelled} cancelled</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patient Feedback */}
      {summary.felt_heard_pct !== undefined && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Patient Feedback</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600">{summary.felt_heard_pct}%</div>
              <div className="text-xs text-gray-500 mt-1">Felt Heard</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{summary.felt_safe_pct}%</div>
              <div className="text-xs text-gray-500 mt-1">Felt Safe</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{summary.would_recommend_pct}%</div>
              <div className="text-xs text-gray-500 mt-1">Would Recommend</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
