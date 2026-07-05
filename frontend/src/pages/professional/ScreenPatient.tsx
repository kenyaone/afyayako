import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api from '../../api/axios'

const TOOLS = [
  { key: 'phq9', label: 'PHQ-9 — Depression' },
  { key: 'gad7', label: 'GAD-7 — Anxiety' },
  { key: 'audit', label: 'AUDIT — Alcohol Use' },
  { key: 'pgsi', label: 'PGSI — Problem Gambling' },
  { key: 'ftnd', label: 'FTND — Nicotine Dependence' },
]

interface Question { key: string; text: string; scale?: string[] }
interface ToolDef { title: string; description: string; scale?: string[]; questions: Question[] }

export default function ScreenPatient() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [type, setType] = useState('')
  const [tool, setTool] = useState<ToolDef | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<any | null>(null)

  useEffect(() => {
    if (!type) { setTool(null); return }
    setResult(null); setAnswers({}); setMessage('')
    api.get(`/assessments/questions/${type}`)
      .then(r => setTool(r.data))
      .catch(() => setMessage('Could not load this tool.'))
  }, [type])

  const allAnswered = tool && tool.questions.every(q => answers[q.key] !== undefined)

  const submit = async () => {
    if (!allAnswered) { setMessage('Please answer every question.'); return }
    setLoading(true); setMessage('')
    try {
      const res = await api.post(`/caseload/${id}/screening`, { assessment_type: type, responses: answers })
      if (res.data.success) setResult(res.data.assessment)
    } catch (e: any) {
      setMessage(e.response?.data?.error || 'Failed to save screening.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900"><ArrowLeft size={18} /></button>
          <h1 className="text-lg font-bold text-gray-900">Screen Patient</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8 space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-900 mb-2">Screening tool</label>
          <select value={type} onChange={e => setType(e.target.value)} className="input-field">
            <option value="">Choose a validated tool…</option>
            {TOOLS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
          <p className="text-xs text-gray-400 mt-2">Administer the questions with your patient; the result is saved to their record.</p>
        </div>

        {message && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">{message}</div>}

        {result ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center space-y-2">
            <div className="text-sm text-gray-500 uppercase">{type}</div>
            <div className="text-3xl font-black text-gray-900">Score: {result.score}</div>
            <div className="text-lg font-semibold text-primary-700">{result.severity}</div>
            <p className="text-sm text-gray-600">{result.interpretation}</p>
            {result.is_crisis_flag && (
              <p className="text-sm text-red-600 font-medium">⚠ Crisis flag raised — the care team has been alerted.</p>
            )}
            <button onClick={() => navigate(`/caseload/${id}`)} className="btn-primary mt-3">Back to patient</button>
          </div>
        ) : tool ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
            <p className="text-sm text-gray-600">{tool.description}</p>
            {tool.questions.map((q, qi) => {
              const scale = q.scale ?? tool.scale ?? []
              return (
                <div key={q.key} className="border-b border-gray-100 pb-4 last:border-0">
                  <p className="text-sm font-medium text-gray-900 mb-2">{qi + 1}. {q.text}</p>
                  <div className="space-y-1.5">
                    {scale.map((opt, oi) => (
                      <label key={oi} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name={q.key}
                          checked={answers[q.key] === oi}
                          onChange={() => setAnswers(a => ({ ...a, [q.key]: oi }))}
                          className="accent-primary-600"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
            <button onClick={submit} disabled={loading || !allAnswered} className="btn-primary w-full disabled:opacity-50">
              {loading ? 'Saving…' : 'Save screening result'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
