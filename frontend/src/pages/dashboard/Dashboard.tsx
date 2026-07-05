import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import api from '../../api/axios'
import { ClipboardList, Users, Calendar, TrendingUp, Heart, AlertCircle, Sparkles, Loader2, UserCheck, Bell, Wifi, AlertTriangle } from 'lucide-react'
import type { Assessment } from '../../types'
import ProfessionalDashboard from './ProfessionalDashboard'
import { useT } from '../../contexts/I18nContext'

interface Therapist { id: number; display_name: string; avatar?: string; sessions_together: number; last_session_at: string }

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const { t } = useT()

  if (user?.role === 'professional') return <ProfessionalDashboard />
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [progressInsight, setProgressInsight] = useState('')
  const [insightLoading, setInsightLoading] = useState(false)
  const [myTherapist, setMyTherapist] = useState<Therapist | null>(null)
  const [pendingSurvey, setPendingSurvey] = useState(false)
  const [hotlines, setHotlines] = useState<{ name: string; phone: string; available?: string }[]>([])

  // Check parental consent status for minors
  useEffect(() => {
    api.get('/parental-consent/status')
      .then(r => {
        if (r.data.requires_consent && !r.data.has_consent) {
          navigate('/parental-consent?flow=signup', { replace: true })
        }
      })
      .catch(() => {}) // Silently fail if endpoint not available or user is not authenticated
  }, [navigate])

  useEffect(() => {
    api.get('/crisis/hotlines').then(r => setHotlines(r.data?.hotlines ?? [])).catch(() => {})
  }, [])
  const [onlineCount, setOnlineCount] = useState(0)

  useEffect(() => {
    // Continuity + pending survey (non-blocking)
    api.get('/consultations/my-therapist').then(r => setMyTherapist(r.data.therapist)).catch(() => {})
    api.get('/surveys/pending').then(r => setPendingSurvey(!!r.data.survey)).catch(() => {})
    // Online therapist count
    const fetchOnline = () =>
      api.get('/presence/professionals').then(r => setOnlineCount((r.data.online_user_ids ?? []).length)).catch(() => {})
    fetchOnline()
    const poll = setInterval(fetchOnline, 30_000)
    return () => clearInterval(poll)
  }, [])

  useEffect(() => {
    api.get('/assessments?page_size=3')
      .then(r => {
        const loaded = r.data.data ?? r.data.results ?? r.data
        setAssessments(Array.isArray(loaded) ? loaded : [])
        if (loaded && loaded.length > 0) {
          setInsightLoading(true)
          api.get('/ai/progress-insight')
            .then(r => setProgressInsight(r.data.insight || ''))
            .catch(() => {})
            .finally(() => setInsightLoading(false))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      {/* Pending survey nudge */}
      {pendingSurvey && (
        <Link to="/surveys" className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 hover:bg-amber-100 transition-colors">
          <Bell size={18} className="text-amber-600 flex-shrink-0" />
          <div className="flex-1 text-sm text-amber-800">
            <span className="font-semibold">{t('pendingSurvey')}</span>
            <span className="text-amber-600 ml-2 text-xs">{t('takeSurvey')} →</span>
          </div>
        </Link>
      )}

      {/* Online therapists nudge */}
      {onlineCount > 0 && (
        <Link to="/professionals" className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 hover:bg-green-100 transition-colors">
          <span className="relative flex-shrink-0">
            <span className="w-3 h-3 rounded-full bg-green-400 block animate-pulse" />
          </span>
          <div className="flex-1 text-sm text-green-800">
            <span className="font-semibold">{onlineCount} therapist{onlineCount > 1 ? 's' : ''} available right now</span>
            <span className="text-green-600 ml-2 text-xs">Book an instant session →</span>
          </div>
          <Wifi size={16} className="text-green-500 flex-shrink-0" />
        </Link>
      )}

      {/* Gradient greeting hero */}
      <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #0a5e2a 0%, #0d9488 100%)' }}>
        <h1 className="text-2xl font-bold mb-1">
          {t('welcomeBack')}, {user?.display_name} 👋
        </h1>
        <p className="text-white/70 text-sm">{t('howAreYou')}</p>
      </div>

      {/* My therapist continuity card */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex-1" />

        {/* My Therapist — continuity card */}
        {myTherapist ? (
          <div className="flex items-center gap-3 bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 min-w-[200px]">
            <div className="w-10 h-10 bg-primary-200 rounded-full flex items-center justify-center text-primary-800 font-bold text-sm flex-shrink-0">
              {myTherapist.display_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 font-medium">{t('myTherapist')}</div>
              <div className="font-semibold text-gray-900 text-sm truncate">{myTherapist.display_name}</div>
              <div className="text-xs text-gray-400">{myTherapist.sessions_together} {t('sessionsTogether')}</div>
            </div>
            <Link to={`/book/${myTherapist.id}`} className="btn-primary text-xs py-1.5 px-3 flex-shrink-0">
              {t('bookAgain')}
            </Link>
          </div>
        ) : (
          <Link to="/professionals" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 hover:bg-gray-100 transition-colors">
            <UserCheck size={20} className="text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-700">{t('noTherapistYet')}</div>
              <div className="text-xs text-primary-600">{t('findFirst')} →</div>
            </div>
          </Link>
        )}
      </div>

      {/* Colorful stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { icon: ClipboardList, label: 'Assessments', value: assessments.length, from: '#15803d', to: '#0d9488' },
          { icon: Calendar,      label: 'Sessions',    value: 0,                  from: '#2563eb', to: '#7c3aed' },
          { icon: TrendingUp,    label: 'Specialists', value: '6+',               from: '#d97706', to: '#ea580c' },
        ].map(({ icon: Icon, label, value, from, to }) => (
          <div key={label} className="rounded-2xl p-4 text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}>
            <Icon size={20} className="opacity-80 mb-2" />
            <div className="text-2xl font-black">{value}</div>
            <div className="text-xs text-white/70 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/assessments" className="card hover:shadow-md transition-all group border-l-4 border-teal-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #15803d, #0d9488)' }}>
                <ClipboardList size={18} className="text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Take Assessment</div>
                <div className="text-xs text-gray-500">PHQ-9, AUDIT, PGSI & more</div>
              </div>
            </div>
          </Link>

          <Link to="/professionals" className="card hover:shadow-md transition-all group border-l-4 border-blue-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                <Users size={18} className="text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Find a Therapist</div>
                <div className="text-xs text-gray-500">Book now or see available</div>
              </div>
            </div>
          </Link>

          <Link to="/my-compliance" className="card hover:shadow-md transition-all group border-l-4 border-orange-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ea580c, #dc2626)' }}>
                <AlertTriangle size={18} className="text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">My Reports</div>
                <div className="text-xs text-gray-500">View incidents & complaints</div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* AI Progress Insight */}
      {(insightLoading || progressInsight) && (
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-4">
          <div className="flex items-center gap-2 font-medium text-primary-800 mb-2">
            <Sparkles size={15} />
            Your Progress Insight
          </div>
          {insightLoading ? (
            <div className="flex items-center gap-2 text-primary-600 text-sm">
              <Loader2 size={14} className="animate-spin" /> Analysing your wellness data…
            </div>
          ) : (
            <p className="text-primary-700 text-sm leading-relaxed">{progressInsight}</p>
          )}
        </div>
      )}

      {/* Recent assessments */}
      {assessments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Recent Assessments</h2>
            <Link to="/assessments" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {assessments.map((a) => (
              <div key={a.id} className="card flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{a.assessment_type_display}</div>
                  <div className="text-sm text-gray-500">
                    Score: {a.score} — <span className={`font-medium ${
                      a.severity.includes('Severe') ? 'text-red-600' :
                      a.severity.includes('Moderate') ? 'text-yellow-600' : 'text-green-600'
                    }`}>{a.severity}</span>
                  </div>
                </div>
                {a.is_crisis_flag && (
                  <span className="flex items-center gap-1 text-red-600 text-xs font-medium bg-red-50 px-2 py-1 rounded">
                    <AlertCircle size={12} /> Crisis Flag
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Crisis hotlines */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="font-medium text-red-800 mb-2 flex items-center gap-2">
          <AlertCircle size={16} />
          Need immediate help?
        </div>
        <div className="text-sm text-red-700 space-y-1 max-h-60 overflow-y-auto">
          {(hotlines.length ? hotlines : [
            { name: 'Free Counselling (Kenya Red Cross)', phone: '1199', available: '24/7' },
            { name: 'Befrienders Kenya — Suicide Support', phone: '0800 723 253', available: '24/7' },
            { name: 'NACADA — Substance Abuse', phone: '1192', available: '24/7' },
            { name: 'Childline Kenya', phone: '116', available: '24/7' },
            { name: 'Emergency / Police', phone: '999 / 112', available: '24/7' },
          ]).map((h, i) => (
            <div key={i}>📞 {h.name}: <strong>{h.phone}</strong>{h.available ? ` (${h.available})` : ''}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
