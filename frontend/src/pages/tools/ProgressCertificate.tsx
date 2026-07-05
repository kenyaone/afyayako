import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Award, Download } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

interface Stats {
  sessions_done: number
  goals_completed: number
  sobriety_days: number
  assessments_done: number
}

export default function ProgressCertificate() {
  const user = useAuthStore(s => s.user)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch progress data from multiple endpoints
    Promise.all([
      api.get('/consultations').catch(() => ({ data: { data: [] } })),
      api.get('/goals').catch(() => ({ data: { goals: [] } })),
      api.get('/assessments').catch(() => ({ data: { data: [] } })),
      api.get('/phr/sobriety').catch(() => ({ data: { trackers: [] } })),
    ]).then(([consults, goals, assessments, sobriety]) => {
      const sessions = consults.data?.data?.filter((c: any) => c.status === 'completed') ?? []
      const completedGoals = (goals.data?.goals ?? []).filter((g: any) => g.status === 'completed')
      const allAssessments = assessments.data?.data ?? []
      const trackers = sobriety.data?.trackers ?? []
      const maxSobriety = trackers.reduce((max: number, t: any) => Math.max(max, t.days_sober ?? 0), 0)
      setStats({
        sessions_done:     sessions.length,
        goals_completed:   completedGoals.length,
        assessments_done:  allAssessments.length,
        sobriety_days:     maxSobriety,
      })
    }).finally(() => setLoading(false))
  }, [])

  const download = () => {
    if (!stats || !user) return
    const today = new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Certificate of Commitment</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Inter', sans-serif; background: #f0fdf4; display:flex; align-items:center; justify-content:center; min-height:100vh; }
  .cert { background: white; width: 750px; padding: 60px; border: 3px solid #166534; border-radius: 16px; text-align:center; position:relative; }
  .badge { background: #0a5e2a; color: white; width: 80px; height: 80px; border-radius: 50%; display:flex; align-items:center; justify-content:center; margin: 0 auto 20px; font-size: 36px; }
  .org { color: #166534; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; margin-bottom: 8px; }
  .cert-title { font-size: 32px; font-weight: 700; color: #0a5e2a; margin-bottom: 4px; }
  .sub { font-size: 14px; color: #6b7280; margin-bottom: 30px; }
  .name { font-size: 28px; font-weight: 700; color: #111827; margin: 12px 0; border-bottom: 2px solid #d1fae5; padding-bottom: 12px; display:inline-block; }
  .desc { color: #374151; font-size: 15px; line-height: 1.8; margin: 20px 0 30px; }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 30px 0; }
  .stat { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; }
  .stat-num { font-size: 28px; font-weight: 700; color: #166534; }
  .stat-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
  .footer { color: #9ca3af; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
</style>
</head>
<body>
<div class="cert">
  <div class="badge">🌿</div>
  <div class="org">Afya Yako Siri Yako — Your Health, Your Secret</div>
  <div class="cert-title">Certificate of Commitment</div>
  <div class="sub">This certifies that</div>
  <div class="name">${user.display_name}</div>
  <div class="desc">
    has demonstrated dedication to their mental health and recovery journey<br>
    through consistent engagement with their wellbeing goals and therapeutic process.
  </div>
  <div class="stats">
    <div class="stat"><div class="stat-num">${stats.sessions_done}</div><div class="stat-label">Sessions completed</div></div>
    <div class="stat"><div class="stat-num">${stats.goals_completed}</div><div class="stat-label">Goals achieved</div></div>
    <div class="stat"><div class="stat-num">${stats.assessments_done}</div><div class="stat-label">Assessments taken</div></div>
    <div class="stat"><div class="stat-num">${stats.sobriety_days}</div><div class="stat-label">Days sober</div></div>
  </div>
  <div class="footer">
    Issued on ${today} — mhapke.com<br>
    <em>Recovery is not a destination. It is a daily commitment to yourself.</em>
  </div>
</div>
</body>
</html>`
    const blob = new Blob([html], { type: 'text/html' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `certificate_${user.display_name.replace(/\s+/g, '_')}.html`
    a.click()
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading your progress…</div>

  const unlocked = (stats?.sessions_done ?? 0) >= 1

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Award size={22} className="text-amber-500" /> Progress Certificate
        </h1>
        <p className="text-sm text-gray-500 mt-1">Your commitment to your wellbeing, documented.</p>
      </div>

      {/* Preview card */}
      <div className="card border-2 border-green-200 bg-green-50 text-center py-10 space-y-4">
        <div className="w-20 h-20 bg-green-800 rounded-full flex items-center justify-center text-4xl mx-auto">🌿</div>
        <div>
          <p className="text-xs uppercase tracking-widest text-green-700 font-semibold">Afya Yako Siri Yako</p>
          <h2 className="text-2xl font-bold text-green-900 mt-1">Certificate of Commitment</h2>
          <p className="text-sm text-gray-500 mt-1">Awarded to</p>
          <p className="text-xl font-bold text-gray-900 mt-1 border-b-2 border-green-200 pb-2 inline-block">{user?.display_name}</p>
        </div>

        <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
          {[
            { n: stats?.sessions_done ?? 0, label: 'Sessions' },
            { n: stats?.goals_completed ?? 0, label: 'Goals' },
            { n: stats?.assessments_done ?? 0, label: 'Assessments' },
            { n: stats?.sobriety_days ?? 0, label: 'Days sober' },
          ].map(({ n, label }) => (
            <div key={label} className="bg-white rounded-xl p-3 border border-green-200">
              <p className="text-2xl font-bold text-green-800">{n}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 italic">
          "Recovery is not a destination. It is a daily commitment to yourself."
        </p>
      </div>

      {unlocked ? (
        <button onClick={download} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          <Download size={16} /> Download Certificate (HTML)
        </button>
      ) : (
        <div className="card bg-amber-50 border-amber-200 text-center">
          <Award size={24} className="mx-auto mb-2 text-amber-400" />
          <p className="text-sm font-medium text-amber-800">Complete your first session to unlock your certificate.</p>
          <p className="text-xs text-amber-600 mt-1">You currently have {stats?.sessions_done ?? 0} completed sessions.</p>
        </div>
      )}
    </div>
  )
}
