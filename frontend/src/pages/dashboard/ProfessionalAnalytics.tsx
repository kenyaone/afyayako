import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { TrendingUp, DollarSign, Star, AlertCircle, Loader2, BarChart3, Heart, ThumbsUp } from 'lucide-react'
import { BarChart, Bar, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface AnalyticsData {
  summary: {
    total_sessions: number
    total_earned: number
    avg_rating: number
    cancellation_rate: number
  }
  sessions_by_month: Array<{ month: string; count: number; cancelled: number }>
  earnings_by_month: Array<{ month: string; amount: number }>
  rating_by_month: Array<{ month: string; avg: number }>
  mode_split: { virtual: number; physical: number }
  patient_split: { new: number; returning: number }
  feedback_summary: {
    avg_overall: number
    felt_heard_pct: number
    would_recommend_pct: number
    felt_safe_pct: number
  }
}

const COLORS = ['#0ea5e9', '#f59e0b', '#10b981', '#ef4444']

function CircularProgress({ value, label, color }: { value: number; label: string; color: string }) {
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (value / 100) * circumference
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg width="100" height="100" className="transform -rotate-90">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="4" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-lg font-bold text-gray-900">{Math.round(value)}%</div>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-600 text-center">{label}</p>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, subtext }: { icon: any; label: string; value: string | number; subtext?: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <Icon className="w-8 h-8 text-blue-600" />
      </div>
    </div>
  )
}

export default function ProfessionalAnalytics() {
  const navigate = useNavigate()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState('12months')

  useEffect(() => {
    setLoading(true)
    setError('')
    api.get(`/professionals/me/analytics?period=${period}`)
      .then(r => {
        if (r.data && r.data.summary) {
          setData(r.data)
        } else {
          setError('Invalid analytics data received')
        }
      })
      .catch(err => {
        console.error('Analytics error:', err)
        const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to load analytics'
        setError(errorMsg)
      })
      .finally(() => setLoading(false))
  }, [period])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error loading analytics</h3>
            <p className="text-sm text-red-700">{error || 'Please try again'}</p>
          </div>
        </div>
      </div>
    )
  }

  const { summary, sessions_by_month, earnings_by_month, rating_by_month, mode_split, patient_split, feedback_summary } = data

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">Performance metrics for the last {period === '3months' ? '3 months' : period === '6months' ? '6 months' : '12 months'}</p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="3months">Last 3 months</option>
            <option value="6months">Last 6 months</option>
            <option value="12months">Last 12 months</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={BarChart3} label="Total Sessions" value={summary.total_sessions} />
          <StatCard icon={DollarSign} label="Total Earned" value={`KES ${summary.total_earned.toLocaleString()}`} />
          <StatCard icon={Star} label="Average Rating" value={summary.avg_rating} subtext={`out of 5.0`} />
          <StatCard icon={AlertCircle} label="Cancellation Rate" value={`${(summary.cancellation_rate * 100).toFixed(1)}%`} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sessions Over Time */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sessions Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sessions_by_month}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" name="Completed" />
                <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Earnings Over Time */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Trend (KES)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={earnings_by_month}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `KES ${value.toLocaleString()}`} />
                <Area type="monotone" dataKey="amount" fill="#10b98133" stroke="#10b981" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Rating Trend */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={rating_by_month}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line type="monotone" dataKey="avg" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Mode Split */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm flex flex-col items-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Mode Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Virtual', value: mode_split.virtual },
                    { name: 'Physical', value: mode_split.physical },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#0ea5e9" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patient Split & Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Split */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Patient Base</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-gray-700">New Patients</p>
                  <p className="text-lg font-bold text-gray-900">{patient_split.new}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${patient_split.new > 0 ? (patient_split.new / (patient_split.new + patient_split.returning) * 100) : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-gray-700">Returning Patients</p>
                  <p className="text-lg font-bold text-gray-900">{patient_split.returning}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${patient_split.returning > 0 ? (patient_split.returning / (patient_split.new + patient_split.returning) * 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Highlights */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Patient Feedback</h3>
            <div className="grid grid-cols-3 gap-4">
              <CircularProgress value={feedback_summary.felt_heard_pct} label="Felt Heard" color="#10b981" />
              <CircularProgress value={feedback_summary.would_recommend_pct} label="Would Recommend" color="#f59e0b" />
              <CircularProgress value={feedback_summary.felt_safe_pct} label="Felt Safe" color="#0ea5e9" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
