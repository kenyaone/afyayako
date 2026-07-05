import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { Users, TrendingUp, TrendingDown, Minus, Target, Clock, ChevronRight } from 'lucide-react'

interface Patient {
  id: number
  display_name: string
  username: string
  sessions_done: number
  avg_mood_7d: number | null
  mood_logs_7d: number
  active_goals: number
  latest_assessment: { type: string; score: number; severity: string; date: string } | null
  next_session: string | null
}

const SEV_COLOR: Record<string, string> = {
  minimal: 'text-green-600 bg-green-50',
  mild:    'text-yellow-600 bg-yellow-50',
  moderate:'text-orange-600 bg-orange-50',
  severe:  'text-red-600 bg-red-50',
  'moderately severe': 'text-red-500 bg-red-50',
}

function MoodIcon({ avg }: { avg: number | null }) {
  if (avg === null) return <Minus size={14} className="text-gray-300" />
  if (avg >= 7) return <TrendingUp size={14} className="text-green-500" />
  if (avg >= 4) return <Minus size={14} className="text-yellow-500" />
  return <TrendingDown size={14} className="text-red-400" />
}

export default function Caseload() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = () =>
      api.get('/caseload')
        .then(r => setPatients(r.data.patients ?? []))
        .catch(() => {})
    fetch().finally(() => setLoading(false))
    const poll = setInterval(fetch, 10_000)
    return () => clearInterval(poll)
  }, [])

  const filtered = patients.filter(p =>
    p.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.username?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="text-center py-12 text-gray-400">Loading caseload…</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users size={22} className="text-teal-600" /> My Patients
        </h1>
        <p className="text-sm text-gray-500 mt-1">Overview of all your patients and their progress.</p>
      </div>

      {/* KPI bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total patients</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-teal-600">{patients.filter(p => p.next_session).length}</p>
          <p className="text-xs text-gray-500 mt-1">Upcoming sessions</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-purple-600">{patients.reduce((s,p) => s + p.active_goals, 0)}</p>
          <p className="text-xs text-gray-500 mt-1">Active goals</p>
        </div>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)}
        className="input-field" placeholder="Search patients…" />

      {filtered.length === 0 && (
        <div className="card text-center py-10 text-gray-400">
          <Users size={40} className="mx-auto mb-3 opacity-20" />
          <p>{search ? 'No matching patients.' : 'No patients yet.'}</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(p => (
          <button key={p.id} onClick={() => navigate(`/caseload/${p.id}`)}
            className="w-full card text-left hover:border-teal-400 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-sm flex-shrink-0">
                    {p.display_name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <span className="font-semibold text-gray-900">{p.display_name}</span>
                  <span className="text-xs text-gray-400">@{p.username}</span>
                </div>

                <div className="flex items-center gap-4 flex-wrap ml-10">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={11} /> {p.sessions_done} sessions
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <MoodIcon avg={p.avg_mood_7d} />
                    {p.avg_mood_7d !== null ? `Mood ${p.avg_mood_7d}/10` : 'No mood data'}
                  </span>
                  {p.active_goals > 0 && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Target size={11} /> {p.active_goals} goals
                    </span>
                  )}
                  {p.latest_assessment && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SEV_COLOR[p.latest_assessment.severity?.toLowerCase()] ?? 'text-gray-500 bg-gray-50'}`}>
                      {p.latest_assessment.type ? `${p.latest_assessment.type.toUpperCase()} — ` : ''}{p.latest_assessment.severity}
                    </span>
                  )}
                  {p.next_session && (
                    <span className="text-xs text-teal-600 font-medium">
                      Next: {new Date(p.next_session).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-teal-500 flex-shrink-0" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
