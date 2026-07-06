import { useEffect, useState } from 'react'
import api from '../../api/axios'
import {
  Building2, TrendingUp, Users, BarChart2, AlertCircle,
  Video, CheckCircle2, EyeOff, Sparkles, Download, Activity,
  Heart, Shield, ArrowUpRight,
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts'

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

const CONDITION_COLOUR: Record<string, string> = {
  phq9:  '#8b5cf6',
  gad7:  '#06b6d4',
  audit: '#f59e0b',
  pgsi:  '#10b981',
  ftnd:  '#f43f5e',
}

const SEV_COLOUR: Record<string, string> = {
  minimal:              '#10b981',
  mild:                 '#f59e0b',
  moderate:             '#f97316',
  'moderately severe':  '#ef4444',
  severe:               '#b91c1c',
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

  if (loading) return (
    <div className="max-w-5xl mx-auto py-16 text-center">
      <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-3" />
      <p className="text-gray-500 text-sm">Loading your EAP overview…</p>
    </div>
  )

  if (error) return (
    <div className="max-w-lg mx-auto py-16">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
        <AlertCircle size={44} className="mx-auto mb-4 text-amber-500" />
        <h2 className="text-xl font-bold text-gray-900 mb-1">{error}</h2>
        <p className="text-gray-500 text-sm">You need an active EAP subscription to view this dashboard.</p>
      </div>
    </div>
  )

  if (!stats) return null

  const usagePct = Math.min(Math.max(stats.utilisation_pct ?? 0, 0), 100)
  const trend    = stats.monthly_trend ?? []
  const trendMax = Math.max(...trend.map(m => m.count), 1)
  const trendLast = trend.at(-1)?.count ?? 0
  const trendPrev = trend.at(-2)?.count ?? 0
  const trendDelta = trendLast - trendPrev
  const totalCond = Object.values(stats.condition_breakdown ?? {}).reduce((a, b) => a + b, 0)
  const totalSev  = Object.values(stats.severity_breakdown  ?? {}).reduce((a, b) => a + b, 0)

  const enrollPct = stats.employees_enrolled > 0 && stats.sessions_total > 0
    ? Math.min(100, Math.round((stats.employees_enrolled / (stats.sessions_total / 4)) * 100))
    : 0

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Hero header ────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl text-white p-8 md:p-10 shadow-xl"
           style={{ background: 'linear-gradient(120deg, #0f766e 0%, #0d9488 40%, #7c3aed 100%)' }}>
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-400/20 rounded-full blur-3xl" />

        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/25 text-white text-xs px-3 py-1.5 rounded-full mb-4 font-semibold uppercase tracking-wide">
              <Sparkles size={13} className="text-yellow-200"/> {stats.tier} tier · active
            </div>
            <h1 className="text-3xl md:text-4xl font-black leading-tight">{stats.company}</h1>
            <p className="text-white/85 mt-2 text-sm md:text-base flex items-center gap-2">
              <EyeOff size={14}/> Anonymised aggregate data — no employee identities anywhere on this page.
            </p>
          </div>
          <a href="mailto:sales@afyayako.co.ke?subject=Request%20EAP%20monthly%20report"
             className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur transition-colors">
            <Download size={14}/> PDF report
          </a>
        </div>

        {/* Big hero metric */}
        <div className="relative mt-8 grid grid-cols-3 gap-6 max-w-3xl">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/70 mb-1">This month</div>
            <div className="text-4xl md:text-5xl font-black leading-none">{trendLast}</div>
            <div className="text-xs text-white/80 mt-1">sessions delivered</div>
            {trendDelta !== 0 && (
              <div className={`inline-flex items-center gap-1 text-xs font-bold mt-2 px-2 py-1 rounded-full ${trendDelta > 0 ? 'bg-emerald-400/25 text-emerald-100' : 'bg-orange-400/25 text-orange-100'}`}>
                <ArrowUpRight size={11} className={trendDelta > 0 ? '' : 'rotate-90'}/>
                {trendDelta > 0 ? '+' : ''}{trendDelta} vs last month
              </div>
            )}
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-white/70 mb-1">Team reached</div>
            <div className="text-4xl md:text-5xl font-black leading-none">{stats.employees_enrolled}</div>
            <div className="text-xs text-white/80 mt-1">employees enrolled</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-white/70 mb-1">Utilisation</div>
            <div className="text-4xl md:text-5xl font-black leading-none">{stats.utilisation_pct ?? 0}<span className="text-2xl text-white/70">%</span></div>
            <div className="text-xs text-white/80 mt-1">of allocation used</div>
          </div>
        </div>
      </div>

      {/* ── KPI row: 4 accent cards ────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Video}        label="Sessions completed" value={stats.sessions_completed} accent="emerald" tint="from-emerald-500/10 to-transparent"/>
        <KpiCard icon={CheckCircle2} label="Sessions remaining" value={stats.sessions_remaining} accent="indigo"  tint="from-indigo-500/10 to-transparent"/>
        <KpiCard icon={Activity}     label="Cost this month"    value={`KSh ${((stats.sessions_completed || 0) * 490).toLocaleString()}`} accent="orange" tint="from-orange-500/10 to-transparent" mono/>
        <KpiCard icon={Shield}       label="Anonymity status"   value="Guaranteed" accent="rose" tint="from-rose-500/10 to-transparent" mono/>
      </div>

      {/* ── Utilisation ring + trend chart ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Radial usage */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="mb-1 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center"><Activity size={16}/></div>
            <h2 className="font-bold text-gray-900 text-base">Session allocation</h2>
          </div>
          <p className="text-xs text-gray-500 mb-3">Sessions used vs total covered this period</p>

          <div className="relative w-full h-52">
            <ResponsiveContainer>
              <RadialBarChart innerRadius="66%" outerRadius="100%" barSize={16}
                data={[{ name: 'Used', value: usagePct, fill: usagePct > 80 ? '#f97316' : '#0d9488' }]}
                startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background={{ fill: '#f1f5f9' }} dataKey="value" cornerRadius={10}/>
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-black text-gray-900">{usagePct}%</div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">{stats.sessions_used} / {stats.sessions_total}</div>
            </div>
          </div>

          {usagePct > 80 && (
            <div className="mt-3 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-800">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5"/>
              <div><strong>80%+ used.</strong> Consider upgrading before the next renewal.</div>
            </div>
          )}
        </div>

        {/* Trend area chart */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:col-span-2">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center"><TrendingUp size={16}/></div>
              <h2 className="font-bold text-gray-900 text-base">Sessions trend</h2>
            </div>
            <div className="text-xs text-gray-500">Last 6 months</div>
          </div>

          <div className="w-full h-56 mt-2">
            {trend.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">No sessions yet.</div>
            ) : (
              <ResponsiveContainer>
                <AreaChart data={trend.map(t => ({ month: MONTH_LABEL(t.month), count: t.count }))} margin={{ top: 6, right: 6, left: -8, bottom: 4 }}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#f97316" stopOpacity={0.85} />
                      <stop offset="55%"  stopColor="#ec4899" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false}/>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    cursor={{ stroke: '#0d9488', strokeDasharray: '4 4' }}
                    contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0', fontSize: 12 }}
                    labelStyle={{ fontWeight: 700 }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#f97316" strokeWidth={3} fill="url(#trendFill)"/>
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mt-3 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-xs text-gray-500">Peak month</div>
              <div className="font-bold text-gray-900">{trendMax}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Total (6mo)</div>
              <div className="font-bold text-gray-900">{trend.reduce((a, b) => a + b.count, 0)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Avg / month</div>
              <div className="font-bold text-gray-900">{trend.length ? Math.round(trend.reduce((a, b) => a + b.count, 0) / trend.length) : 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Conditions + Severity split ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Conditions */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center"><BarChart2 size={16}/></div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">What your team is presenting with</h2>
              <p className="text-xs text-gray-500">Screener types across all completed assessments</p>
            </div>
          </div>
          {totalCond === 0 ? (
            <div className="py-14 text-center text-sm text-gray-400">No assessments completed yet.</div>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.condition_breakdown).map(([type, count]) => {
                const pct = totalCond > 0 ? Math.round((count / totalCond) * 100) : 0
                const colour = CONDITION_COLOUR[type] ?? '#64748b'
                return (
                  <div key={type}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-gray-800">{CONDITION_LABELS[type] ?? type.toUpperCase()}</span>
                      <span className="text-gray-500 font-mono">{count} · {pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div className="h-2.5 rounded-full transition-all"
                        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${colour} 0%, ${colour}cc 100%)` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Severity */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center"><Heart size={16}/></div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">Severity mix</h2>
              <p className="text-xs text-gray-500">Across all assessment types</p>
            </div>
          </div>
          {totalSev === 0 ? (
            <div className="py-14 text-center text-sm text-gray-400">No assessments yet.</div>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.severity_breakdown).map(([sev, count]) => {
                const pct = totalSev > 0 ? Math.round((count / totalSev) * 100) : 0
                const colour = SEV_COLOUR[sev.toLowerCase()] ?? '#94a3b8'
                return (
                  <div key={sev}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="capitalize font-semibold text-gray-800">{sev}</span>
                      <span className="text-gray-500 font-mono">{count} · {pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div className="h-2.5 rounded-full" style={{ width: `${pct}%`, background: colour }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Privacy card ───────────────────────────────────────── */}
      <div className="rounded-2xl p-6 flex items-start gap-4"
           style={{ background: 'linear-gradient(135deg, #ecfeff 0%, #f0fdf4 100%)', border: '1px solid #a7f3d0' }}>
        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
          <EyeOff size={20} className="text-primary-700"/>
        </div>
        <div className="text-sm text-primary-900">
          <div className="font-bold text-base mb-1">Everything here is anonymous.</div>
          <p className="text-primary-800 leading-relaxed">
            Aggregate data only — never employee names, IDs, or session content.
            Compliant with the <strong>Kenya Data Protection Act 2019</strong> and the
            <strong> MoH Tele-Mental Health guidelines (2021)</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── KPI card ────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ComponentType<any>
  label: string
  value: number | string
  accent: 'teal' | 'emerald' | 'indigo' | 'orange' | 'rose'
  tint: string
  mono?: boolean
}

const ACCENT_STYLE: Record<string, string> = {
  teal:    'bg-teal-100 text-teal-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  indigo:  'bg-indigo-100 text-indigo-700',
  orange:  'bg-orange-100 text-orange-700',
  rose:    'bg-rose-100 text-rose-700',
}

function KpiCard({ icon: Icon, label, value, accent, tint, mono }: KpiCardProps) {
  return (
    <div className="relative bg-white rounded-2xl border border-gray-200 shadow-sm p-5 overflow-hidden">
      <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br ${tint}`} />
      <div className={`relative w-9 h-9 rounded-lg ${ACCENT_STYLE[accent]} flex items-center justify-center mb-3`}>
        <Icon size={18}/>
      </div>
      <div className={`relative ${mono ? 'text-xl' : 'text-3xl'} font-black text-gray-900`}>{value}</div>
      <div className="relative text-xs font-semibold text-gray-600 mt-1">{label}</div>
    </div>
  )
}
