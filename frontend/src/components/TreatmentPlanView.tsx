import { Calendar, Clock, FileText, DollarSign } from 'lucide-react'

interface Session {
  date: string
  time: string
  notes: string
}

interface TreatmentPlanViewProps {
  plan: {
    id: number
    description: string
    duration_weeks: number
    sessions_per_week: number
    cost_per_session: number
    total_cost: number
    status: string
    schedule_details?: Session[]
  }
}

export default function TreatmentPlanView({ plan }: TreatmentPlanViewProps) {
  const sessions = plan.schedule_details || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Treatment Plan Summary</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-600 font-semibold uppercase">Duration</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{plan.duration_weeks} weeks</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold uppercase">Sessions</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{plan.sessions_per_week}/week</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold uppercase">Per Session</p>
            <p className="text-2xl font-black text-gray-900 mt-1">₾{plan.cost_per_session.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold uppercase">Total Cost</p>
            <p className="text-2xl font-black text-blue-600 mt-1">₾{plan.total_cost.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-3">
          <FileText size={20} className="text-gray-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
            <p className="text-gray-700 leading-relaxed">{plan.description}</p>
          </div>
        </div>
      </div>

      {/* Scheduled Sessions */}
      {sessions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-bold text-gray-900 mb-4">Scheduled Sessions ({sessions.length})</h4>
          <div className="space-y-3">
            {sessions.map((session, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="font-black text-blue-600 text-sm">S{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-500" />
                      <span className="font-semibold text-gray-900">
                        {new Date(session.date).toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-500" />
                      <span className="font-semibold text-gray-900">{session.time}</span>
                    </div>
                  </div>
                  {session.notes && (
                    <p className="text-sm text-gray-600">📝 {session.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount Due</p>
              <p className="text-2xl font-black text-gray-900">₾{plan.total_cost.toLocaleString()}</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full font-semibold text-sm ${
            plan.status === 'paid'
              ? 'bg-green-100 text-green-700'
              : plan.status === 'draft'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
          </div>
        </div>
      </div>
    </div>
  )
}
