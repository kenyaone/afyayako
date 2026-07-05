import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { ArrowLeft, Target, BarChart2, Shield, ClipboardList } from 'lucide-react'

interface PatientDetail {
  patient: { id: number; display_name: string }
  assessments: { id: number; type: string; score: number; severity: string; created_at: string }[]
  moods: { mood: number; note: string | null; logged_at: string }[]
  goals: { id: number; title: string; status: string; progress: number; category: string }[]
  sessions: { id: number; scheduled_at: string; status: string; consultation_id: string }[]
  sobriety: { substance: string; days_sober: number; start_date: string }[]
}

const SEV_COLOR: Record<string, string> = {
  minimal: 'text-green-600', mild: 'text-yellow-600',
  moderate: 'text-orange-600', severe: 'text-red-600', 'moderately severe': 'text-red-500'
}

export default function CaseloadPatient() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<PatientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'assessments' | 'goals' | 'sessions'>('overview')

  useEffect(() => {
    api.get(`/caseload/${id}`).then(r => setData(r.data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-center py-12 text-gray-400">Loading patient…</div>
  if (!data) return <div className="text-center py-12 text-red-400">Patient not found.</div>

  const p = data.patient
  const recent10moods = [...data.moods].slice(0, 10).reverse()

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <button onClick={() => navigate('/caseload')} className="flex items-center gap-2 text-sm text-teal-600 hover:underline">
        <ArrowLeft size={14} /> Back to caseload
      </button>

      <div className="card">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-xl">
            {p.display_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{p.display_name}</h1>
            <p className="text-sm text-gray-500">{data.sessions.filter(s => s.status === 'completed').length} sessions completed</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {(['overview','assessments','goals','sessions'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-4">
          {/* Mood chart */}
          {recent10moods.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <BarChart2 size={16} className="text-teal-600" /> Mood (last 10 entries)
              </h2>
              <div className="flex items-end gap-1 h-20">
                {recent10moods.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-sm bg-teal-400" style={{ height: `${(m.mood / 10) * 64}px`, minHeight: 4 }} title={`${m.mood}/10`} />
                    <span className="text-xs text-gray-300">{new Date(m.logged_at).toLocaleDateString('en-KE', { day: 'numeric' })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sobriety */}
          {data.sobriety.length > 0 && (
            <div className="card space-y-2">
              <h2 className="font-semibold text-gray-900 mb-1">Sobriety</h2>
              {data.sobriety.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 capitalize">{s.substance}</span>
                  <span className="font-bold text-teal-600">{s.days_sober} days</span>
                </div>
              ))}
            </div>
          )}

          {/* Latest assessment */}
          {data.assessments[0] && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                <ClipboardList size={16} className="text-purple-500" /> Latest Assessment
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 uppercase">{data.assessments[0].type}</span>
                <span className="text-sm font-bold text-gray-900">Score: {data.assessments[0].score}</span>
                <span className={`text-sm font-medium ${SEV_COLOR[data.assessments[0].severity] ?? 'text-gray-500'}`}>
                  {data.assessments[0].severity}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Assessments */}
      {tab === 'assessments' && (
        <div className="space-y-2">
          <div className="flex justify-end">
            <button
              onClick={() => navigate(`/caseload/${id}/screen`)}
              className="text-xs font-medium px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
            >
              + Screen patient
            </button>
          </div>
          {data.assessments.length === 0 && <p className="text-center text-gray-400 py-8">No assessments yet.</p>}
          {data.assessments.map(a => (
            <div key={a.id} className="card flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-800 uppercase text-sm">{a.type}</span>
                <span className="text-xs text-gray-400 ml-2">{new Date(a.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-900">{a.score}</span>
                <span className={`ml-2 text-xs ${SEV_COLOR[a.severity] ?? 'text-gray-500'}`}>{a.severity}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Goals */}
      {tab === 'goals' && (
        <div className="space-y-2">
          {data.goals.length === 0 && <p className="text-center text-gray-400 py-8">No goals set.</p>}
          {data.goals.map(g => (
            <div key={g.id} className="card">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-800 text-sm">{g.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${g.status === 'completed' ? 'bg-green-100 text-green-700' : g.status === 'active' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>{g.status}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-teal-500 transition-all" style={{ width: `${g.progress}%` }} />
              </div>
              <span className="text-xs text-gray-400">{g.progress}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Sessions */}
      {tab === 'sessions' && (
        <div className="space-y-2">
          {data.sessions.length === 0 && <p className="text-center text-gray-400 py-8">No sessions.</p>}
          {data.sessions.map(s => (
            <div key={s.id} className="card flex items-center justify-between text-sm">
              <span className="text-gray-700">{new Date(s.scheduled_at).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.status === 'completed' ? 'bg-green-100 text-green-700' : s.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{s.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
