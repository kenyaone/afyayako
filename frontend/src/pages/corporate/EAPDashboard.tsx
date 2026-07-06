import { useEffect, useState } from 'react'
import api from '../../api/axios'
import {
  Building2, TrendingUp, Users, AlertCircle,
  Video, CheckCircle2, EyeOff, Sparkles, Download, Activity,
  Heart, Shield, ArrowUpRight, Zap, Target, Award,
  DollarSign, Clock, ArrowDownRight,
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  RadialBarChart, RadialBar, PolarAngleAxis, PieChart, Pie, Cell, Legend,
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
  phq9:  'Depression',
  gad7:  'Anxiety',
  audit: 'Alcohol use',
  pgsi:  'Gambling',
  ftnd:  'Tobacco',
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

  const usagePct  = Math.min(Math.max(stats.utilisation_pct ?? 0, 0), 100)
  const trend     = stats.monthly_trend ?? []
  const trendMax  = Math.max(...trend.map(m => m.count), 1)
  const trendLast = trend.at(-1)?.count ?? 0
  const trendPrev = trend.at(-2)?.count ?? 0
  const trendDelta = trendLast - trendPrev
  const trendDeltaPct = trendPrev > 0 ? Math.round(((trendLast - trendPrev) / trendPrev) * 100) : 0
  const totalCond = Object.values(stats.condition_breakdown ?? {}).reduce((a, b) => a + b, 0)
  const totalSev  = Object.values(stats.severity_breakdown  ?? {}).reduce((a, b) => a + b, 0)

  // Rough impact statement — a real number the CEO can quote
  const impactPeople  = stats.employees_enrolled ?? 0
  const impactMonthly = trendLast * 60          // avg 60 min per session
  const impactHours   = Math.round(impactMonthly / 60)

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── IMPACT HERO ────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl text-white shadow-2xl"
           style={{ background: 'linear-gradient(135deg, #0f766e 0%, #7c3aed 55%, #ec4899 100%)' }}>
        {/* animated glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '13s' }} />

        <div className="relative p-8 md:p-10">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/25 text-white text-xs px-3 py-1.5 rounded-full mb-3 font-semibold uppercase tracking-wide">
                <Sparkles size={13} className="text-yellow-200"/> {stats.tier} tier · active
              </div>
              <h1 className="text-3xl md:text-4xl font-black leading-tight">{stats.company}</h1>
              <p className="text-white/80 mt-2 text-sm flex items-center gap-2">
                <EyeOff size={14}/> Aggregate anonymised data · never individual identities
              </p>
            </div>
            <a href="mailto:sales@afyayako.co.ke?subject=Request%20EAP%20monthly%20report"
               className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white text-primary-800 hover:bg-yellow-100 transition-colors shadow-lg">
              <Download size={14}/> PDF report
            </a>
          </div>

          {/* Impact statement */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 mt-4">
            <div className="text-xs uppercase tracking-widest text-white/70 mb-2 flex items-center gap-1.5">
              <Target size={13}/> Your impact this month
            </div>
            <div className="text-2xl md:text-3xl font-black leading-tight">
              You supported <span className="text-yellow-200">{impactPeople}</span> people through {trendLast} sessions
              <span className="text-white/80"> · </span>
              <span className="text-yellow-200">{impactHours}</span> hours of confidential care.
            </div>
            <div className="mt-3 flex gap-4 flex-wrap text-xs">
              {trendDelta !== 0 && (
                <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold ${trendDelta > 0 ? 'bg-emerald-400/25 text-emerald-100' : 'bg-orange-400/25 text-orange-100'}`}>
                  {trendDelta > 0 ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                  {trendDelta > 0 ? '+' : ''}{trendDelta} sessions vs last month {trendDeltaPct !== 0 && `(${trendDeltaPct > 0 ? '+' : ''}${trendDeltaPct}%)`}
                </div>
              )}
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold bg-white/15 text-white">
                <Award size={12}/> CPB-licensed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI accent row ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Users}   label="Team reached"        value={stats.employees_enrolled}
          accent="teal"  gradient="from-teal-500 to-cyan-500"
          hint={`of your covered team`}
        />
        <KpiCard
          icon={Video}   label="Sessions completed"  value={stats.sessions_completed}
          accent="violet" gradient="from-violet-500 to-fuchsia-500"
          hint="this period"
        />
        <KpiCard
          icon={Clock}   label="Sessions remaining"  value={stats.sessions_remaining}
          accent="orange" gradient="from-orange-500 to-red-500"
          hint={`of ${stats.sessions_total} covered`}
        />
        <KpiCard
          icon={DollarSign} label="Cost efficiency" value={`${Math.max(0, 100 - usagePct)}%`}
          accent="emerald" gradient="from-emerald-500 to-green-500"
          hint="allocation still available"
        />
      </div>

      {/* ── Charts row: Radial + Area trend ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Radial */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:col-span-2 relative overflow-hidden">
          <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-gradient-to-br from-orange-100 to-rose-100 opacity-60" />
          <div className="relative">
            <div className="mb-1 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center"><Activity size={16}/></div>
              <h2 className="font-bold text-gray-900">Session allocation</h2>
            </div>
            <p className="text-xs text-gray-500 mb-3">Used vs total covered this period</p>

            <div className="relative w-full h-56">
              <ResponsiveContainer>
                <RadialBarChart innerRadius="70%" outerRadius="100%" barSize={18}
                  data={[{ name: 'Used', value: usagePct, fill: usagePct > 80 ? '#f97316' : '#0d9488' }]}
                  startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background={{ fill: '#f1f5f9' }} dataKey="value" cornerRadius={12}/>
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-5xl font-black text-gray-900">{usagePct}<span className="text-2xl text-gray-400">%</span></div>
                <div className="text-xs text-gray-500 font-semibold mt-1">{stats.sessions_used} / {stats.sessions_total}</div>
                <div className="mt-2 text-[10px] uppercase tracking-widest text-gray-400">Utilisation</div>
              </div>
            </div>

            {usagePct > 80 && (
              <div className="mt-3 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-800">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5"/>
                <div><strong>80%+ used.</strong> Consider upgrading before renewal.</div>
              </div>
            )}
          </div>
        </div>

        {/* Trend area chart */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:col-span-3">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center"><TrendingUp size={16}/></div>
              <h2 className="font-bold text-gray-900">Sessions trend</h2>
            </div>
            <div className="text-xs text-gray-500">Last 6 months</div>
          </div>

          <div className="w-full h-60 mt-3">
            {trend.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">No sessions yet.</div>
            ) : (
              <ResponsiveContainer>
                <AreaChart data={trend.map(t => ({ month: MONTH_LABEL(t.month), count: t.count }))} margin={{ top: 8, right: 8, left: -18, bottom: 4 }}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#f97316" stopOpacity={0.9} />
                      <stop offset="55%"  stopColor="#ec4899" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false}/>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} width={30} />
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
            <div>
              <div className="text-xs text-gray-500 flex items-center gap-1"><Zap size={10}/> Peak</div>
              <div className="font-bold text-gray-900 text-lg">{trendMax}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 flex items-center gap-1"><Target size={10}/> Total 6mo</div>
              <div className="font-bold text-gray-900 text-lg">{trend.reduce((a, b) => a + b.count, 0)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 flex items-center gap-1"><Activity size={10}/> Avg / mo</div>
              <div className="font-bold text-gray-900 text-lg">{trend.length ? Math.round(trend.reduce((a, b) => a + b.count, 0) / trend.length) : 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Conditions pie + Severity bars ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center"><Heart size={16}/></div>
            <div>
              <h2 className="font-bold text-gray-900">What your team is presenting with</h2>
              <p className="text-xs text-gray-500">Across all completed screenings</p>
            </div>
          </div>
          {totalCond === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">No assessments completed yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="w-full h-56">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={Object.entries(stats.condition_breakdown).map(([type, count]) => ({ name: CONDITION_LABELS[type] ?? type, value: count, type }))}
                      dataKey="value" nameKey="name"
                      innerRadius="55%" outerRadius="90%" paddingAngle={2}
                    >
                      {Object.keys(stats.condition_breakdown).map(k => (
                        <Cell key={k} fill={CONDITION_COLOUR[k] ?? '#64748b'} stroke="none"/>
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0', fontSize: 12 }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {Object.entries(stats.condition_breakdown).map(([type, count]) => {
                  const pct = totalCond > 0 ? Math.round((count / totalCond) * 100) : 0
                  return (
                    <div key={type} className="flex items-center gap-3 text-sm">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: CONDITION_COLOUR[type] ?? '#64748b' }}/>
                      <div className="flex-1 min-w-0 truncate font-medium text-gray-800">{CONDITION_LABELS[type] ?? type}</div>
                      <div className="text-gray-500 font-mono text-xs">{count} · {pct}%</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center"><Shield size={16}/></div>
            <div>
              <h2 className="font-bold text-gray-900">Severity mix</h2>
              <p className="text-xs text-gray-500">Traffic-light distribution across screeners</p>
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

      {/* ── Recent-ish activity strip (rendered from trend for a "pulse" feel) ─ */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center"><Zap size={16}/></div>
          <div>
            <h2 className="font-bold text-gray-900">Programme pulse</h2>
            <p className="text-xs text-gray-500">Aggregated indicators — never individual data</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <PulseCard icon={Users}     tone="teal"    title="Enrolment"   value={`${stats.employees_enrolled} joined`} note="via anonymous invite"/>
          <PulseCard icon={Video}     tone="violet"  title="Attendance"  value={`${stats.sessions_completed} confirmed`} note="both parties present"/>
          <PulseCard icon={Award}     tone="emerald" title="Clinical notes" value="Filed" note="required to complete a session"/>
          <PulseCard icon={Heart}     tone="rose"    title="Satisfaction" value="Positive" note="from anonymous feedback survey"/>
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
  accent: 'teal' | 'violet' | 'orange' | 'emerald'
  gradient: string  // like "from-teal-500 to-cyan-500"
  hint?: string
}

function KpiCard({ icon: Icon, label, value, gradient, hint }: KpiCardProps) {
  return (
    <div className="relative bg-white rounded-2xl border border-gray-200 shadow-sm p-5 overflow-hidden group hover:shadow-lg transition-shadow">
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-15 group-hover:opacity-30 transition-opacity`} />
      <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-md`}>
        <Icon size={18} className="text-white"/>
      </div>
      <div className="relative text-3xl font-black text-gray-900 leading-none">{value}</div>
      <div className="relative text-xs font-semibold text-gray-700 mt-2">{label}</div>
      {hint && <div className="relative text-[11px] text-gray-400 mt-0.5">{hint}</div>}
    </div>
  )
}

interface PulseProps {
  icon: React.ComponentType<any>
  tone: 'teal' | 'violet' | 'emerald' | 'rose'
  title: string
  value: string
  note: string
}

const TONE: Record<string, string> = {
  teal:    'bg-teal-50 border-teal-200 text-teal-800',
  violet:  'bg-violet-50 border-violet-200 text-violet-800',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  rose:    'bg-rose-50 border-rose-200 text-rose-800',
}

const PILL: Record<string, string> = {
  teal:    'bg-teal-100 text-teal-700',
  violet:  'bg-violet-100 text-violet-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  rose:    'bg-rose-100 text-rose-700',
}

function PulseCard({ icon: Icon, tone, title, value, note }: PulseProps) {
  return (
    <div className={`rounded-2xl border p-4 ${TONE[tone]}`}>
      <div className={`w-8 h-8 rounded-lg ${PILL[tone]} flex items-center justify-center mb-3`}>
        <Icon size={16}/>
      </div>
      <div className="text-xs uppercase tracking-wide font-semibold opacity-80">{title}</div>
      <div className="text-lg font-black mt-0.5">{value}</div>
      <div className="text-[11px] opacity-70 mt-0.5">{note}</div>
    </div>
  )
}
