import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { Download, Calendar, CheckCircle2, Clock, DollarSign, AlertCircle, Shield, FileText, Star, XCircle, HelpCircle } from 'lucide-react'

interface Session {
  session_id: number
  employee_code: string
  therapist_name: string
  therapist_license?: string
  session_date: string
  duration_minutes: number
  status: string
  cost: number
  payment_status: string
  attendance_verified?: boolean
  notes_filed?: boolean
  feedback_score?: number | null
}

interface Stats {
  total_sessions: number
  completed_sessions: number
  cancelled_sessions: number
  no_shows: number
  total_cost: number
  average_cost_per_session: number
  pending_payments: number
  attendance_verified_pct?: number
  notes_filed_pct?: number
  feedback_avg_rating?: number | null
  suspicious_count?: number
}

export default function EapSessionVerification() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('completed')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [complianceFilter, setComplianceFilter] = useState('all')
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7))
  const [monthlyReport, setMonthlyReport] = useState<any>(null)

  useEffect(() => {
    fetchSessions()
  }, [statusFilter, paymentFilter, complianceFilter])

  useEffect(() => {
    fetchMonthlyReport()
  }, [monthFilter])

  const fetchSessions = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (paymentFilter !== 'all') params.append('payment_status', paymentFilter)
      if (complianceFilter !== 'all') params.append('compliance', complianceFilter)

      const res = await api.get(`/eap/sessions?${params.toString()}`)
      setSessions(res.data.sessions)
      setStats(res.data.stats)
    } catch (err: any) {
      setError('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const fetchMonthlyReport = async () => {
    try {
      const res = await api.get(`/eap/report/monthly?month=${monthFilter}`)
      setMonthlyReport(res.data)
    } catch (err) {
      // Silent fail
    }
  }

  const downloadCSV = async () => {
    try {
      const response = await api.get('/eap/sessions/export', {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `eap-sessions-${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
    } catch (err) {
      alert('Failed to download CSV')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: string } = {
      completed: 'bg-green-100 text-green-700',
      scheduled: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
      'no-show': 'bg-orange-100 text-orange-700',
    }
    return styles[status] || 'bg-gray-100 text-gray-700'
  }

  const getPaymentBadge = (status: string) => {
    const styles: { [key: string]: string } = {
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      refunded: 'bg-red-100 text-red-700',
    }
    return styles[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Session Verification & Audit</h1>
        <p className="text-gray-600">View and verify all EAP sessions (anonymized for employee privacy)</p>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-900 font-semibold text-sm mb-1">🔒 Privacy Protection</p>
        <p className="text-blue-800 text-xs">
          Employee identities are protected. You see: therapist, date, duration, and cost. You will never see which employee had which session.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 flex gap-2">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-gray-600 text-sm mb-1 flex items-center gap-1">
              <CheckCircle2 size={16} /> Completed
            </p>
            <p className="text-2xl font-bold text-gray-900">{stats.completed_sessions}</p>
            <p className="text-xs text-gray-500 mt-1">of {stats.total_sessions} sessions</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-gray-600 text-sm mb-1 flex items-center gap-1">
              <DollarSign size={16} /> Total Cost
            </p>
            <p className="text-2xl font-bold text-gray-900">KES {stats.total_cost.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">
              Avg: {stats.average_cost_per_session.toFixed(0)} per session
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-gray-600 text-sm mb-1">❌ Cancelled</p>
            <p className="text-2xl font-bold text-gray-900">{stats.cancelled_sessions}</p>
            <p className="text-xs text-gray-500 mt-1">sessions cancelled</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-gray-600 text-sm mb-1">💳 Pending</p>
            <p className="text-2xl font-bold text-orange-600">
              KES {stats.pending_payments.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">awaiting payment</p>
          </div>
        </div>
      )}

      {/* Monthly Report */}
      {monthlyReport && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Monthly Report - {monthFilter}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-gray-600 text-sm">Sessions</p>
              <p className="text-2xl font-bold">{monthlyReport.summary.total_sessions}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Cost</p>
              <p className="text-2xl font-bold">KES {monthlyReport.summary.total_cost.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Avg Cost/Session</p>
              <p className="text-2xl font-bold">
                KES {monthlyReport.summary.avg_session_cost.toFixed(0)}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Active Employees</p>
              <p className="text-2xl font-bold">{monthlyReport.summary.active_employees}</p>
            </div>
          </div>

          {monthlyReport.by_therapist.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Sessions by Therapist</h3>
              <div className="space-y-2">
                {monthlyReport.by_therapist.map((therapist: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-semibold text-gray-900">{therapist.therapist}</p>
                      <p className="text-xs text-gray-600">
                        {therapist.sessions} sessions • Avg {therapist.avg_duration} min
                      </p>
                    </div>
                    <p className="font-bold text-gray-900">
                      KES {therapist.total_cost.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Audit compliance banner ─────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <ComplianceCard
            icon={Shield}
            label="Attendance verified"
            value={`${stats.attendance_verified_pct ?? 0}%`}
            hint="of completed sessions"
            tone={(stats.attendance_verified_pct ?? 0) >= 90 ? 'good' : (stats.attendance_verified_pct ?? 0) >= 60 ? 'warn' : 'bad'}
          />
          <ComplianceCard
            icon={FileText}
            label="Clinical notes filed"
            value={`${stats.notes_filed_pct ?? 0}%`}
            hint="of completed sessions"
            tone={(stats.notes_filed_pct ?? 0) >= 90 ? 'good' : (stats.notes_filed_pct ?? 0) >= 60 ? 'warn' : 'bad'}
          />
          <ComplianceCard
            icon={Star}
            label="Employee satisfaction"
            value={stats.feedback_avg_rating ? `${stats.feedback_avg_rating.toFixed(1)} / 5` : '—'}
            hint="from anonymous surveys"
            tone={(stats.feedback_avg_rating ?? 0) >= 4 ? 'good' : (stats.feedback_avg_rating ?? 0) >= 3 ? 'warn' : 'bad'}
          />
          <ComplianceCard
            icon={AlertCircle}
            label="Sessions to review"
            value={String(stats.suspicious_count ?? 0)}
            hint="missing attendance or notes"
            tone={(stats.suspicious_count ?? 0) === 0 ? 'good' : (stats.suspicious_count ?? 0) < 3 ? 'warn' : 'bad'}
            action={{
              label: 'View flagged',
              onClick: () => { setStatusFilter('completed'); setComplianceFilter('suspicious') },
            }}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Month</label>
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="scheduled">Scheduled</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No-Shows</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Payment</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Audit</label>
            <select
              value={complianceFilter}
              onChange={(e) => setComplianceFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All sessions</option>
              <option value="verified">✓ Fully verified only</option>
              <option value="suspicious">⚠ Flagged for review</option>
            </select>
          </div>
        </div>
        <button
          onClick={downloadCSV}
          className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition flex items-center gap-2"
        >
          <Download size={18} />
          Export as CSV
        </button>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-900">Session Records ({sessions.length})</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No sessions found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Therapist</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">License</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Audit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Cost (KES)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sessions.map((session) => (
                  <tr key={session.session_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{session.session_date}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{session.therapist_name}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {session.therapist_license || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <Clock size={14} className="inline mr-1" />
                      {session.duration_minutes} min
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(
                          session.status
                        )}`}
                      >
                        {session.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <AuditDot ok={session.attendance_verified} label="Attendance verified" icon={Shield}/>
                        <AuditDot ok={session.notes_filed} label="Clinical notes filed" icon={FileText}/>
                        <AuditDot
                          ok={session.feedback_score !== null && session.feedback_score !== undefined && session.feedback_score >= 3}
                          label={session.feedback_score ? `Feedback ${session.feedback_score}/5` : 'No feedback yet'}
                          icon={Star}
                          neutral={session.feedback_score === null || session.feedback_score === undefined}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {session.cost.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getPaymentBadge(
                          session.payment_status
                        )}`}
                      >
                        {session.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Info */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Audit Information</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>✓ All sessions recorded with timestamp and therapist verification</li>
          <li>✓ Cost tracking for billing and reconciliation</li>
          <li>✓ Employee anonymity maintained (only internal codes visible)</li>
          <li>✓ Export-ready data for compliance audits</li>
          <li>✓ Payment status tracking for finance reconciliation</li>
        </ul>
      </div>
    </div>
  )
}

// ── ComplianceCard ────────────────────────────────────────────────

interface ComplianceCardProps {
  icon: React.ComponentType<any>
  label: string
  value: string
  hint?: string
  tone: 'good' | 'warn' | 'bad'
  action?: { label: string; onClick: () => void }
}

const TONE_BG: Record<string, string> = {
  good: 'bg-emerald-50 border-emerald-200',
  warn: 'bg-amber-50 border-amber-200',
  bad:  'bg-rose-50 border-rose-200',
}
const TONE_TEXT: Record<string, string> = {
  good: 'text-emerald-800',
  warn: 'text-amber-800',
  bad:  'text-rose-800',
}
const TONE_ICON: Record<string, string> = {
  good: 'bg-emerald-100 text-emerald-700',
  warn: 'bg-amber-100 text-amber-700',
  bad:  'bg-rose-100 text-rose-700',
}

function ComplianceCard({ icon: Icon, label, value, hint, tone, action }: ComplianceCardProps) {
  return (
    <div className={`rounded-xl border p-4 ${TONE_BG[tone]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${TONE_ICON[tone]}`}><Icon size={16}/></div>
        {tone === 'good' && <CheckCircle2 size={16} className="text-emerald-600"/>}
      </div>
      <div className={`text-2xl font-black ${TONE_TEXT[tone]}`}>{value}</div>
      <div className={`text-xs font-semibold mt-0.5 ${TONE_TEXT[tone]}`}>{label}</div>
      {hint && <div className="text-[11px] text-gray-500 mt-0.5">{hint}</div>}
      {action && (
        <button onClick={action.onClick} className="mt-2 text-xs font-semibold underline text-gray-700 hover:text-gray-900">
          {action.label} →
        </button>
      )}
    </div>
  )
}

// Small tri-state pill used inside the sessions table's Audit column
interface AuditDotProps {
  ok: boolean | undefined
  label: string
  icon: React.ComponentType<any>
  neutral?: boolean
}

function AuditDot({ ok, label, icon: Icon, neutral }: AuditDotProps) {
  const cls = neutral
    ? 'bg-gray-100 text-gray-400 border-gray-200'
    : ok
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-rose-50 text-rose-700 border-rose-200'
  const Symbol = neutral ? HelpCircle : ok ? CheckCircle2 : XCircle
  return (
    <div className={`inline-flex items-center gap-1 px-1.5 py-1 rounded border ${cls}`} title={label}>
      <Icon size={11}/>
      <Symbol size={11}/>
    </div>
  )
}
