import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Calendar, Clock } from 'lucide-react'
import api from '../../api/axios'

interface Session {
  date: string
  time: string
  notes: string
}

export default function TreatmentPlanForm() {
  const { consultationId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [formData, setFormData] = useState({
    description: '',
    duration_weeks: 4,
    sessions_per_week: 2,
    cost_per_session: 500,
  })

  const [sessions, setSessions] = useState<Session[]>([
    { date: '', time: '', notes: '' }
  ])

  // Edit mode: if a plan already exists for this consultation, load it.
  const [planId, setPlanId] = useState<number | null>(null)
  const [planStatus, setPlanStatus] = useState<string | null>(null)
  const isEdit = planId !== null

  useEffect(() => {
    if (!consultationId) return
    api.get(`/treatment-plans/${consultationId}`)
      .then(res => {
        const p = res.data?.plan
        if (p) {
          setPlanId(p.id)
          setPlanStatus(p.status)
          setFormData({
            description: p.description ?? '',
            duration_weeks: p.duration_weeks ?? 4,
            sessions_per_week: p.sessions_per_week ?? 2,
            cost_per_session: Number(p.cost_per_session ?? 500),
          })
          if (Array.isArray(p.schedule_details) && p.schedule_details.length) {
            setSessions(p.schedule_details)
          }
        }
      })
      .catch(() => { /* no existing plan — stay in create mode */ })
  }, [consultationId])

  const handleAddSession = () => {
    setSessions([...sessions, { date: '', time: '', notes: '' }])
  }

  const handleRemoveSession = (index: number) => {
    setSessions(sessions.filter((_, i) => i !== index))
  }

  const handleSessionChange = (index: number, field: keyof Session, value: string) => {
    const updated = [...sessions]
    updated[index][field] = value
    setSessions(updated)
  }

  const handleSubmit = async () => {
    if (!formData.description.trim() || sessions.some(s => !s.date || !s.time)) {
      setMessage('Please fill in all required fields')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const payload = {
        description: formData.description,
        duration_weeks: formData.duration_weeks,
        sessions_per_week: formData.sessions_per_week,
        cost_per_session: formData.cost_per_session,
        schedule_details: JSON.stringify(sessions),
      }
      const res = isEdit
        ? await api.put(`/treatment-plans/${planId}`, payload)
        : await api.post('/treatment-plans', { consultation_id: consultationId, ...payload })

      if (res.data.success) {
        setMessage(isEdit ? 'Treatment plan updated successfully' : 'Treatment plan created successfully')
        setTimeout(() => navigate(`/consultations`), 1500)
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} treatment plan`)
    } finally {
      setLoading(false)
    }
  }

  const totalCost = formData.duration_weeks * formData.sessions_per_week * formData.cost_per_session

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">{isEdit ? 'Edit Treatment Plan' : 'Create Treatment Plan'}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Treatment Plan Details</h2>

          {message && (
            <div className={`p-4 rounded-lg mb-6 text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          <div className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Treatment Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the treatment plan, goals, and approach..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
              />
              <p className="text-gray-500 text-xs mt-1">Minimum 20 characters required</p>
            </div>

            {/* Duration & Sessions */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Duration (weeks) *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.duration_weeks}
                  onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Sessions per week *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.sessions_per_week}
                  onChange={(e) => setFormData({ ...formData, sessions_per_week: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Cost per session (KES) *</label>
                <input
                  type="number"
                  min="100"
                  value={formData.cost_per_session}
                  onChange={(e) => setFormData({ ...formData, cost_per_session: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Total Cost Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-semibold">Total Treatment Cost:</span>
                <span className="text-2xl font-black text-blue-600">KES {totalCost.toLocaleString()}</span>
              </div>
              <p className="text-gray-600 text-xs mt-2">
                {formData.duration_weeks} weeks × {formData.sessions_per_week} sessions/week × KES {formData.cost_per_session}
              </p>
            </div>

            {/* Session Schedule */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Session Schedule</h3>
                <button
                  onClick={handleAddSession}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <Plus size={18} /> Add Session
                </button>
              </div>

              <div className="space-y-3">
                {sessions.map((session, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">Session {idx + 1}</span>
                      {sessions.length > 1 && (
                        <button
                          onClick={() => handleRemoveSession(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                          <Calendar size={14} /> Date *
                        </label>
                        <input
                          type="date"
                          value={session.date}
                          onChange={(e) => handleSessionChange(idx, 'date', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                          <Clock size={14} /> Time *
                        </label>
                        <input
                          type="time"
                          value={session.time}
                          onChange={(e) => handleSessionChange(idx, 'time', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Notes (optional)</label>
                      <input
                        type="text"
                        value={session.notes}
                        onChange={(e) => handleSessionChange(idx, 'notes', e.target.value)}
                        placeholder="e.g., Video call, bring documents, etc."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg"
          >
            {loading ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Treatment Plan')}
          </button>
        </div>
      </div>
    </div>
  )
}
