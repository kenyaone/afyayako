import { useEffect, useState } from 'react'
import { ClipboardList, User, Calendar, Plus, Loader2, AlertCircle } from 'lucide-react'
import api from '../../api/axios'

interface Supervisor {
  id: number
  supervisor: {
    user: { display_name: string }
  }
}

interface SupervisionSession {
  id: number
  session_date: string
  duration_minutes: number
  notes: string
}

export default function SupervisionDashboard() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [supervisees, setSupervisees] = useState<any[]>([])
  const [sessions, setSessions] = useState<SupervisionSession[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [supervisionId, setSupervisionId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    session_date: new Date().toISOString().split('T')[0],
    duration_minutes: 60,
    notes: '',
  })

  useEffect(() => {
    fetchSupervisionData()
  }, [])

  const fetchSupervisionData = async () => {
    setLoading(true)
    try {
      const [supRes, seeRes] = await Promise.all([
        api.get('/supervision/my-supervisors'),
        api.get('/supervision/my-supervisees'),
      ])
      setSupervisors(supRes.data.supervisors || [])
      setSupervisees(seeRes.data.supervisees || [])
    } catch (error) {
      console.error('Failed to fetch supervision data')
    } finally {
      setLoading(false)}
  }

  const fetchSessions = async (supId: number) => {
    try {
      const res = await api.get(`/supervision/${supId}/sessions`)
      setSessions(res.data.sessions || [])
    } catch (error) {
      console.error('Failed to fetch sessions')
    }
  }

  const handleLogSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supervisionId) return

    setSubmitting(true)
    try {
      await api.post(`/supervision/${supervisionId}/sessions`, formData)
      setFormData({
        session_date: new Date().toISOString().split('T')[0],
        duration_minutes: 60,
        notes: '',
      })
      setShowForm(false)
      fetchSessions(supervisionId)
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to log session')
    } finally {
      setSubmitting(false)
    }
  }

  const selectSupervision = (supId: number) => {
    setSupervisionId(supId)
    fetchSessions(supId)
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Professional Supervision</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your supervision relationships (MoH Guideline 9)</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
      ) : (
        <>
          {/* My Supervisors */}
          {supervisors.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <User size={20} className="text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">My Supervisors</h2>
              </div>
              <div className="space-y-3">
                {supervisors.map((sup) => (
                  <button
                    key={sup.id}
                    onClick={() => selectSupervision(sup.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      supervisionId === sup.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{sup.supervisor.user.display_name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {supervisees.find(s => s.id === sup.id)?.sessions?.length ?? 0} sessions logged
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Supervision Sessions */}
          {supervisionId && (
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList size={20} className="text-primary-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Supervision Sessions</h2>
                </div>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Plus size={16} />
                  Log Session
                </button>
              </div>

              {/* Form */}
              {showForm && (
                <form onSubmit={handleLogSession} className="bg-gray-50 p-4 rounded-lg space-y-4 border border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Session Date</label>
                    <input
                      type="date"
                      required
                      value={formData.session_date}
                      onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      max="600"
                      required
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      required
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Summary of supervision discussion..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                    >
                      {submitting ? 'Logging...' : 'Log Session'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Sessions List */}
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No supervision sessions logged yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">{new Date(session.session_date).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{session.duration_minutes} minutes</div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{session.notes}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Supervisees */}
          {supervisees.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <User size={20} className="text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">Supervisees</h2>
              </div>
              <div className="space-y-2">
                {supervisees.map((supervisee) => (
                  <div key={supervisee.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="font-medium text-gray-900">{supervisee.supervisee.user.display_name}</div>
                    <div className="text-sm text-gray-500 mt-1">{supervisee.sessions?.length ?? 0} sessions logged</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No supervision info */}
          {supervisors.length === 0 && supervisees.length === 0 && (
            <div className="card bg-amber-50 border border-amber-200">
              <div className="flex gap-3">
                <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">No supervision assigned yet</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Contact an administrator to assign you a supervisor. All professionals must have formal supervision as per MoH guidelines.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
