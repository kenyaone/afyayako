import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Heart, Brain, TrendingDown, ClipboardList, Award } from 'lucide-react'
import api from '../../api/axios'

interface ScreeningTool {
  id: string
  name: string
  title: string
  condition?: string
  category?: string
  description: string
  items?: number
  duration_minutes?: number
  recommendation: string
}

interface Assessment {
  id: number
  type: string
  score: number
  severity: string
  interpretation: string
  created_at: string
}

type Tab = 'patient-tools' | 'patient-results' | 'professional-wellness'

export default function ScreeningTools() {
  const { consultationId } = useParams()
  const [tab, setTab] = useState<Tab>('patient-tools')
  const [tools, setTools] = useState<ScreeningTool[]>([])
  const [professionalTools, setProfessionalTools] = useState<ScreeningTool[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [professionalAssessments, setProfessionalAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [recommendingTool, setRecommendingTool] = useState(false)

  useEffect(() => {
    loadTools()
  }, [consultationId])

  const loadTools = async () => {
    setLoading(true)
    try {
      // Load WHO screening tools
      const toolsRes = await api.get('/screening-tools')
      setTools(toolsRes.data.tools)

      // Load professional wellness tools
      const proRes = await api.get('/professional/wellness-tools')
      setProfessionalTools(proRes.data.tools)

      if (consultationId) {
        // Load patient assessment results
        const assessRes = await api.get(`/consultations/${consultationId}/patient-assessments`)
        setAssessments(assessRes.data.assessments)
      }

      // Load professional's own assessments
      const proAssessRes = await api.get('/professional/wellness-assessments')
      setProfessionalAssessments(proAssessRes.data.assessments)
    } catch (err) {
      console.error('Failed to load tools:', err)
    } finally {
      setLoading(false)
    }
  }

  const recommendTool = async (toolId: string) => {
    if (!consultationId) return

    setRecommendingTool(true)
    try {
      await api.post(`/consultations/${consultationId}/recommend-tool`, {
        tool_id: toolId,
        reason: reason,
      })
      setSelectedTool(null)
      setReason('')
      await loadTools()
    } catch (err) {
      console.error('Failed to recommend tool:', err)
    } finally {
      setRecommendingTool(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading screening tools...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Screening Tools & Wellness</h1>
        <p className="text-gray-600 mt-2">WHO-recommended assessments for patient care and professional wellbeing</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setTab('patient-tools')}
          className={`pb-4 px-4 font-semibold border-b-2 ${
            tab === 'patient-tools'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <ClipboardList className="inline mr-2" size={18} />
          Patient Screening Tools
        </button>
        <button
          onClick={() => setTab('patient-results')}
          className={`pb-4 px-4 font-semibold border-b-2 ${
            tab === 'patient-results'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingDown className="inline mr-2" size={18} />
          Patient Results
        </button>
        <button
          onClick={() => setTab('professional-wellness')}
          className={`pb-4 px-4 font-semibold border-b-2 ${
            tab === 'professional-wellness'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Heart className="inline mr-2" size={18} />
          Professional Wellness
        </button>
      </div>

      {/* Patient Screening Tools Tab */}
      {tab === 'patient-tools' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-6">
            Recommend WHO-recognized screening tools to your patients to support clinical assessment and early intervention.
          </p>
          {tools.map(tool => (
            <div key={tool.id} className="bg-white rounded-lg p-6 border border-gray-200 hover:border-teal-300">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{tool.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{tool.title}</p>
                  <p className="text-gray-700 mt-3">{tool.description}</p>
                  <div className="flex gap-4 mt-3 text-sm text-gray-600">
                    {tool.items && <span>• {tool.items} items</span>}
                    {tool.duration_minutes && <span>• {tool.duration_minutes} min</span>}
                    {tool.condition && <span>• {tool.condition}</span>}
                  </div>
                  <p className="text-xs text-teal-600 mt-2 font-semibold">{tool.recommendation}</p>
                </div>
                {consultationId && (
                  <button
                    onClick={() => setSelectedTool(tool.id)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold whitespace-nowrap"
                  >
                    Recommend
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Recommendation Modal */}
          {selectedTool && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Recommend {tools.find(t => t.id === selectedTool)?.name}
                </h3>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Optional: Include why you're recommending this assessment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 mb-4 h-24"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedTool(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => recommendTool(selectedTool)}
                    disabled={recommendingTool}
                    className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold disabled:opacity-50"
                  >
                    {recommendingTool ? 'Recommending...' : 'Recommend'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Patient Results Tab */}
      {tab === 'patient-results' && (
        <div className="space-y-4">
          {assessments.length === 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center text-blue-800">
              <Brain size={32} className="mx-auto mb-2 opacity-50" />
              <p>No assessments completed yet.</p>
            </div>
          ) : (
            assessments.map(assessment => (
              <div key={assessment.id} className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{assessment.type.toUpperCase()}</h3>
                    <p className="text-gray-600 mt-1">Score: <span className="font-bold text-lg">{assessment.score}</span></p>
                    <p className={`mt-2 font-semibold ${
                      assessment.severity === 'severe' ? 'text-red-600' :
                      assessment.severity === 'moderate' ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      Severity: {assessment.severity}
                    </p>
                    <p className="text-gray-700 mt-3">{assessment.interpretation}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Completed: {new Date(assessment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Professional Wellness Tab */}
      {tab === 'professional-wellness' && (
        <div className="space-y-4">
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-6">
            <div className="flex gap-3">
              <Heart size={20} className="text-teal-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-teal-900">Monitor Your Wellbeing</h3>
                <p className="text-sm text-teal-800 mt-1">
                  Regular self-assessment helps identify burnout, stress, and compassion fatigue. Your data is confidential.
                </p>
              </div>
            </div>
          </div>

          {professionalTools.map(tool => (
            <div key={tool.id} className="bg-white rounded-lg p-6 border border-gray-200 hover:border-teal-300">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{tool.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{tool.title}</p>
                  <p className="text-gray-700 mt-3">{tool.description}</p>
                  <p className="text-xs text-teal-600 mt-2 font-semibold">{tool.recommendation}</p>
                </div>
                <button
                  disabled
                  className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg font-semibold whitespace-nowrap cursor-not-allowed opacity-50"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          ))}

          {professionalAssessments.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Your Assessment History</h3>
              <div className="space-y-4">
                {professionalAssessments.map(assessment => (
                  <div key={assessment.id} className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-start gap-3">
                      <Award size={20} className="text-teal-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{assessment.type.toUpperCase()}</h4>
                        <p className="text-gray-600 mt-1">Score: {assessment.score}</p>
                        <p className="text-gray-700 mt-2">{assessment.interpretation}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Completed: {new Date(assessment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
