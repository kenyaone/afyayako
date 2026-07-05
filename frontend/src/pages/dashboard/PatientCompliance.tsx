import { useEffect, useState } from 'react'
import { AlertTriangle, FileText, CheckCircle, Clock, AlertCircle, Plus, Loader2 } from 'lucide-react'
import api from '../../api/axios'

interface Incident {
  id: number
  type: string
  title: string
  description: string
  severity: string
  status: string
  resolution_notes?: string
  created_at: string
  resolved_at?: string
}

interface Complaint {
  id: number
  title: string
  description: string
  professional: { user: { display_name: string } }
  severity: string
  status: string
  investigation_notes?: string
  created_at: string
  resolved_at?: string
}

export default function PatientCompliance() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'incidents' | 'complaints'>('incidents')
  const [showReportForm, setShowReportForm] = useState(false)
  const [formData, setFormData] = useState({
    type: 'complaint',
    title: '',
    description: '',
    severity: 'medium',
    professional_id: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchMyReports()
  }, [])

  const fetchMyReports = async () => {
    setLoading(true)
    try {
      const [incRes, compRes] = await Promise.all([
        api.get('/compliance/my-incidents'),
        api.get('/compliance/my-complaints'),
      ]).catch(() => [{ data: { incidents: [] } }, { data: { complaints: [] } }])

      setIncidents(incRes?.data?.incidents || [])
      setComplaints(compRes?.data?.complaints || [])
    } catch (error) {
      console.error('Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }

  const handleReportIncident = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/compliance/report-incident', {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        severity: formData.severity,
        professional_id: formData.professional_id ? parseInt(formData.professional_id) : undefined,
      })

      setFormData({
        type: 'complaint',
        title: '',
        description: '',
        severity: 'medium',
        professional_id: '',
      })
      setShowReportForm(false)
      await fetchMyReports()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to report incident')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-50 border-blue-200 text-blue-900'
      case 'investigating':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900'
      case 'resolved':
        return 'bg-green-50 border-green-200 text-green-900'
      case 'closed':
        return 'bg-gray-50 border-gray-200 text-gray-900'
      case 'dismissed':
        return 'bg-gray-50 border-gray-200 text-gray-900'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-green-600 bg-green-50'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'high':
        return 'text-orange-600 bg-orange-50'
      case 'critical':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle size={16} className="text-blue-600" />
      case 'investigating':
        return <Clock size={16} className="text-yellow-600" />
      case 'resolved':
        return <CheckCircle size={16} className="text-green-600" />
      case 'closed':
        return <CheckCircle size={16} className="text-gray-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Reports & Complaints</h1>
        <p className="text-gray-600 mt-1">Track incidents and complaints you've submitted</p>
      </div>

      {/* Report Button */}
      {!showReportForm && (
        <button
          onClick={() => setShowReportForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          Report an Issue
        </button>
      )}

      {/* Report Form */}
      {showReportForm && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Report an Incident or Complaint</h2>

          <form onSubmit={handleReportIncident} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="adverse_event">Adverse Event (negative outcome)</option>
                <option value="complaint">Complaint (about service/professional)</option>
                <option value="near_miss">Near Miss (could have gone wrong)</option>
                <option value="safety_concern">Safety Concern</option>
                <option value="quality_issue">Quality Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                required
                placeholder="Brief title of the issue"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                placeholder="Detailed description of what happened"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows={5}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional (optional)</label>
                <input
                  type="number"
                  placeholder="Professional ID"
                  value={formData.professional_id}
                  onChange={(e) => setFormData({ ...formData, professional_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
              <button
                type="button"
                onClick={() => setShowReportForm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
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
              { key: 'incidents', label: '🚨 Incidents', count: incidents.length },
              { key: 'complaints', label: '⚖️ Complaints', count: complaints.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Content */}
          {activeTab === 'incidents' && (
            <div className="space-y-3">
              {incidents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No incidents reported yet</p>
                </div>
              ) : (
                incidents.map((incident) => (
                  <div
                    key={incident.id}
                    className={`border rounded-lg p-4 ${getStatusColor(incident.status)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(incident.status)}
                        <div>
                          <p className="font-semibold">{incident.title}</p>
                          <p className="text-sm opacity-75 mt-1">{incident.description}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(incident.severity)}`}>
                        {incident.severity.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs opacity-75 mt-3 pt-3 border-t border-current border-opacity-20">
                      <div>
                        <p className="font-medium">Status: <span className="capitalize font-semibold">{incident.status}</span></p>
                        <p>Type: {incident.type.replace(/_/g, ' ')}</p>
                      </div>
                      <div className="text-right">
                        <p>{new Date(incident.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {incident.resolution_notes && (
                      <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                        <p className="text-xs font-semibold mb-1">Resolution:</p>
                        <p className="text-sm">{incident.resolution_notes}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'complaints' && (
            <div className="space-y-3">
              {complaints.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No complaints filed yet</p>
                </div>
              ) : (
                complaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className={`border rounded-lg p-4 ${getStatusColor(complaint.status)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(complaint.status)}
                        <div>
                          <p className="font-semibold">{complaint.title}</p>
                          <p className="text-sm opacity-75">Against: {complaint.professional.user.display_name}</p>
                          <p className="text-sm opacity-75 mt-1">{complaint.description}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(complaint.severity)}`}>
                        {complaint.severity.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs opacity-75 mt-3 pt-3 border-t border-current border-opacity-20">
                      <div>
                        <p className="font-medium">Status: <span className="capitalize font-semibold">{complaint.status}</span></p>
                      </div>
                      <div className="text-right">
                        <p>{new Date(complaint.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {complaint.investigation_notes && (
                      <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                        <p className="text-xs font-semibold mb-1">Investigation Notes:</p>
                        <p className="text-sm">{complaint.investigation_notes}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900 font-medium">ℹ️ Confidentiality Notice</p>
        <p className="text-xs text-blue-700 mt-2">
          All reports and complaints are handled confidentially. You can track the status of your reports here.
          Our team will investigate and resolve your concerns as quickly as possible.
        </p>
      </div>
    </div>
  )
}
