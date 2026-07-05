import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Building2, TrendingUp, Users, BarChart2, AlertCircle } from 'lucide-react'

interface EAPStats {
  company: string
  tier: string
  sessions_total: number
  sessions_used: number
  sessions_completed: number
  sessions_remaining: number
  utilisation_pct: number
  employees_enrolled: number
  condition_breakdown: Record<string, number>
  severity_breakdown: Record<string, number>
  monthly_trend: { month: string; count: number }[]
}

const CONDITION_LABELS: Record<string, string> = {
  phq9: 'Depression (PHQ-9)',
  gad7: 'Anxiety (GAD-7)',
  audit: 'Alcohol (AUDIT)',
  pgsi: 'Gambling (PGSI)',
  ftnd: 'Tobacco (FTND)',
}

const SEV_COLOR: Record<string, string> = {
  minimal: 'bg-green-400',
  mild: 'bg-yellow-400',
  moderate: 'bg-orange-400',
  'moderately severe': 'bg-red-400',
  severe: 'bg-red-600',
}

export default function EAPDashboard() {
  const [stats, setStats] = useState<EAPStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/corporate/eap-stats').then(r => setStats(r.data))
      .catch(e => setError(e.response?.data?.error ?? 'Could not load EAP stats'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-12 text-gray-400">Loading EAP dashboard…</div>

  if (error) return (
    <div className="card max-w-md mx-auto text-center py-10 text-gray-500">
      <AlertCircle size={40} className="mx-auto mb-3 text-amber-400" />
      <p className="font-medium">{error}</p>
      <p className="text-sm mt-1 text-gray-400">You need an active EAP subscription to view this dashboard.</p>
    </div>
  )

  if (!stats) return null

  const maxTrend = Math.max(...(stats.monthly_trend?.map(m => m.count) ?? [1]), 1)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 size={22} className="text-blue-600" /> EAP Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {stats.company} — {stats.tier} · All data is anonymised. No patient identities are shown.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Employees enrolled', value: stats.employees_enrolled, color: 'text-blue-600' },
          { label: 'Sessions completed', value: stats.sessions_completed, color: 'text-green-600' },
          { label: 'Sessions remaining', value: stats.sessions_remaining, color: 'text-teal-600' },
          { label: 'Utilisation', value: `${stats.utilisation_pct}%`, color: 'text-purple-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Usage bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Session allocation usage</span>
          <span className="text-sm text-gray-500">{stats.sessions_used} / {stats.sessions_total}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div className="h-3 rounded-full bg-gradient-to-r from-teal-500 to-green-500 transition-all"
            style={{ width: `${Math.min(stats.utilisation_pct, 100)}%` }} />
        </div>
        {stats.utilisation_pct > 80 && (
          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
            <AlertCircle size={11} /> Over 80% of sessions used. Consider upgrading your plan.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Condition breakdown */}
        {Object.keys(stats.condition_breakdown ?? {}).length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <BarChart2 size={16} className="text-purple-500" /> Condition breakdown
            </h2>
            <div className="space-y-2">
              {Object.entries(stats.condition_breakdown).map(([type, count]) => {
                const total = Object.values(stats.condition_breakdown).reduce((a, b) => a + b, 0)
                const pct = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                  <div key={type}>
                    <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                      <span>{CONDITION_LABELS[type] ?? type.toUpperCase()}</span>
                      <span>{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-purple-400" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Severity */}
        {Object.keys(stats.severity_breakdown ?? {}).length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Severity distribution</h2>
            <div className="space-y-2">
              {Object.entries(stats.severity_breakdown).map(([sev, count]) => {
                const total = Object.values(stats.severity_breakdown).reduce((a, b) => a + b, 0)
                const pct = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                  <div key={sev} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${SEV_COLOR[sev.toLowerCase()] ?? 'bg-gray-400'}`} />
                    <span className="text-xs text-gray-600 flex-1 capitalize">{sev}</span>
                    <span className="text-xs font-medium text-gray-700">{count}</span>
                    <span className="text-xs text-gray-400">({pct}%)</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Monthly trend */}
      {stats.monthly_trend?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-teal-500" /> Monthly sessions (last 6 months)
          </h2>
          <div className="flex items-end gap-2 h-32">
            {stats.monthly_trend.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-teal-700">{m.count}</span>
                <div className="w-full bg-teal-400 rounded-sm transition-all"
                  style={{ height: `${(m.count / maxTrend) * 88}px`, minHeight: m.count > 0 ? 4 : 0 }} />
                <span className="text-xs text-gray-400">{m.month.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>Privacy note:</strong> This dashboard shows aggregate, anonymised data only. No individual patient names, IDs, or session details are visible here. All data complies with the Kenya Data Protection Act 2019.
      </div>
    </div>
  )
}
