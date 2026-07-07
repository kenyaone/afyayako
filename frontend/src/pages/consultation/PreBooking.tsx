import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, ArrowRight, AlertTriangle, Clock, Sparkles, ShieldCheck } from 'lucide-react'
import { saveTriage, isCrisisFlagged, CONCERN_OPTIONS, type Urgency } from '../../lib/triage'

const URGENCY_OPTIONS: { value: Urgency; label: string; hint: string; icon: string }[] = [
  { value: 'this_week',    label: 'Sometime this week',   hint: 'I want to book, but no rush.',        icon: '🗓️' },
  { value: 'a_few_weeks',  label: 'The next couple weeks', hint: 'Whenever a good match is available.', icon: '⏳' },
  { value: 'crisis',       label: 'I need to talk today', hint: 'Something is going on right now.',    icon: '🚨' },
]

const PHQ9_Q9_LABELS = [
  { v: 0 as const, label: 'Not at all' },
  { v: 1 as const, label: 'Several days' },
  { v: 2 as const, label: 'More than half the days' },
  { v: 3 as const, label: 'Nearly every day' },
]

export default function PreBooking() {
  const navigate = useNavigate()
  const [concerns, setConcerns] = useState<string[]>([])
  const [urgency, setUrgency] = useState<Urgency | null>(null)
  const [q9, setQ9] = useState<0 | 1 | 2 | 3 | null>(null)
  const [showQ9Help, setShowQ9Help] = useState(false)

  const toggleConcern = (c: string) => {
    setConcerns(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  const canSubmit = concerns.length > 0 && urgency !== null && q9 !== null

  const handleSubmit = () => {
    if (!canSubmit) return
    const snapshot = saveTriage({ concerns, urgency: urgency!, phq9_q9: q9! })
    if (isCrisisFlagged(snapshot)) {
      navigate('/professionals?crisis=1', { replace: true })
    } else {
      navigate('/professionals', { replace: true })
    }
  }

  const handleSkip = () => navigate('/professionals', { replace: true })

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-violet-500 text-white shadow-md mb-4">
          <Heart size={24} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">A quick check-in before we match you</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Three short questions. It takes about 60 seconds and helps us surface therapists who actually fit what you're going through.
        </p>
      </div>

      <div className="space-y-6">
        {/* Q1 — concerns */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold shrink-0">1</div>
            <div>
              <h2 className="font-semibold text-gray-900">What would you like support with?</h2>
              <p className="text-sm text-gray-500">Pick as many as apply.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {CONCERN_OPTIONS.map(c => {
              const on = concerns.includes(c)
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleConcern(c)}
                  className={`px-3.5 py-2 rounded-full border text-sm transition ${
                    on
                      ? 'bg-gradient-to-r from-teal-600 to-violet-600 text-white border-transparent shadow'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-teal-400'
                  }`}
                >
                  {c}
                </button>
              )
            })}
          </div>
        </section>

        {/* Q2 — urgency */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold shrink-0">2</div>
            <div>
              <h2 className="font-semibold text-gray-900">How soon would you like to talk to someone?</h2>
              <p className="text-sm text-gray-500">There's no wrong answer.</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {URGENCY_OPTIONS.map(o => {
              const on = urgency === o.value
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setUrgency(o.value)}
                  className={`text-left p-4 rounded-xl border-2 transition ${
                    on
                      ? o.value === 'crisis'
                        ? 'border-red-500 bg-red-50'
                        : 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{o.icon}</span>
                    <span className={`font-semibold text-sm ${o.value === 'crisis' && on ? 'text-red-700' : 'text-gray-900'}`}>{o.label}</span>
                  </div>
                  <div className="text-xs text-gray-600">{o.hint}</div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Q3 — PHQ-9 Q9 */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold shrink-0">3</div>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900">
                Over the last two weeks, how often have you had thoughts that you would be better off dead, or of hurting yourself?
              </h2>
              <button
                type="button"
                onClick={() => setShowQ9Help(!showQ9Help)}
                className="text-xs text-teal-700 mt-1 underline"
              >
                Why we ask this
              </button>
              {showQ9Help && (
                <div className="mt-2 text-xs text-gray-600 leading-relaxed bg-gray-50 border border-gray-200 rounded-lg p-3">
                  Every therapy service asks this. If you're having these thoughts right now, we want to make sure the therapist you meet is trained to help.
                  Nothing about your answer is shared with anyone but you and your therapist.
                </div>
              )}
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {PHQ9_Q9_LABELS.map(o => {
              const on = q9 === o.v
              return (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => setQ9(o.v)}
                  className={`text-left px-4 py-3 rounded-xl border-2 transition text-sm ${
                    on
                      ? 'border-teal-500 bg-teal-50 text-teal-900 font-semibold'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-800'
                  }`}
                >
                  {o.label}
                </button>
              )
            })}
          </div>
        </section>

        {(urgency === 'crisis' || (q9 !== null && q9 >= 2)) && (
          <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-700 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-red-900 mb-1">If you're in danger right now</div>
                <p className="text-sm text-red-900 leading-relaxed mb-3">
                  If you can, please reach out to someone immediately. You're not alone and support is available.
                </p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <a href="tel:1199" className="px-3 py-2 rounded-lg bg-red-700 text-white font-semibold">
                    <Clock size={14} className="inline mr-1" /> Call 1199 · Emergency Kenya
                  </a>
                  <a href="mailto:crisis@afyayako.co.ke" className="px-3 py-2 rounded-lg bg-white border border-red-300 text-red-800 font-semibold">
                    crisis@afyayako.co.ke
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-start gap-3">
          <ShieldCheck size={18} className="text-teal-700 shrink-0 mt-0.5" />
          <div className="text-sm text-teal-900 leading-relaxed">
            Your answers stay on this device until you actually book. Once you book, only your therapist sees them — never your employer, and never anyone else.
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-800 underline"
          >
            Skip for now — I'll browse
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-600 to-violet-600 hover:from-teal-500 hover:to-violet-500 disabled:opacity-40 shadow"
          >
            <Sparkles size={16} /> See matched therapists <ArrowRight size={16} />
          </button>
        </div>

        <div className="text-center text-xs text-gray-500 pt-2">
          <Link to="/dashboard" className="underline">Back to dashboard</Link>
        </div>
      </div>
    </div>
  )
}
