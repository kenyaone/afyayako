import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../api/axios'
import { CheckCircle2, Heart, ThumbsUp, ThumbsDown, Star, EyeOff, Loader2 } from 'lucide-react'

/**
 * Public, per-token feedback survey. Employee lands here from an email
 * link. Three questions map to the audit signals HR / compliance need.
 * Fully anonymous — no login, no PII stored on the row.
 */
export default function FeedbackSurvey() {
  const { token } = useParams<{ token: string }>()
  const [state, setState] = useState<'loading' | 'open' | 'already_submitted' | 'invalid' | 'submitting' | 'done'>('loading')

  const [therapistShowedUp, setTherapistShowedUp] = useState<boolean | null>(null)
  const [rating, setRating]                        = useState<number>(0)
  const [wouldBookAgain, setWouldBookAgain]        = useState<boolean | null>(null)
  const [comment, setComment]                      = useState('')
  const [error, setError]                          = useState('')

  useEffect(() => {
    if (!token) return
    api.get(`/feedback/${token}`)
      .then(r => setState(r.data?.status === 'already_submitted' ? 'already_submitted' : 'open'))
      .catch(() => setState('invalid'))
  }, [token])

  const submit = async () => {
    setError('')
    if (therapistShowedUp === null || rating < 1 || wouldBookAgain === null) {
      setError('Please answer all three questions.'); return
    }
    setState('submitting')
    try {
      await api.post(`/feedback/${token}`, {
        therapist_showed_up: therapistShowedUp,
        satisfaction_rating: rating,
        would_book_again: wouldBookAgain,
        comment: comment.trim() || undefined,
      })
      setState('done')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Could not submit. Please try again.')
      setState('open')
    }
  }

  if (state === 'loading') return <Wrap><Loader2 className="animate-spin text-primary-600" size={28}/></Wrap>

  if (state === 'invalid') return (
    <Wrap>
      <h1 className="text-xl font-bold text-gray-900 mb-2">This link is no longer valid.</h1>
      <p className="text-gray-500 text-sm">Feedback links expire after a while. If you'd still like to share your thoughts, reply to the email you received or contact your HR.</p>
    </Wrap>
  )

  if (state === 'already_submitted') return (
    <Wrap>
      <CheckCircle2 size={44} className="text-primary-600 mx-auto mb-3"/>
      <h1 className="text-xl font-bold text-gray-900 mb-2">You've already answered this one.</h1>
      <p className="text-gray-500 text-sm">Thank you — your feedback helps us keep quality high.</p>
    </Wrap>
  )

  if (state === 'done') return (
    <Wrap>
      <Heart size={44} className="text-rose-500 mx-auto mb-3"/>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Thank you.</h1>
      <p className="text-gray-500 text-sm">Your answers are completely anonymous. Your employer never sees who filled this in.</p>
    </Wrap>
  )

  return (
    <Wrap>
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 bg-primary-100 text-primary-800 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-widest mb-3">
          <EyeOff size={12}/> Anonymous · 30 seconds
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-1">How was your session?</h1>
        <p className="text-gray-500 text-sm">Three quick questions. Your answers help us keep quality high — HR only ever sees the aggregate.</p>
      </div>

      {/* Q1 — attendance */}
      <div className="mb-5">
        <label className="block text-sm font-bold text-gray-900 mb-2">1. Did your therapist show up on time?</label>
        <div className="flex gap-2">
          <YesNoButton active={therapistShowedUp === true}  onClick={() => setTherapistShowedUp(true)}  positive>Yes, on time</YesNoButton>
          <YesNoButton active={therapistShowedUp === false} onClick={() => setTherapistShowedUp(false)}>No / late</YesNoButton>
        </div>
      </div>

      {/* Q2 — rating */}
      <div className="mb-5">
        <label className="block text-sm font-bold text-gray-900 mb-2">2. How helpful was it? (1 = not at all, 5 = extremely)</label>
        <div className="flex gap-1.5">
          {[1,2,3,4,5].map(n => (
            <button key={n}
              type="button"
              onClick={() => setRating(n)}
              className={`flex-1 py-3 rounded-lg border-2 transition-all ${rating >= n ? 'bg-yellow-100 border-yellow-400' : 'bg-white border-gray-200 hover:border-gray-300'}`}
            >
              <Star size={20} className={`mx-auto ${rating >= n ? 'text-yellow-500 fill-yellow-400' : 'text-gray-300'}`} />
              <div className={`text-xs font-bold mt-1 ${rating >= n ? 'text-yellow-800' : 'text-gray-400'}`}>{n}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Q3 — repeat */}
      <div className="mb-5">
        <label className="block text-sm font-bold text-gray-900 mb-2">3. Would you book with them again?</label>
        <div className="flex gap-2">
          <YesNoButton active={wouldBookAgain === true}  onClick={() => setWouldBookAgain(true)}  positive><ThumbsUp size={14}/> Yes</YesNoButton>
          <YesNoButton active={wouldBookAgain === false} onClick={() => setWouldBookAgain(false)}><ThumbsDown size={14}/> No</YesNoButton>
        </div>
      </div>

      {/* Optional comment */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Anything else you want us to know? <span className="text-gray-400 font-normal">(optional)</span></label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          maxLength={600}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Free-text is welcome — this too stays anonymous."
        />
      </div>

      {error && <div className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-3">{error}</div>}

      <button
        onClick={submit}
        disabled={state === 'submitting'}
        className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-[1.01] disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)' }}
      >
        {state === 'submitting' ? 'Submitting…' : 'Submit anonymously'}
      </button>
      <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1"><EyeOff size={11}/> No name, no ID, no session content is stored with this response.</p>
    </Wrap>
  )
}

// ── small components ─────────────────────────────────────────────

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-rose-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-10">
        {children}
      </div>
    </div>
  )
}

interface YNProps { active: boolean; onClick: () => void; positive?: boolean; children: React.ReactNode }
function YesNoButton({ active, onClick, positive, children }: YNProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-3 rounded-lg border-2 font-semibold text-sm transition-all flex items-center justify-center gap-1.5 ${
        active
          ? (positive ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-rose-100 border-rose-400 text-rose-800')
          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  )
}
