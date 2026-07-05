import { useEffect, useState } from 'react'
import { AlertTriangle, TrendingUp, BarChart3, Lock, FileText, Trash2, Loader2, ChevronRight, AlertCircle } from 'lucide-react'
import api from '../../api/axios'

interface Incident {
  id: number
  type: string
  title: string
  severity: string
  status: string
  created_at: string
}

interface Complaint {
  id: number
  professional: { user: { display_name: string } }
  title: string
  status: string
  severity: string
  created_at: string
}

interface QualityMetric {
  id: number
  metric_type: string
  metric_value: number
  professional?: { user: { display_name: string } }
  metric_date: string
}

export default function ComplianceDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [metrics, setMetrics] = useState<QualityMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'incidents' | 'complaints' | 'quality' | 'retention'>('incidents')

  useEffect(() => {
    fetchComplianceData()
  }, [])

  const fetchComplianceData = async () => {
    setLoading(true)
    try {
      const [incRes, compRes, metRes] = await Promise.all([
        api.get('/admin/compliance/incidents?status=open'),
        api.get('/admin/compliance/complaints?status=filed'),
        api.get('/admin/compliance/quality-metrics'),
      ])
      setIncidents(incRes.data?.data || [])
      setComplaints(compRes.data?.data || [])
      setMetrics(metRes.data?.data || [])
    } catch (error) {
      console.error('Failed to fetch compliance data', error)
      // Set empty arrays on error so component still renders
      setIncidents([])
      setComplaints([])
      setMetrics([])
    } finally {
      setLoading(false)
    }
  }

  const openIncidents = incidents.filter(i => i.status === 'open')
  const criticalIncidents = incidents.filter(i => i.severity === 'critical')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Compliance & Quality</h1>
        <p className="text-gray-600 mt-1">Monitor incidents, complaints, and service quality metrics</p>
      </div>

      {/* KPI Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-700 text-sm font-medium">Open Incidents</p>
                <p className="text-3xl font-bold text-red-900 mt-1">{openIncidents.length}</p>
              </div>
              <AlertTriangle size={32} className="text-red-500" />
            </div>
          </div>

          <div className={`${criticalIncidents.length > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'} rounded-lg p-4 border`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${criticalIncidents.length > 0 ? 'text-orange-700' : 'text-green-700'} text-sm font-medium`}>Critical Issues</p>
                <p className={`text-3xl font-bold mt-1 ${criticalIncidents.length > 0 ? 'text-orange-900' : 'text-green-900'}`}>{criticalIncidents.length}</p>
              </div>
              <AlertCircle size={32} className={criticalIncidents.length > 0 ? 'text-orange-500' : 'text-green-500'} />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-700 text-sm font-medium">Complaints Filed</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{complaints.length}</p>
              </div>
              <FileText size={32} className="text-blue-500" />
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-700 text-sm font-medium">Avg Quality Score</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">
                  {metrics.length > 0 ? (metrics.reduce((sum, m) => sum + m.metric_value, 0) / metrics.length).toFixed(1) : 'N/A'}
                </p>
              </div>
              <TrendingUp size={32} className="text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="border-b border-gray-200 flex gap-1">
            {[
              { key: 'incidents', label: '🚨 Incidents', count: openIncidents.length },
              { key: 'complaints', label: '⚖️ Complaints', count: complaints.length },
              { key: 'quality', label: '📊 Quality Metrics', count: metrics.length },
              { key: 'retention', label: '🗑️ Data Retention' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label} {tab.count ? `(${tab.count})` : ''}
              </button>
            ))}
          </div>

          {/* Content */}
          <div>
            {activeTab === 'incidents' && (
              <div className="space-y-3">
                {openIncidents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No open incidents</div>
                ) : (
                  openIncidents.map(incident => (
                    <div key={incident.id} className={`p-4 rounded-lg border-l-4 ${
                      incident.severity === 'critical' ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{incident.title}</p>
                          <p className="text-sm text-gray-600 mt-1">Type: {incident.type.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(incident.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          incident.severity === 'critical' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                        }`}>
                          {incident.severity}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'complaints' && (
              <div className="space-y-3">
                {complaints.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No complaints filed</div>
                ) : (
                  complaints.map(complaint => (
                    <div key={complaint.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{complaint.title}</p>
                          <p className="text-sm text-gray-600 mt-1">Against: {complaint.professional.user.display_name}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(complaint.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            complaint.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            complaint.severity === 'severe' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {complaint.severity}
                          </span>
                          <p className="text-xs text-gray-500 mt-2">{complaint.status}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'quality' && (
              <div className="space-y-3">
                {metrics.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No quality metrics recorded</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {metrics.map(metric => (
                      <div key={metric.id} className="p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 font-medium capitalize">{metric.metric_type.replace(/_/g, ' ')}</p>
                        <p className="text-3xl font-bold text-primary-600 mt-2">{metric.metric_value.toFixed(1)}%</p>
                        {metric.professional && (
                          <p className="text-xs text-gray-500 mt-2">{metric.professional.user.display_name}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{new Date(metric.metric_date).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'retention' && (
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <div className="flex gap-3">
                  <Lock className="text-blue-600 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="font-semibold text-blue-900">Data Retention Management</h3>
                    <p className="text-sm text-blue-700 mt-2">
                      ✓ Automated daily data cleanup based on retention policies<br/>
                      ✓ Compliance audit trail of all deletions<br/>
                      ✓ Configurable retention periods per entity type<br/>
                      ✓ Command: php artisan compliance:data-retention
                    </p>
                    <div className="mt-4 p-3 bg-white rounded border border-blue-200 text-xs">
                      <p className="font-mono text-gray-700">
                        Default retention policies:<br/>
                        • Mood logs: 365 days<br/>
                        • Assessments: 365 days<br/>
                        • Journal entries: 365 days<br/>
                        • Consultations: Keep indefinitely (anonymized after 2 years)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
