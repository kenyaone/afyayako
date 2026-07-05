import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import {
  TrendingUp, TrendingDown, Minus, Star, Calendar,
  Flame, Brain, Heart, Activity, ChevronRight, Award
} from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine
} from 'recharts'

interface MoodLog {
  mood: number
  logged_at: string
}
interface Assessment {
  id: number
  type: string
  score: number
  severity: string
  created_at: string
}
interface Consultation {
  id: number
  consultation_id: string
  scheduled_at: string
  status: string
  user_rating?: number
}
interface Sobriety {
  substance: string
  days_sober: number
  start_date: string
  is_active: boolean
}
interface Stats {
  moods: MoodLog[]
  assessments: Assessment[]
  consultations: Consultation[]
  sobriety: Sobriety[]
}

const TYPE_LABEL: Record<string, string> = {
  phq9: 'Depression (PHQ-9)', gad7: 'Anxiety (GAD-7)',
  audit: 'Alcohol (AUDIT)', dast10: 'Substance (DAST-10)', pgsi: 'Gambling (PGSI)',
}

const SEVERITY_COLOR: Record<string, string> = {
  none: 'bg-green-100 text-green-700',
  minimal: 'bg-green-100 text-green-700',
  mild: 'bg-yellow-100 text-yellow-700',
  moderate: 'bg-orange-100 text-orange-700',
  severe: 'bg-red-100 text-red-700',
  'moderately severe': 'bg-red-100 text-red-700',
}

function MoodTrendIcon({ moods }: { moods: MoodLog[] }) {
  if (moods.length < 2) return <Minus size={16} className="text-gray-400" />
  const last5 = moods.slice(-5)
  const avg = (arr: MoodLog[]) => arr.reduce((s, m) => s + m.mood, 0) / arr.length
  const recent = avg(last5.slice(-2))
  const older  = avg(last5.slice(0, 2))
  if (recent > older + 0.3) return <TrendingUp size={16} className="text-green-500" />
  if (recent < older - 0.3) return <TrendingDown size={16} className="text-red-500" />
  return <Minus size={16} className="text-gray-400" />
}

function MoodBar({ value, max = 10 }: { value: number; max?: number }) {
  const pct = (value / max) * 100
  const color = value >= 7 ? 'bg-green-400' : value >= 4 ? 'bg-yellow-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-gray-600 font-medium">{value}</span>
    </div>
  )
}

export default function ProgressDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/phr/mood').catch(() => ({ data: { logs: [] } })),
      api.get('/assessments').catch(() => ({ data: { assessments: [] } })),
      api.get('/consultations').catch(() => ({ data: { data: [] } })),
      api.get('/phr/sobriety').catch(() => ({ data: { trackers: [] } })),
    ]).then(([moods, assessments, consults, sobriety]) => {
      setStats({
        moods:         (moods.data.logs ?? moods.data).slice(-30),
        assessments:   (assessments.data.assessments ?? assessments.data.data ?? []).slice(0, 10),
        consultations: (consults.data.data?.data ?? consults.data.data ?? consults.data.results ?? []).slice(0, 10),
        sobriety:      (sobriety.data.trackers ?? []).filter((s: Sobriety) => s.is_active),
      })
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-12 text-gray-400">Loading your progress…</div>
  if (!stats) return null

  const completedSessions = stats.consultations.filter(c => c.status === 'completed').length
  const avgRating = stats.consultations.filter(c => c.user_rating).length
    ? (stats.consultations.reduce((s, c) => s + (c.user_rating ?? 0), 0) /
       stats.consultations.filter(c => c.user_rating).length).toFixed(1)
    : null
  const recentMoods = stats.moods.slice(-7)
  const avgMood = recentMoods.length
    ? (recentMoods.reduce((s, m) => s + m.mood, 0) / recentMoods.length).toFixed(1)
    : null
  const longestStreak = stats.sobriety.length
    ? Math.max(...stats.sobriety.map(s => s.days_sober))
    : 0

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Progress</h1>
        <p className="text-gray-500 mt-1 text-sm">Your wellness journey at a glance</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Sessions Done', value: completedSessions, icon: Calendar, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Avg Mood (7d)', value: avgMood ?? '—', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' },
          { label: 'Sobriety Days', value: longestStreak || '—', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Avg Rating', value: avgRating ? `${avgRating}★` : '—', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card text-center py-4">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
              <Icon size={18} className={color} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Mood trend chart */}
      {stats.moods.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-teal-600" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Mood — last 30 days</h2>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MoodTrendIcon moods={stats.moods} />
              <span>{avgMood ? `Avg ${avgMood}/10` : 'No data'}</span>
            </div>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.moods.map(m => ({
                date: new Date(m.logged_at).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }),
                mood: m.mood,
              }))} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} interval="preserveStartEnd" />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,.12)', fontSize: 12 }}
                  formatter={(v: number) => [`${v}/10`, 'Mood']}
                />
                <ReferenceLine y={5} stroke="#e5e7eb" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="mood" stroke="#0d9488" strokeWidth={2} dot={{ r: 3, fill: '#0d9488' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <Link to="/mood" className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 mt-4">
            Log mood today <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* Assessment history */}
      {stats.assessments.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Brain size={16} className="text-teal-600" />
            <h2 className="font-semibold text-gray-900">Assessment History</h2>
          </div>
          <div className="space-y-3">
            {stats.assessments.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {TYPE_LABEL[a.type] ?? a.type.toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(a.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-700">Score {a.score}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${SEVERITY_COLOR[a.severity?.toLowerCase()] ?? 'bg-gray-100 text-gray-600'}`}>
                    {a.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link to="/assessments" className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 mt-4">
            Take a new assessment <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* Sobriety trackers */}
      {stats.sobriety.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={16} className="text-orange-500" />
            <h2 className="font-semibold text-gray-900">Sobriety Streaks</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stats.sobriety.map((s, i) => (
              <div key={i} className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center gap-3">
                <div className="text-3xl font-black text-orange-600">{s.days_sober}</div>
                <div>
                  <div className="text-sm font-semibold text-gray-800 capitalize">{s.substance} free</div>
                  <div className="text-xs text-gray-500">
                    Since {new Date(s.start_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
                {s.days_sober >= 30 && <Award size={20} className="text-orange-400 ml-auto" />}
              </div>
            ))}
          </div>
          <Link to="/sobriety" className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 mt-4">
            Manage sobriety trackers <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* Session history */}
      {stats.consultations.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-teal-600" />
            <h2 className="font-semibold text-gray-900">Session History</h2>
          </div>
          <div className="space-y-3">
            {stats.consultations.slice(0, 5).map(c => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium text-gray-800">{c.consultation_id}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(c.scheduled_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.user_rating && (
                    <span className="flex items-center gap-0.5 text-amber-500 text-xs">
                      <Star size={11} fill="currentColor" /> {c.user_rating}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize
                    ${c.status === 'completed' ? 'bg-green-100 text-green-700'
                    : c.status === 'confirmed' ? 'bg-teal-100 text-teal-700'
                    : 'bg-gray-100 text-gray-500'}`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link to="/history" className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 mt-4">
            Full session history <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {stats.moods.length === 0 && stats.assessments.length === 0 && stats.consultations.length === 0 && (
        <div className="card text-center py-12 text-gray-400">
          <Brain size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium">Nothing tracked yet</p>
          <p className="text-sm mt-1">Start with an assessment or log your mood to see your progress here.</p>
          <div className="flex gap-3 justify-center mt-4">
            <Link to="/assessments" className="btn-primary text-sm px-4">Take Assessment</Link>
            <Link to="/mood" className="btn-secondary text-sm px-4">Log Mood</Link>
          </div>
        </div>
      )}
    </div>
  )
}
