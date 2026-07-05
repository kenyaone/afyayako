import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import type { Assessment } from '../../types'
import { ClipboardList, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

const TOOLS = [
  { type: 'phq9', name: 'PHQ-9', desc: 'Depression screening (9 questions)', color: 'bg-blue-50 border-blue-200', badge: 'Depression' },
  { type: 'gad7', name: 'GAD-7', desc: 'Anxiety screening (7 questions)', color: 'bg-purple-50 border-purple-200', badge: 'Anxiety' },
  { type: 'audit', name: 'AUDIT', desc: 'Alcohol use assessment (10 questions)', color: 'bg-amber-50 border-amber-200', badge: 'Alcohol' },
  { type: 'pgsi', name: 'PGSI', desc: 'Gambling disorder screening (9 questions)', color: 'bg-orange-50 border-orange-200', badge: 'Gambling' },
  { type: 'ftnd', name: 'FTND', desc: 'Nicotine dependence test (6 questions)', color: 'bg-teal-50 border-teal-200', badge: 'Tobacco' },
]

const severityColor: Record<string, string> = {
  'Minimal': 'text-green-600 bg-green-50',
  'Mild': 'text-yellow-600 bg-yellow-50',
  'Moderate': 'text-orange-600 bg-orange-50',
  'Moderately Severe': 'text-red-600 bg-red-50',
  'Severe': 'text-red-700 bg-red-100',
  'Low Risk': 'text-green-600 bg-green-50',
  'Hazardous': 'text-yellow-600 bg-yellow-50',
  'Harmful': 'text-orange-600 bg-orange-50',
  'Possible Dependence': 'text-red-600 bg-red-50',
  'Non-Problem': 'text-green-600 bg-green-50',
  'Low Dependence': 'text-yellow-600 bg-yellow-50',
  'Medium Dependence': 'text-orange-600 bg-orange-50',
  'High Dependence': 'text-red-600 bg-red-50',
  'Very High Dependence': 'text-red-700 bg-red-100',
}

export default function Assessments() {
  const [history, setHistory] = useState<Assessment[]>([])

  useEffect(() => {
    api.get('/assessments').then(r => setHistory(r.data.data ?? r.data.results ?? r.data))
  }, [])

  const lastByType: Record<string, Assessment> = {}
  history.forEach(a => { if (!lastByType[a.assessment_type]) lastByType[a.assessment_type] = a })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Health Assessments</h1>
        <p className="text-gray-500 mt-1">Validated clinical tools to understand your mental health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((tool) => {
          const last = lastByType[tool.type]
          return (
            <div key={tool.type} className={`card border ${tool.color} relative`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{tool.badge}</span>
                  <h3 className="text-lg font-bold text-gray-900 mt-2">{tool.name}</h3>
                  <p className="text-sm text-gray-600">{tool.desc}</p>
                </div>
                <ClipboardList size={20} className="text-gray-400 flex-shrink-0" />
              </div>

              {last && (
                <div className="mb-3 p-2 bg-white rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-400 mb-1">Last result — {format(new Date(last.created_at), 'MMM d')}</div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">Score: {last.score}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColor[last.severity] || 'text-gray-600 bg-gray-100'}`}>
                      {last.severity}
                    </span>
                  </div>
                </div>
              )}

              <Link
                to={`/assessments/${tool.type}`}
                className="flex items-center justify-center gap-2 w-full py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {last ? 'Retake Assessment' : 'Start Assessment'}
                <ChevronRight size={16} />
              </Link>
            </div>
          )
        })}
      </div>

      {history.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Assessment History</h2>
          <div className="space-y-2">
            {history.map((a) => (
              <div key={a.id} className="card flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900">{a.assessment_type_display}</span>
                  <span className="text-gray-400 text-sm ml-2">· Score: {a.score}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColor[a.severity] || 'text-gray-600 bg-gray-100'}`}>
                    {a.severity}
                  </span>
                  <span className="text-xs text-gray-400">{format(new Date(a.created_at), 'MMM d, yyyy')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
