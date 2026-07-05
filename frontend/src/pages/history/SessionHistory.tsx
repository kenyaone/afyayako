import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { format } from 'date-fns'
import { Video, Star, FileText, Calendar, CheckCircle, Clock, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { useT } from '../../contexts/I18nContext'

interface FeedbackForm {
  overall_rating: number
  communication_rating: number
  felt_heard: boolean
  would_recommend: boolean
  felt_safe: boolean
  comment: string
}

interface Session {
  id: number
  consultation_id: string
  scheduled_at: string
  duration_minutes: number
  status: string
  amount: number
  professional_detail?: { display_name: string; rating: number }
  user_rating?: number
  professional_notes?: string
  has_feedback?: boolean
}

const STARS = [1,2,3,4,5]

function FeedbackForm({ consultationId, onDone }: { consultationId: string; onDone: () => void }) {
  const { t } = useT()
  const [form, setForm] = useState<FeedbackForm>({
    overall_rating: 0, communication_rating: 0,
    felt_heard: false, felt_safe: false, would_recommend: false, comment: '',
  })
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!form.overall_rating || !form.communication_rating) return
    setSaving(true)
    try {
      await api.post(`/consultations/${consultationId}/feedback`, form)
      onDone()
    } catch (e: any) {
      alert(e.response?.data?.error || 'Failed to save feedback.')
    } finally { setSaving(false) }
  }

  return (
    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-4">
      <div className="font-semibold text-blue-900 text-sm">{t('feedbackTitle')}</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-gray-600 mb-1">{t('overallRating')}</div>
          <div className="flex gap-1">
            {STARS.map(n => (
              <button key={n} onClick={() => setForm(f => ({...f, overall_rating: n}))}
                className={`text-xl ${n <= form.overall_rating ? 'text-amber-400' : 'text-gray-300'}`}>★</button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-600 mb-1">{t('communicationRating')}</div>
          <div className="flex gap-1">
            {STARS.map(n => (
              <button key={n} onClick={() => setForm(f => ({...f, communication_rating: n}))}
                className={`text-xl ${n <= form.communication_rating ? 'text-amber-400' : 'text-gray-300'}`}>★</button>
            ))}
          </div>
        </div>
      </div>

      {([
        ['felt_heard', t('feltHeard')],
        ['felt_safe', t('feltSafe')],
        ['would_recommend', t('wouldRecommend')],
      ] as [keyof FeedbackForm, string][]).map(([key, label]) => (
        <label key={key} className="flex items-center gap-3 cursor-pointer text-sm text-gray-700">
          <input type="checkbox" checked={!!form[key]}
            onChange={e => setForm(f => ({...f, [key]: e.target.checked}))}
            className="w-4 h-4 rounded accent-primary-600" />
          {label}
        </label>
      ))}

      <textarea
        value={form.comment}
        onChange={e => setForm(f => ({...f, comment: e.target.value}))}
        className="input-field resize-none text-sm"
        rows={2}
        placeholder={t('comments')}
      />

      <button
        onClick={submit}
        disabled={saving || !form.overall_rating || !form.communication_rating}
        className="btn-primary text-sm py-2 disabled:opacity-50"
      >
        {saving ? 'Saving…' : t('submitFeedback')}
      </button>
    </div>
  )
}

export default function SessionHistory() {
  const { t } = useT()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [feedbackDone, setFeedbackDone] = useState<Set<string>>(new Set())

  useEffect(() => {
    api.get('/consultations?status=completed&per_page=50')
      .then(r => {
        const raw = r.data.data ?? r.data.results ?? r.data
        setSessions(Array.isArray(raw) ? raw.filter((s: Session) => s.status === 'completed') : [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-10 text-gray-400">{t('loading')}</div>

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('sessionHistoryTitle')}</h1>
        <span className="text-sm text-gray-400">{sessions.length} sessions</span>
      </div>

      {sessions.length === 0 ? (
        <div className="card text-center py-10">
          <Video size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{t('noSessions')}</p>
          <Link to="/professionals" className="btn-primary mt-4 inline-block">{t('findTherapist')}</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(s => {
            const isOpen = expanded === s.id
            const hasFeedback = s.has_feedback || feedbackDone.has(s.consultation_id)
            return (
              <div key={s.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {t('sessionWith')} {s.professional_detail?.display_name || 'Therapist'}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {format(new Date(s.scheduled_at), 'EEE, MMM d yyyy · h:mm a')}
                      {' · '}{s.duration_minutes} min
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      KES {Number(s.amount).toLocaleString()} · {s.consultation_id}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle size={11} /> {t('completed')}
                    </span>
                    {s.user_rating && (
                      <span className="text-xs text-amber-500">{'★'.repeat(s.user_rating)}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  {!hasFeedback && (
                    <button
                      onClick={() => setExpanded(isOpen ? null : s.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      {t('leaveFeedback')}
                    </button>
                  )}
                  {hasFeedback && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle size={12} /> {t('feedbackSubmitted')}
                    </span>
                  )}
                  <Link
                    to={`/book/${s.id}`}
                    state={{ is_follow_up: true }}
                    className="text-xs btn-secondary py-1 px-3 flex items-center gap-1"
                  >
                    <Calendar size={12} /> Follow-up
                  </Link>
                </div>

                {s.professional_notes && (
                  <div className="mt-3 bg-gray-50 rounded-lg p-3 text-sm text-gray-700 border border-gray-100">
                    <span className="font-medium text-gray-500 text-xs block mb-1 flex items-center gap-1">
                      <FileText size={11} /> {t('notes')}
                    </span>
                    {s.professional_notes}
                  </div>
                )}

                {isOpen && !hasFeedback && (
                  <FeedbackForm
                    consultationId={s.consultation_id}
                    onDone={() => {
                      setFeedbackDone(prev => new Set([...prev, s.consultation_id]))
                      setExpanded(null)
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
