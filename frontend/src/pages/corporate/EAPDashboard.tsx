import { useEffect, useState } from 'react'
import api from '../../api/axios'
import {
  Building2, TrendingUp, Users, BarChart2, AlertCircle,
  Video, CheckCircle2, EyeOff, Sparkles, Download,
} from 'lucide-react'

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
  phq9:  'Depression (PHQ-9)',
  gad7:  'Anxiety (GAD-7)',
  audit: 'Alcohol (AUDIT)',
  pgsi:  'Gambling (PGSI)',
  ftnd:  'Tobacco (FTND)',
}

const SEV_COLOR: Record<string, string> = {
  minimal:              'bg-emerald-400',
  mild:                 'bg-amber-400',
  moderate:             'bg-orange-400',
  'moderately severe':  'bg-red-400',
  severe:               'bg-red-600',
}

const MONTH_LABEL = (yyyy_mm: string) => {
  const [, mm] = yyyy_mm.split('-')
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][(parseInt(mm ?? '', 10) || 1) - 1] ?? mm
}

export default function EAPDashboard() {
  const [stats, setStats]     = useState<EAPStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    api.get('/corporate/eap-stats').then(r => setStats(r.data))
      .catch(e => setError(e.response?.data?.error ?? 'Could not load EAP stats'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-3" />
        <p className="text-gray-500 text-sm">Loading your EAP overview…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto py-16">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
          <AlertCircle size={44} className="mx-auto mb-4 text-amber-500" />
          <h2 className="text-xl font-bold text-gray-900 mb-1">{error}</h2>
          <p className="text-gray-500 text-sm">You need an active EAP subscription to view this dashboard.</p>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const usagePct = Math.min(stats.utilisation_pct ?? 0, 100)
  const trend    = stats.monthly_trend ?? []
  const maxTrend = Math.max(...trend.map(m => m.count), 1)
  const totalCond = Object.values(stats.condition_breakdown ?? {}).reduce((a, b) => a + b, 0)
  const totalSev  = Object.values(stats.severity_breakdown  ?? {}).reduce((a, b) => a + b, 0)

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 md:px-8 py-6 flex items-start justify-between gap-4 flex-wrap"
             style={{ background: 'linear-gradient(120deg, #ecfeff 0%, #f0fdf4 100%)' }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
              <Building2 size={24} className="text-primary-700"/>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">{stats.company}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-primary-100 text-primary-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                  <Sparkles size={11}/> {stats.tier} tier · active
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <EyeOff size={11}/> Anonymised aggregate data only
                </span>
              </div>
            </div>
          </div>
          <a href="mailto:sales@afyayako.co.ke?subject=Request%20EAP%20monthly%20report"
             className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-200 hover:border-primary-300 text-gray-700 hover:text-primary-700 transition-colors">
            <Download size={14}/> Request PDF report
          </a>
        </div>
      </div>

      {/* ── KPI cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users}    label="Employees enrolled" value={stats.employees_enrolled} accent="teal"    subtitle="of your team"/>
        <KpiCard icon={Video}    label="Sessions completed" value={stats.sessions_completed} accent="emerald" subtitle="this period"/>
        <KpiCard icon={CheckCircle2} label="Sessions remaining" value={stats.sessions_remaining} accent="indigo" subtitle={`of ${stats.sessions_total} covered`}/>
        <KpiCard icon={TrendingUp} label="Utilisation" value={`${stats.utilisation_pct ?? 0}%`} accent="orange" subtitle="of your allocation"/>
      </div>

      {/* ── Utilisation bar ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <div className="text-base font-bold text-gray-900">Session allocation</div>
            <div className="text-xs text-gray-500 mt-0.5">Reflects delivered + booked sessions in the current period</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-gray-900">{stats.sessions_used}<span className="text-base text-gray-400 font-normal"> / {stats.sessions_total}</span></div>
            <div className="text-xs text-gray-500">{usagePct}% used</div>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full transition-all"
            style={{
              width: `${usagePct}%`,
              background: usagePct > 80
                ? 'linear-gradient(90deg, #f97316 0%, #ef4444 100%)'
                : 'linear-gradient(90deg, #14b8a6 0%, #10b981 100%)',
            }}
          />
        </div>
        {usagePct > 80 && (
          <div className="mt-3 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5"/>
            <div>
              <div className="font-semibold">Over 80% of sessions used</div>
              <div className="text-xs text-orange-700 mt-0.5">Consider upgrading your plan before the next renewal.</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Trend + Conditions ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Monthly trend (spans 2 cols) */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <TrendingUp size={16} className="text-teal-600"/> Sessions trend
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Last 6 months</p>
            </div>
          </div>
          {trend.length === 0 ? (
            <div className="py-14 text-center text-sm text-gray-400">
              No completed sessions in this period yet.
            </div>
          ) : (
            <div className="flex items-end gap-3 h-40 pt-2">
              {trend.map((m, i) => {
                const h = Math.round((m.count / maxTrend) * 130)
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-xs font-bold text-gray-700">{m.count}</span>
                    <div
                      className="w-full rounded-t-md transition-all group-hover:opacity-80"
                      style={{
                        height: `${Math.max(h, m.count > 0 ? 6 : 2)}px`,
                        background: 'linear-gradient(180deg, #f97316 0%, #0d9488 100%)',
                      }}
                    />
                    <span className="text-[11px] text-gray-500 font-medium">{MONTH_LABEL(m.month)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Severity distribution */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 text-base mb-4">Severity mix</h2>
          {totalSev === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">No assessments yet.</div>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(stats.severity_breakdown).map(([sev, count]) => {
                const pct = totalSev > 0 ? Math.round((count / totalSev) * 100) : 0
                return (
                  <div key={sev}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="capitalize text-gray-700">{sev}</span>
                      <span className="text-gray-500">{count} · {pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${SEV_COLOR[sev.toLowerCase()] ?? 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Condition breakdown ────────────────────────────────── */}
      {totalCond > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={16} className="text-indigo-600"/>
            <h2 className="font-bold text-gray-900 text-base">What your team is presenting with</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            {Object.entries(stats.condition_breakdown).map(([type, count]) => {
              const pct = totalCond > 0 ? Math.round((count / totalCond) * 100) : 0
              return (
                <div key={type}>
                  <div className="flex justify-between text-xs text-gray-700 mb-1 font-medium">
                    <span>{CONDITION_LABELS[type] ?? type.toUpperCase()}</span>
                    <span className="text-gray-500">{count} <span className="text-gray-400">· {pct}%</span></span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Privacy note ───────────────────────────────────────── */}
      <div className="bg-primary-50 border border-primary-200 rounded-2xl p-5 flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
          <EyeOff size={16} className="text-primary-700"/>
        </div>
        <div className="text-sm text-primary-900">
          <div className="font-bold mb-1">Everything here is anonymous.</div>
          <p className="text-primary-800 leading-relaxed">
            This dashboard shows aggregate data only — never employee names, IDs, or session content.
            All data complies with the <strong>Kenya Data Protection Act 2019</strong> and the
            <strong> MoH Tele-Mental Health guidelines (2021)</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Small components ────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ComponentType<any>
  label: string
  value: number | string
  accent: 'teal' | 'emerald' | 'indigo' | 'orange'
  subtitle?: string
}

const ACCENT_STYLE = {
  teal:    { chip: 'bg-teal-100 text-teal-700',       ring: 'from-teal-500/20' },
  emerald: { chip: 'bg-emerald-100 text-emerald-700', ring: 'from-emerald-500/20' },
  indigo:  { chip: 'bg-indigo-100 text-indigo-700',   ring: 'from-indigo-500/20' },
  orange:  { chip: 'bg-orange-100 text-orange-700',   ring: 'from-orange-500/20' },
}

function KpiCard({ icon: Icon, label, value, accent, subtitle }: KpiCardProps) {
  const a = ACCENT_STYLE[accent]
  return (
    <div className="relative bg-white rounded-2xl border border-gray-200 shadow-sm p-5 overflow-hidden">
      <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${a.ring} to-transparent`} />
      <div className={`relative w-9 h-9 rounded-lg ${a.chip} flex items-center justify-center mb-3`}>
        <Icon size={18}/>
      </div>
      <div className="relative text-3xl font-black text-gray-900">{value}</div>
      <div className="relative text-xs font-semibold text-gray-600 mt-1">{label}</div>
      {subtitle && <div className="relative text-[11px] text-gray-400 mt-0.5">{subtitle}</div>}
    </div>
  )
}
