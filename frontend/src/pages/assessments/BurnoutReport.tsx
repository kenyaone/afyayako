import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Send, AlertCircle, TrendingDown, Shield } from 'lucide-react'
import api from '../../api/axios'

interface BurnoutReport {
  assessment_id: number
  cs_score: number
  bo_score: number
  sts_score: number
  zone: 'green' | 'yellow' | 'orange' | 'red'
  ai_report: string
  profession: string
  location: string
  email: string
}

const ZONE_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', icon: '✓' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', icon: '!' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', icon: '⚠' },
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', icon: '●' },
}

const ZONE_TITLES: Record<string, string> = {
  green: 'Thriving 🌿',
  yellow: 'At Risk ⚠',
  orange: 'Concerning 🔥',
  red: 'Critical Alert 🚨',
}

export default function BurnoutReport() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [report, setReport] = useState<BurnoutReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(`/burnout/report/${id}`)
        setReport(res.data)
      } catch (error) {
        alert('Report not found')
        navigate('/burnout-assessment')
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [id, navigate])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!report) {
    return <div className="flex items-center justify-center min-h-screen">Report not found</div>
  }

  const colors = ZONE_COLORS[report.zone]
  const isHighRisk = report.zone === 'orange' || report.zone === 'red'

  const handleDownloadPDF = async () => {
    try {
      const res = await api.get(`/burnout/report/${id}/pdf`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `Burnout-Report-${id}.pdf`
      a.click()
    } catch (error) {
      alert('Failed to download PDF')
    }
  }

  const handleSendToSupervisor = async () => {
    setSending(true)
    try {
      await api.post(`/burnout/report/${id}/send-email`)
      alert('Report sent to your email!')
    } catch (error) {
      alert('Failed to send report')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium">
            <ArrowLeft size={18} /> Dashboard
          </button>
          <h1 className="text-lg font-bold text-gray-900">Your Burnout Report</h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-8">
        {/* Zone Alert */}
        <div className={`${colors.bg} border-2 ${colors.border} rounded-2xl p-8 mb-8`}>
          <div className="flex items-start gap-4">
            <div className="text-4xl">{colors.icon}</div>
            <div className="flex-1">
              <h2 className={`text-2xl md:text-3xl font-black ${colors.text} mb-2`}>
                {ZONE_TITLES[report.zone]}
              </h2>
              <p className={`${colors.text} text-sm leading-relaxed`}>
                {report.zone === 'green' && 'You are managing well. Continue self-care practices and maintain healthy boundaries.'}
                {report.zone === 'yellow' && 'You are showing early signs of stress. Consider implementing preventive strategies now.'}
                {report.zone === 'orange' && 'You are experiencing significant burnout. Professional support is strongly recommended.'}
                {report.zone === 'red' && 'You are in critical condition. Immediate action and professional intervention is essential.'}
              </p>
            </div>
          </div>
        </div>

        {/* Scores */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Your ProQOL-5 Scores</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <p className="text-xs font-semibold text-green-700 uppercase mb-2">Compassion Satisfaction</p>
              <p className="text-3xl font-black text-green-600 mb-2">{report.cs_score}</p>
              <p className="text-xs text-gray-600">Higher is better • Max 50</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
              <p className="text-xs font-semibold text-orange-700 uppercase mb-2">Burnout</p>
              <p className="text-3xl font-black text-orange-600 mb-2">{report.bo_score}</p>
              <p className="text-xs text-gray-600">Lower is better • Max 50</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-100">
              <p className="text-xs font-semibold text-red-700 uppercase mb-2">Secondary Trauma</p>
              <p className="text-3xl font-black text-red-600 mb-2">{report.sts_score}</p>
              <p className="text-xs text-gray-600">Lower is better • Max 50</p>
            </div>
          </div>
        </div>

        {/* AI Report */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield size={20} className="text-teal-600" />
            AI-Generated Recovery Guide
          </h3>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-6 border border-gray-200">
            {report.ai_report}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Next Steps</h3>
          <div className="space-y-3">
            <button
              onClick={handleDownloadPDF}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={18} />
              Download Report (PDF)
            </button>
            <button
              onClick={handleSendToSupervisor}
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors"
            >
              <Send size={18} />
              {sending ? 'Sending...' : 'Send Report to My Email'}
            </button>
          </div>
        </div>

        {/* Resources */}
        {isHighRisk && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-red-900 mb-3">Crisis Support Available</h3>
                <p className="text-red-800 text-sm mb-4">
                  Your results indicate you may benefit from immediate professional support. Please reach out to a mental health professional.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => navigate('/professionals')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Find Therapist
                  </button>
                  <button className="px-4 py-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 text-sm font-semibold rounded-lg transition-colors">
                    Crisis Hotline
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
