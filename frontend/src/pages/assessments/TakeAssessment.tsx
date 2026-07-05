import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuthStore } from '../../api/../store/authStore'
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Sparkles, Star, Loader2 } from 'lucide-react'

interface Question { key: string; text: string; scale?: string[] }
interface AssessmentData {
  title: string
  description: string
  scale?: string[]
  questions: Question[]
}

interface MatchedPro {
  id: number
  display_name: string
  rate_per_hour: number
  match_pct: number
  match_reasons: string[]
  specializations: { name: string }[]
  languages: { name: string }[]
  rating: number
  years_experience: number
  bio: string
  kmpdc_license: string
  gender: string
  is_top_match: boolean
}

export default function TakeAssessment() {
  const { type } = useParams<{ type: string }>()
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const isProfessional = user?.role === 'professional'
  const [data, setData] = useState<AssessmentData | null>(null)
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [current, setCurrent] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [aiInsight, setAiInsight] = useState('')
  const [aiInsightLoading, setAiInsightLoading] = useState(false)
  const [matches, setMatches] = useState<MatchedPro[]>([])
  const [matchExplanations, setMatchExplanations] = useState<Record<number, string>>({})
  const [langFilter, setLangFilter] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [filterLoading, setFilterLoading] = useState(false)
  const [savedResult, setSavedResult] = useState<any>(null)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    api.get(`/assessments/questions/${type}`).then(r => setData(r.data))
  }, [type])

  if (!data) return <div className="flex justify-center py-20 text-gray-500">Loading assessment...</div>

  const questions = data.questions
  const question = questions[current]
  const scale = question.scale || data.scale || []
  const allAnswered = questions.every(q => responses[q.key] !== undefined)

  const handleAnswer = (val: number) => {
    setResponses(prev => ({ ...prev, [question.key]: val }))
    if (current < questions.length - 1) {
      setTimeout(() => setCurrent(c => c + 1), 300)
    }
  }

  const fetchMatches = async (res: any, lang = '', gender = '') => {
    const params = new URLSearchParams({ type: type! })
    if (res.score)    params.set('score', String(res.score))
    if (res.severity) params.set('severity', res.severity)
    if (lang)         params.set('language', lang)
    if (gender)       params.set('gender', gender)

    const r = await api.get(`/assessments/recommend?${params}`)
    const topMatches: MatchedPro[] = r.data.matches ?? []
    setMatches(topMatches)
    setMatchExplanations({})
    topMatches.slice(0, 3).forEach(pro => {
      api.post('/ai/match-explain', {
        professional_id: pro.id,
        assessment_type: type,
        match_pct: pro.match_pct,
        match_reasons: pro.match_reasons,
      })
        .then(r => setMatchExplanations(prev => ({ ...prev, [pro.id]: r.data.explanation })))
        .catch(() => {})
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setSubmitError('')
    try {
      const res = await api.post('/assessments', { assessment_type: type, responses })
      const a = res.data.assessment ?? res.data
      const fullResult = { ...a, is_crisis_flag: res.data.crisis ?? a.is_crisis_flag }
      setResult(fullResult)
      setSavedResult(fullResult)

      setAiInsightLoading(true)
      Promise.all([
        api.post('/ai/assessment-insight', {
          assessment_type: type,
          score: fullResult.score,
          severity: fullResult.severity,
          interpretation: fullResult.interpretation,
        })
          .then(r => setAiInsight(r.data.insight || ''))
          .catch(() => setAiInsight('')),

        !isProfessional ? fetchMatches(fullResult) : Promise.resolve(),
      ]).finally(() => setAiInsightLoading(false))
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Could not save your results. Please make sure you are logged in and try again.'
      setSubmitError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = async (lang: string, gender: string) => {
    if (!savedResult) return
    setFilterLoading(true)
    try {
      await fetchMatches(savedResult, lang, gender)
    } finally {
      setFilterLoading(false)
    }
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="text-center mb-6">
            {result.is_crisis_flag ? (
              <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
            ) : (
              <CheckCircle size={48} className="text-primary-600 mx-auto mb-3" />
            )}
            <h2 className="text-xl font-bold text-gray-900">{data.title} — Complete</h2>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600">Your Score</span>
              <span className="text-3xl font-bold text-primary-700">{result.score}</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-2">{result.severity}</div>
            <p className="text-gray-700 text-sm">{result.interpretation}</p>
          </div>

          {result.is_crisis_flag && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-4 mb-5">
              <div className="font-semibold text-red-800 mb-2">⚠️ We noticed something important</div>
              <p className="text-red-700 text-sm mb-3">
                Your response suggests you may be having thoughts of self-harm. You are not alone.
                Please reach out immediately.
              </p>
              <div className="space-y-1 text-sm text-red-800">
                <div>📞 <strong>Befrienders Kenya: 0800 723 253</strong> (Free, 24/7)</div>
                <div>📞 <strong>NACADA: 1192</strong> (Free, 24/7)</div>
              </div>
            </div>
          )}

          {/* AI Insight */}
          <div className="bg-primary-50 rounded-xl p-4 mb-5">
            <div className="flex items-center gap-2 font-medium text-primary-800 mb-2">
              <Sparkles size={15} />
              {aiInsightLoading ? 'Generating personalised insight…' : 'Your Insight'}
            </div>
            {aiInsightLoading ? (
              <div className="flex items-center gap-2 text-primary-600 text-sm">
                <Loader2 size={14} className="animate-spin" /> Analysing your responses…
              </div>
            ) : (
              <p className="text-primary-700 text-sm leading-relaxed">
                {aiInsight || result.recommendations}
              </p>
            )}
          </div>

          {/* Matched Professionals */}
          {matches.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2 font-semibold text-gray-900">
                  <Sparkles size={15} className="text-primary-600" />
                  Professionals matched to your results
                </div>
                {filterLoading && <Loader2 size={14} className="animate-spin text-primary-500" />}
              </div>

              {/* Preference filters */}
              <div className="flex gap-2 flex-wrap mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-xs text-gray-500 font-medium self-center mr-1">Refine:</div>
                <select
                  value={langFilter}
                  onChange={e => { setLangFilter(e.target.value); handleFilterChange(e.target.value, genderFilter) }}
                  className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-400"
                >
                  <option value="">Any language</option>
                  <option value="English">English</option>
                  <option value="Kiswahili">Kiswahili</option>
                  <option value="Kikuyu">Kikuyu</option>
                  <option value="Luo">Luo</option>
                  <option value="Kamba">Kamba</option>
                </select>
                <select
                  value={genderFilter}
                  onChange={e => { setGenderFilter(e.target.value); handleFilterChange(langFilter, e.target.value) }}
                  className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-400"
                >
                  <option value="">Any gender</option>
                  <option value="male">Male therapist</option>
                  <option value="female">Female therapist</option>
                </select>
              </div>
              <div className="space-y-3">
                {matches.slice(0, 3).map(pro => (
                  <div key={pro.id} className={`border rounded-xl p-4 bg-white ${pro.is_top_match ? 'border-primary-400 ring-1 ring-primary-300' : 'border-gray-200'}`}>
                    {/* Top badge */}
                    {pro.is_top_match && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded-full px-2.5 py-0.5 w-fit mb-2">
                        <Star size={10} className="fill-primary-500 text-primary-500" /> Best Match
                      </div>
                    )}

                    {/* Header: avatar + name + match% */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg flex-shrink-0">
                          {pro.display_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{pro.display_name}</div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {pro.rating ? (
                              <div className="flex items-center gap-0.5 text-xs text-amber-600">
                                <Star size={11} className="fill-amber-400 text-amber-400" />
                                <span className="font-medium">{Number(pro.rating).toFixed(1)}</span>
                              </div>
                            ) : null}
                            {pro.years_experience ? (
                              <span className="text-xs text-gray-500">{pro.years_experience} yrs exp</span>
                            ) : null}
                            {pro.gender ? (
                              <span className="text-xs text-gray-400 capitalize">{pro.gender}</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <div className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${pro.match_pct >= 80 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {pro.match_pct}% match
                        </div>
                        <div className="text-xs text-gray-500 mt-1 font-medium">KES {Number(pro.rate_per_hour).toLocaleString()}/hr</div>
                      </div>
                    </div>

                    {/* License */}
                    {pro.kmpdc_license && (
                      <div className="text-xs text-gray-500 mb-2">
                        License: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{pro.kmpdc_license}</span>
                      </div>
                    )}

                    {/* Bio */}
                    {pro.bio && (
                      <p className="text-xs text-gray-600 leading-relaxed mb-2 line-clamp-2">{pro.bio}</p>
                    )}

                    {/* Specializations */}
                    {pro.specializations?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {pro.specializations.map(s => (
                          <span key={s.name} className="bg-blue-50 text-blue-700 border border-blue-100 text-xs px-2 py-0.5 rounded-full">{s.name}</span>
                        ))}
                      </div>
                    )}

                    {/* Languages */}
                    {pro.languages?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {pro.languages.map(l => (
                          <span key={l.name} className="bg-green-50 text-green-700 border border-green-100 text-xs px-2 py-0.5 rounded-full">{l.name}</span>
                        ))}
                      </div>
                    )}

                    {/* AI match explanation */}
                    {matchExplanations[pro.id] ? (
                      <p className="text-xs text-gray-600 italic mt-1 mb-3 leading-relaxed border-t border-gray-100 pt-2">
                        <Sparkles size={10} className="inline text-primary-400 mr-1" />
                        {matchExplanations[pro.id]}
                      </p>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mb-3 border-t border-gray-100 pt-2">
                        <Loader2 size={10} className="animate-spin" /> Generating match explanation…
                      </div>
                    )}

                    {/* Match reason tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {pro.match_reasons.map(r => (
                        <span key={r} className="bg-primary-50 text-primary-700 text-xs px-2 py-0.5 rounded-full">{r}</span>
                      ))}
                    </div>

                    {!isProfessional && (
                      <Link to={`/book/${pro.id}`} className="btn-primary text-xs py-1.5 w-full text-center block">
                        Book Session
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => navigate('/professionals')} className="btn-primary flex-1">
              All Professionals
            </button>
            <button onClick={() => navigate('/assessments')} className="btn-secondary flex-1">
              Back to Assessments
            </button>
          </div>
        </div>
      </div>
    )
  }

  const progress = ((current) / questions.length) * 100

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/assessments')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ChevronLeft size={16} /> Back
        </button>
        <h1 className="text-xl font-bold text-gray-900">{data.title}</h1>
        <p className="text-gray-500 text-sm mt-1">{data.description}</p>
        <div className="mt-3 h-1.5 bg-gray-200 rounded-full">
          <div className="h-full bg-primary-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="text-xs text-gray-400 mt-1 text-right">{current + 1} of {questions.length}</div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-1 leading-snug">{question.text}</h2>
        <p className="text-xs text-gray-400 mb-5">Tap the option that best describes your experience</p>
        <div className="space-y-2.5">
          {scale.map((label, i) => {
            const isSelected = responses[question.key] === i
            const colors = [
              'border-emerald-400 bg-emerald-50 text-emerald-800',
              'border-amber-400 bg-amber-50 text-amber-800',
              'border-orange-400 bg-orange-50 text-orange-800',
              'border-red-400 bg-red-50 text-red-800',
            ]
            const nums = ['0', '1', '2', '3']
            const numColors = [
              'bg-emerald-500 text-white',
              'bg-amber-500 text-white',
              'bg-orange-500 text-white',
              'bg-red-500 text-white',
            ]
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all flex items-center gap-4 ${
                  isSelected
                    ? colors[i] + ' shadow-sm scale-[1.01]'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 hover:scale-[1.005]'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isSelected ? numColors[i] : 'bg-gray-100 text-gray-500'}`}>
                  {i < nums.length ? nums[i] : i}
                </div>
                <span className={`text-sm font-medium leading-snug ${isSelected ? '' : 'text-gray-700'}`}>{label}</span>
                {isSelected && <span className="ml-auto text-lg">✓</span>}
              </button>
            )
          })}
        </div>

        {submitError && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-start gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrent(c => Math.max(0, c - 1))}
            disabled={current === 0}
            className="btn-secondary disabled:opacity-40"
          >
            <ChevronLeft size={16} className="inline" /> Previous
          </button>

          {current === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Calculating...' : 'See Results'}
            </button>
          ) : (
            <button
              onClick={() => setCurrent(c => c + 1)}
              disabled={responses[question.key] === undefined}
              className="btn-primary disabled:opacity-50"
            >
              Next <ChevronRight size={16} className="inline" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
