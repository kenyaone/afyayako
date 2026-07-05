import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, AlertCircle, CheckCircle } from 'lucide-react'
import api from '../../api/axios'

const PROQUOL_ITEMS = [
  { id: 1, text: 'I am happy', scale: 'CS' },
  { id: 2, text: 'I find my work fulfilling', scale: 'CS' },
  { id: 3, text: 'I have beliefs that sustain me', scale: 'CS' },
  { id: 4, text: 'I am proud of what I can do', scale: 'CS' },
  { id: 5, text: 'My work makes a positive difference', scale: 'CS' },
  { id: 6, text: 'I feel fulfilled by helping others', scale: 'CS' },
  { id: 7, text: 'My work is emotionally draining', scale: 'BO' },
  { id: 8, text: 'I feel burnt out from my work', scale: 'BO' },
  { id: 9, text: 'I feel I work too hard on my job', scale: 'BO' },
  { id: 10, text: 'I feel frustrated by my work', scale: 'BO' },
  { id: 11, text: 'I feel I am failing at work', scale: 'BO' },
  { id: 12, text: 'I worry that my work is hardening me emotionally', scale: 'BO' },
  { id: 13, text: 'I feel trapped by my job', scale: 'BO' },
  { id: 14, text: 'I feel hopeless about the future', scale: 'BO' },
  { id: 15, text: 'I have nightmares about my work', scale: 'STS' },
  { id: 16, text: 'I experience intrusive thoughts from my work', scale: 'STS' },
  { id: 17, text: 'I feel on edge from my work', scale: 'STS' },
  { id: 18, text: 'I feel angry from my work', scale: 'STS' },
  { id: 19, text: 'I think about work when I do not intend to', scale: 'STS' },
  { id: 20, text: 'My work feels meaningless to me', scale: 'STS' },
  { id: 21, text: 'I want to help people but feel exhausted', scale: 'CS' },
  { id: 22, text: 'I feel satisfied with my ability to help people', scale: 'CS' },
  { id: 23, text: 'I feel tired from my work', scale: 'BO' },
  { id: 24, text: 'I feel used up by my job', scale: 'BO' },
  { id: 25, text: 'I feel abandoned by people in my work', scale: 'STS' },
  { id: 26, text: 'I want to avoid others because they upset me', scale: 'STS' },
  { id: 27, text: 'I feel detached from people because of my work', scale: 'STS' },
  { id: 28, text: 'I feel numb around others because of my work', scale: 'STS' },
  { id: 29, text: 'I feel helpless about improving things', scale: 'STS' },
  { id: 30, text: 'I feel more callous toward people since taking this job', scale: 'STS' },
]

const RESPONSE_SCALE = [
  { value: 0, label: 'Never', abbr: 'N' },
  { value: 1, label: 'Rarely', abbr: 'R' },
  { value: 2, label: 'Sometimes', abbr: 'S' },
  { value: 3, label: 'Often', abbr: 'O' },
  { value: 4, label: 'Very Often', abbr: 'VO' },
]

export default function BurnoutAssessment() {
  const navigate = useNavigate()
  const [responses, setResponses] = useState<Record<number, number>>({})
  const [demographics, setDemographics] = useState({
    profession: '',
    years_experience: '',
    location: '',
    email: '',
  })
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState<'demographics' | 'assessment'>('demographics')

  const handleResponse = (itemId: number, value: number) => {
    setResponses(prev => ({ ...prev, [itemId]: value }))
  }

  const handleDemographic = (field: string, value: string) => {
    setDemographics(prev => ({ ...prev, [field]: value }))
  }

  const isAssessmentComplete = Object.keys(responses).length === 30
  const isDemographicsComplete = demographics.profession && demographics.years_experience && demographics.email

  const handleSubmit = async () => {
    if (!isAssessmentComplete || !isDemographicsComplete) return

    setLoading(true)
    try {
      const result = await api.post('/burnout/assess', {
        responses,
        ...demographics,
      })
      navigate(`/burnout-report/${result.data.assessment_id}`)
    } catch (error) {
      alert('Failed to submit assessment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium">
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="text-lg font-bold text-gray-900">ProQOL-5 Burnout Assessment</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-8">
        {page === 'demographics' ? (
          <>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about yourself</h2>
              <p className="text-gray-500 mb-8">This helps us personalize your report and track patterns across professions.</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Your Profession *</label>
                  <input
                    type="text"
                    placeholder="e.g., Therapist, Nurse, Teacher, Social Worker"
                    value={demographics.profession}
                    onChange={(e) => handleDemographic('profession', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Years of Experience *</label>
                  <select
                    value={demographics.years_experience}
                    onChange={(e) => handleDemographic('years_experience', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select experience level</option>
                    <option value="0-2">0-2 years</option>
                    <option value="2-5">2-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10-15">10-15 years</option>
                    <option value="15+">15+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Location / County (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Nairobi, Mombasa, Kisumu"
                    value={demographics.location}
                    onChange={(e) => handleDemographic('location', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Email for Report *</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={demographics.email}
                    onChange={(e) => handleDemographic('email', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="text-xs text-gray-400 mt-2">Your report will be sent here. We won't share your email.</p>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setPage('assessment')}
                  disabled={!isDemographicsComplete}
                  className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors"
                >
                  Continue to Assessment
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">ProQOL-5 Assessment</h2>
                  <p className="text-gray-500 text-sm mt-1">30 items • Rate each statement from Never to Very Often</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-teal-600">{Object.keys(responses).length}/30</p>
                  <p className="text-xs text-gray-400">Answered</p>
                </div>
              </div>

              <div className="space-y-6">
                {PROQUOL_ITEMS.map((item, idx) => (
                  <div key={item.id} className="pb-6 border-b border-gray-100 last:border-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{idx + 1}. {item.text}</p>
                      </div>
                      <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded ml-4 flex-shrink-0 text-gray-600">
                        {item.scale}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {RESPONSE_SCALE.map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => handleResponse(item.id, value)}
                          className={`flex-1 py-2.5 rounded-lg font-medium text-xs transition-all border ${
                            responses[item.id] === value
                              ? 'bg-teal-600 text-white border-teal-600'
                              : 'border-gray-200 text-gray-600 hover:border-teal-200 hover:bg-teal-50'
                          }`}
                          title={label}
                        >
                          <span className="hidden sm:inline">{label}</span>
                          <span className="sm:hidden">{label.charAt(0)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {isAssessmentComplete && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 text-sm">All items answered!</p>
                    <p className="text-green-700 text-xs mt-1">Click submit below to get your personalized report.</p>
                  </div>
                </div>
              )}

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setPage('demographics')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isAssessmentComplete || loading}
                  className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  {loading ? 'Generating Report...' : 'Get My Report'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
