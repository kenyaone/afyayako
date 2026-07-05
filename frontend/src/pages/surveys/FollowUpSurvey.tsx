import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { CheckCircle, Loader2, Heart } from 'lucide-react'
import { useT } from '../../contexts/I18nContext'

interface Survey {
  id: number
  survey_type: string
  consultation: { consultation_id: string; scheduled_at: string }
}

const QUESTIONS = [
  { key: 'energy', text: 'How is your energy level?' },
  { key: 'mood', text: 'How would you rate your mood?' },
  { key: 'coping', text: 'How well are you coping with daily challenges?' },
]

export default function FollowUpSurvey() {
  const { t } = useT()
  const navigate = useNavigate()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [wellbeing, setWellbeing] = useState(5)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    api.get('/surveys/pending')
      .then(r => setSurvey(r.data.survey ?? null))
      .finally(() => setLoading(false))
  }, [])

  const submit = async () => {
    if (!survey) return
    setSubmitting(true)
    try {
      await api.post(`/surveys/${survey.id}/respond`, {
        responses,
        wellbeing_score: wellbeing,
      })
      setDone(true)
    } catch {
      alert('Failed to submit. Please try again.')
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="text-center py-10 text-gray-400">{t('loading')}</div>

  if (!survey) {
    return (
      <div className="max-w-lg mx-auto card text-center py-10">
        <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
        <h2 className="font-semibold text-gray-900 mb-2">All caught up!</h2>
        <p className="text-gray-500 text-sm mb-4">No pending follow-up surveys.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">{t('dashboard')}</button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto card text-center py-10">
        <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
        <h2 className="font-semibold text-gray-900 mb-2">Thank you!</h2>
        <p className="text-gray-500 text-sm mb-4">Your check-in has been recorded. Your therapist can see this progress.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">{t('dashboard')}</button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('followUpSurveyTitle')}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {survey.survey_type === '3day' ? '3-day' : survey.survey_type === '1week' ? '1-week' : '1-month'} check-in
          after your session on{' '}
          {new Date(survey.consultation.scheduled_at).toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' })}
        </p>
      </div>

      <div className="card space-y-5">
        <div className="flex items-center gap-2 text-primary-700 font-medium text-sm">
          <Heart size={16} />
          {t('howAreYouFeeling')}
        </div>

        {QUESTIONS.map(q => (
          <div key={q.key}>
            <div className="text-sm font-medium text-gray-700 mb-2">{q.text}</div>
            <div className="flex gap-2 flex-wrap">
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  onClick={() => setResponses(r => ({...r, [q.key]: n}))}
                  className={`w-10 h-10 rounded-full text-sm font-bold border-2 transition-all ${
                    responses[q.key] === n
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-primary-400'
                  }`}
                >
                  {n}
                </button>
              ))}
              <span className="self-center text-xs text-gray-400">1 = poor · 5 = great</span>
            </div>
          </div>
        ))}

        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">{t('wellbeingScore')}</div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">0</span>
            <input
              type="range" min={0} max={10} value={wellbeing}
              onChange={e => setWellbeing(Number(e.target.value))}
              className="flex-1 accent-primary-600"
            />
            <span className="text-xs text-gray-400">10</span>
            <span className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">
              {wellbeing}
            </span>
          </div>
        </div>

        <button
          onClick={submit}
          disabled={submitting || Object.keys(responses).length < QUESTIONS.length}
          className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {t('submit')}
        </button>
      </div>
    </div>
  )
}
