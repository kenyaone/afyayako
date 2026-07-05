import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, TrendingUp, Users, CheckCircle, Clock, BarChart3 } from 'lucide-react'
import api from '../../api/axios'

interface ClientAssessment {
  id: number
  client_name: string
  overall_risk: 'low' | 'moderate' | 'high' | 'critical'
  assessment_date: string
  suicidal_ideation: number
  self_harm: number
  substance_abuse: number
  violence_risk: number
}

interface ClinicalStats {
  total_clients: number
  critical_risk: number
  high_risk: number
  moderate_risk: number
  recent_assessments: ClientAssessment[]
}

const RISK_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 border-red-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  moderate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  low: 'bg-green-100 text-green-800 border-green-300',
}

export default function ClinicalDashboard() {
  const [stats, setStats] = useState<ClinicalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/assessments/clinical-dashboard')
        setStats(res.data)
      } catch (error) {
        console.error('Failed to fetch clinical dashboard', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading...</div>
  }

  if (!stats) {
    return <div className="flex items-center justify-center min-h-screen text-gray-500">No data available</div>
  }

  const filteredAssessments = stats.recent_assessments.filter(a => {
    if (filter === 'all') return true
    return a.overall_risk === filter
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clinical Assessment Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage client risk assessments and treatment plans</p>
      </div>

      {/* Risk Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase">Total Clients</p>
              <p className="text-3xl font-black text-gray-900 mt-2">{stats.total_clients}</p>
            </div>
            <Users size={24} className="text-blue-500" />
          </div>
        </div>

        <div className="card border-2 border-red-300 bg-red-50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-red-700 font-semibold uppercase">Critical Risk</p>
              <p className="text-3xl font-black text-red-900 mt-2">{stats.critical_risk}</p>
            </div>
            <AlertTriangle size={24} className="text-red-600" />
          </div>
          {stats.critical_risk > 0 && (
            <p className="text-xs text-red-700 mt-3 font-semibold">⚠ Requires immediate attention</p>
          )}
        </div>

        <div className="card border-2 border-orange-300 bg-orange-50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-orange-700 font-semibold uppercase">High Risk</p>
              <p className="text-3xl font-black text-orange-900 mt-2">{stats.high_risk}</p>
            </div>
            <TrendingUp size={24} className="text-orange-600" />
          </div>
        </div>

        <div className="card border-2 border-yellow-300 bg-yellow-50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-yellow-700 font-semibold uppercase">Moderate Risk</p>
              <p className="text-3xl font-black text-yellow-900 mt-2">{stats.moderate_risk}</p>
            </div>
            <Clock size={24} className="text-yellow-600" />
          </div>
        </div>
      </div>

      {/* New Assessment Button */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Assess a New Client</h2>
            <p className="text-blue-100 text-sm mt-1">Conduct risk screening and track clinical progress</p>
          </div>
          <Link
            to="/assessment/client-risk"
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            New Assessment
          </Link>
        </div>
      </div>

      {/* Assessments List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Recent Assessments</h2>
          <div className="flex gap-2">
            {['all', 'critical', 'high', 'moderate', 'low'].map(risk => (
              <button
                key={risk}
                onClick={() => setFilter(risk)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  filter === risk
                    ? `${RISK_COLORS[risk]} border-2`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {risk === 'all' ? 'All' : risk.charAt(0).toUpperCase() + risk.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredAssessments.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <BarChart3 size={32} className="mx-auto mb-3 opacity-40" />
            <p>No assessments found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAssessments.map(assessment => (
              <div
                key={assessment.id}
                className={`p-4 border-2 rounded-lg transition-all hover:shadow-md cursor-pointer ${RISK_COLORS[assessment.overall_risk]}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{assessment.client_name}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Assessed: {new Date(assessment.assessment_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black uppercase">{assessment.overall_risk}</p>
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      <div className="text-center">
                        <p className="text-xs font-semibold">SI</p>
                        <p className="text-lg font-black">{assessment.suicidal_ideation}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold">SH</p>
                        <p className="text-lg font-black">{assessment.self_harm}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold">SA</p>
                        <p className="text-lg font-black">{assessment.substance_abuse}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold">VR</p>
                        <p className="text-lg font-black">{assessment.violence_risk}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {assessment.overall_risk !== 'low' && (
                  <div className="mt-3 p-3 bg-black/10 rounded">
                    <p className="text-xs font-semibold">
                      {assessment.overall_risk === 'critical' && '🚨 Requires immediate intervention'}
                      {assessment.overall_risk === 'high' && '⚠️ High risk - Increase monitoring'}
                      {assessment.overall_risk === 'moderate' && '⚠️ Moderate risk - Safety planning recommended'}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4">Assessment Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="font-semibold text-gray-900">SI = Suicidal Ideation</p>
            <p className="text-gray-600">Thoughts of ending life</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">SH = Self-Harm</p>
            <p className="text-gray-600">Cutting, burning, injury</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">SA = Substance Abuse</p>
            <p className="text-gray-600">Drug/alcohol dependency</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">VR = Violence Risk</p>
            <p className="text-gray-600">Aggression toward others</p>
          </div>
        </div>
      </div>
    </div>
  )
}
