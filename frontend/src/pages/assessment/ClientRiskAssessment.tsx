import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import api from '../../api/axios'

interface RiskScore {
  suicidal_ideation: number
  self_harm: number
  substance_abuse: number
  violence_risk: number
  crisis_indicators: number
  overall_risk: 'low' | 'moderate' | 'high' | 'critical'
}

const RISK_QUESTIONS = [
  {
    category: 'Suicidal Ideation',
    questions: [
      'Patient has expressed thoughts of ending their life',
      'Patient has a plan or method identified',
      'Patient has access to means (weapons, medications, etc.)',
      'Patient has recent loss or major stressor',
      'Patient has previous suicide attempts',
    ],
  },
  {
    category: 'Self-Harm',
    questions: [
      'Patient has engaged in cutting or burning',
      'Patient reports urges to self-harm',
      'Self-harm is frequent (daily or multiple times weekly)',
      'Injuries are severe or require medical attention',
      'Self-harm is triggered by specific situations',
    ],
  },
  {
    category: 'Substance Abuse',
    questions: [
      'Patient reports daily substance use',
      'Patient has attempted to quit but failed',
      'Substance use is affecting work/relationships',
      'Patient uses multiple substances',
      'Patient shows signs of withdrawal',
    ],
  },
  {
    category: 'Violence Risk',
    questions: [
      'Patient has history of violence or aggression',
      'Patient expresses anger toward specific individuals',
      'Patient has access to weapons',
      'Patient has poor impulse control',
      'Patient blames others for their problems',
    ],
  },
  {
    category: 'Crisis Indicators',
    questions: [
      'Patient is homeless or housing unstable',
      'Patient lacks social support system',
      'Patient has recent psychiatric hospitalization',
      'Patient is non-compliant with medication',
      'Patient reports hearing voices or paranoid thoughts',
    ],
  },
]

export default function ClientRiskAssessment() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'client-info' | 'assessment' | 'results'>('client-info')
  const [clientInfo, setClientInfo] = useState({
    client_name: '',
    client_id: '',
    assessment_date: new Date().toISOString().split('T')[0],
  })
  const [scores, setScores] = useState<Record<string, number>>({})
  const [results, setResults] = useState<RiskScore | null>(null)
  const [loading, setLoading] = useState(false)

  const handleScoreChange = (key: string, value: number) => {
    setScores(prev => ({ ...prev, [key]: value }))
  }

  const calculateRiskLevel = (total: number) => {
    if (total >= 20) return 'critical'
    if (total >= 15) return 'high'
    if (total >= 10) return 'moderate'
    return 'low'
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const totalScore = Object.values(scores).reduce((a, b) => a + b, 0)
      const riskResult: RiskScore = {
        suicidal_ideation: scores['suicidal'] || 0,
        self_harm: scores['self_harm'] || 0,
        substance_abuse: scores['substance'] || 0,
        violence_risk: scores['violence'] || 0,
        crisis_indicators: scores['crisis'] || 0,
        overall_risk: calculateRiskLevel(totalScore) as any,
      }

      await api.post('/assessments/client-risk', {
        ...clientInfo,
        ...riskResult,
      })

      setResults(riskResult)
      setStep('results')
    } catch (error) {
      alert('Failed to save assessment')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-900'
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-900'
      case 'moderate':
        return 'bg-yellow-100 border-yellow-300 text-yellow-900'
      default:
        return 'bg-green-100 border-green-300 text-green-900'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Client Risk Assessment</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-8">
        {/* Step 1: Client Info */}
        {step === 'client-info' && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Client Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Client Name *</label>
                <input
                  type="text"
                  placeholder="Full name or pseudonym"
                  value={clientInfo.client_name}
                  onChange={(e) => setClientInfo(prev => ({ ...prev, client_name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Client ID/Reference (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., CL-2026-001"
                  value={clientInfo.client_id}
                  onChange={(e) => setClientInfo(prev => ({ ...prev, client_id: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Assessment Date</label>
                <input
                  type="date"
                  value={clientInfo.assessment_date}
                  onChange={(e) => setClientInfo(prev => ({ ...prev, assessment_date: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('assessment')}
                disabled={!clientInfo.client_name}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold rounded-lg"
              >
                Continue to Assessment
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Risk Assessment */}
        {step === 'assessment' && (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex gap-4">
              <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Clinical Risk Assessment</p>
                <p className="text-red-800 text-sm mt-1">Rate each indicator: 0 = Not present, 1 = Present, 2 = Significant concern</p>
              </div>
            </div>

            {RISK_QUESTIONS.map((section) => (
              <div key={section.category} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{section.category}</h3>
                <div className="space-y-4">
                  {section.questions.map((question, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <p className="text-gray-700 text-sm">{question}</p>
                      <div className="flex gap-2">
                        {[0, 1, 2].map((score) => (
                          <button
                            key={score}
                            onClick={() => {
                              const key = `${section.category.toLowerCase().replace(/\s+/g, '_')}_${idx}`
                              handleScoreChange(key, score)
                            }}
                            className={`w-10 h-10 rounded-lg font-bold transition-all ${
                              scores[`${section.category.toLowerCase().replace(/\s+/g, '_')}_${idx}`] === score
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('client-info')}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold rounded-lg"
              >
                {loading ? 'Processing...' : 'Complete Assessment'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 'results' && results && (
          <div className="space-y-6">
            <div className={`rounded-2xl p-8 border-2 ${getRiskColor(results.overall_risk)}`}>
              <div className="flex items-center gap-3 mb-4">
                {results.overall_risk === 'low' ? (
                  <CheckCircle size={32} />
                ) : (
                  <AlertTriangle size={32} />
                )}
                <h2 className="text-3xl font-black">Overall Risk: {results.overall_risk.toUpperCase()}</h2>
              </div>
              <p className="text-sm">
                {results.overall_risk === 'critical' && 'Immediate intervention required. Consider hospitalization or crisis services.'}
                {results.overall_risk === 'high' && 'High risk. Increase monitoring frequency. Consider safety planning.'}
                {results.overall_risk === 'moderate' && 'Moderate risk. Develop safety plan. Monitor regularly.'}
                {results.overall_risk === 'low' && 'Low risk. Continue regular monitoring. Support therapy goals.'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Suicidal Ideation</p>
                <p className="text-2xl font-black text-gray-900">{results.suicidal_ideation}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Self-Harm</p>
                <p className="text-2xl font-black text-gray-900">{results.self_harm}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Substance Abuse</p>
                <p className="text-2xl font-black text-gray-900">{results.substance_abuse}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Violence Risk</p>
                <p className="text-2xl font-black text-gray-900">{results.violence_risk}</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold text-blue-900 mb-3">Recommended Actions</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                {results.overall_risk === 'critical' && (
                  <>
                    <li>• Immediately contact emergency services or psychiatric hospital</li>
                    <li>• Do not leave client alone</li>
                    <li>• Remove access to means of harm</li>
                    <li>• Contact emergency contacts/family</li>
                  </>
                )}
                {results.overall_risk === 'high' && (
                  <>
                    <li>• Develop comprehensive safety plan with client</li>
                    <li>• Increase session frequency (weekly minimum)</li>
                    <li>• Monitor medication compliance</li>
                    <li>• Consider referral to psychiatry</li>
                  </>
                )}
                {results.overall_risk === 'moderate' && (
                  <>
                    <li>• Create detailed safety plan</li>
                    <li>• Schedule regular check-ins</li>
                    <li>• Teach coping and distress tolerance skills</li>
                    <li>• Monitor for escalation</li>
                  </>
                )}
                {results.overall_risk === 'low' && (
                  <>
                    <li>• Continue current treatment plan</li>
                    <li>• Regular monitoring (monthly minimum)</li>
                    <li>• Support strengths and resilience</li>
                    <li>• Review safety plan periodically</li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg"
              >
                Return to Dashboard
              </button>
              <button
                onClick={() => {
                  setStep('client-info')
                  setScores({})
                  setResults(null)
                  setClientInfo({ client_name: '', client_id: '', assessment_date: new Date().toISOString().split('T')[0] })
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
              >
                New Assessment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
