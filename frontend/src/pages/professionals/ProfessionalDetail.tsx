import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import type { Professional } from '../../types'
import { Star, Clock, Globe, ChevronLeft, CheckCircle, Bell, BellOff, Flag, ThumbsUp, MessageSquare, AlertTriangle, X } from 'lucide-react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

interface Review {
  id: number
  overall_rating: number
  communication_rating: number
  felt_heard: boolean
  would_recommend: boolean
  felt_safe: boolean
  comment: string | null
  created_at: string
  flag_status: string
}

const FLAG_REASONS = [
  'Contains personal information',
  'Fake or misleading review',
  'Offensive or abusive content',
  'Harassment or threats',
  'Other',
]

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={size} className={n <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </span>
  )
}

function FlagModal({ reviewId, onClose, onFlagged }: { reviewId: number; onClose: () => void; onFlagged: () => void }) {
  const [reason, setReason] = useState('')
  const [custom, setCustom] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    const finalReason = reason === 'Other' ? custom.trim() : reason
    if (!finalReason) { setError('Please select or describe a reason.'); return }
    setLoading(true)
    setError('')
    try {
      await api.post(`/reviews/${reviewId}/flag`, { reason: finalReason })
      onFlagged()
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Could not submit flag. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Flag size={16} className="text-red-500" /> Report this review
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Our moderation team will review this within 24 hours. The review will remain visible until a decision is made.
        </p>
        <div className="space-y-2 mb-4">
          {FLAG_REASONS.map(r => (
            <label key={r} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${reason === r ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="accent-red-500" />
              <span className="text-sm text-gray-700">{r}</span>
            </label>
          ))}
        </div>
        {reason === 'Other' && (
          <textarea
            value={custom}
            onChange={e => setCustom(e.target.value)}
            placeholder="Describe the issue…"
            className="input-field text-sm mb-4 resize-none"
            rows={3}
            maxLength={500}
          />
        )}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm py-2.5">Cancel</button>
          <button onClick={submit} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl flex-1 text-sm py-2.5 transition-colors disabled:opacity-50">
            {loading ? 'Submitting…' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProfessionalDetail() {
  const { id } = useParams()
  const [pro, setPro] = useState<Professional | null>(null)
  const [onWaitlist, setOnWaitlist] = useState(false)
  const [waitlistLoading, setWaitlistLoading] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [flagModalId, setFlagModalId] = useState<number | null>(null)
  const [flaggedIds, setFlaggedIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    api.get(`/professionals/${id}`).then(r => setPro(r.data.data ?? r.data.professional ?? r.data))
    api.get(`/professionals/${id}/reviews`).then(r => setReviews(r.data.reviews ?? [])).catch(() => {})
  }, [id])

  const toggleWaitlist = async () => {
    if (!id) return
    setWaitlistLoading(true)
    try {
      if (onWaitlist) {
        await api.delete(`/professionals/${id}/waitlist`)
        setOnWaitlist(false)
      } else {
        await api.post(`/professionals/${id}/waitlist`, {})
        setOnWaitlist(true)
      }
    } catch {}
    finally { setWaitlistLoading(false) }
  }

  const handleFlagged = (reviewId: number) => {
    setFlaggedIds(prev => new Set([...prev, reviewId]))
    setFlagModalId(null)
  }

  if (!pro) return <div className="text-center py-10 text-gray-400">Loading...</div>

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link to="/professionals" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ChevronLeft size={16} /> Back to Professionals
      </Link>

      <div className="card">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-3xl flex-shrink-0 overflow-hidden">
            {(pro as any).avatar
              ? <img src={(pro as any).avatar} alt={pro.display_name} className="w-full h-full object-cover" />
              : (pro.display_name || 'P').charAt(0).toUpperCase()
            }
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{pro.display_name}</h1>
            <div className="flex items-center gap-1 text-amber-500 mt-1">
              <Star size={16} fill="currentColor" />
              <span className="font-medium">{pro.rating || '—'}</span>
              <span className="text-gray-400 text-sm">({pro.total_reviews} reviews, {pro.total_sessions} sessions)</span>
            </div>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Clock size={14} /> {pro.years_experience} years experience</span>
              <span className="flex items-center gap-1"><Globe size={14} /> {pro.languages.map(l => l.name).join(', ')}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl">Rate discussed at booking</div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 text-sm">
          <CheckCircle size={14} className="text-green-500" />
          <span className="text-green-700">KMPDC Verified {pro.kmpdc_license ? `— License: ${pro.kmpdc_license}` : '— Pending Admin Verification'}</span>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-2">About</h2>
        <p className="text-gray-700 text-sm leading-relaxed">{pro.bio}</p>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-3">Specializations</h2>
        <div className="flex flex-wrap gap-2">
          {pro.specializations.map(s => (
            <span key={s.id} className="bg-primary-50 text-primary-800 border border-primary-200 px-3 py-1 rounded-full text-sm">
              {s.name}
            </span>
          ))}
        </div>
      </div>

      {pro.availability.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3">Availability</h2>
          <div className="space-y-2">
            {pro.availability.filter(a => a.is_active).map(a => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{DAYS[a.day_of_week]}</span>
                <span className="text-gray-900 font-medium">{a.start_time} — {a.end_time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews section */}
      {reviews.length > 0 && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare size={16} className="text-teal-600" />
            Patient Reviews
            <span className="text-xs text-gray-400 font-normal ml-1">— anonymous, verified sessions only</span>
          </h2>

          {reviews.map(review => {
            const alreadyFlagged = flaggedIds.has(review.id) || review.flag_status === 'flagged' || review.flag_status === 'cleared'
            return (
              <div key={review.id} className="border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    {/* Star rating */}
                    <div className="flex items-center gap-3">
                      <StarRow rating={review.overall_rating} />
                      <span className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Attribute badges */}
                    <div className="flex flex-wrap gap-2">
                      {review.felt_heard && (
                        <span className="flex items-center gap-1 text-xs bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-2 py-0.5">
                          <ThumbsUp size={10} /> Felt heard
                        </span>
                      )}
                      {review.would_recommend && (
                        <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">
                          <CheckCircle size={10} /> Recommends
                        </span>
                      )}
                      {review.felt_safe && (
                        <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5">
                          <CheckCircle size={10} /> Felt safe
                        </span>
                      )}
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-sm text-gray-700 leading-relaxed italic">"{review.comment}"</p>
                    )}
                  </div>

                  {/* Flag button */}
                  {alreadyFlagged ? (
                    <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 flex-shrink-0">
                      <AlertTriangle size={11} /> Reported
                    </span>
                  ) : (
                    <button
                      onClick={() => setFlagModalId(review.id)}
                      title="Report this review"
                      className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
                    >
                      <Flag size={14} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex gap-3">
        <Link to={`/book/${pro.id}`} className="btn-primary flex-1 text-center py-3 block text-base">
          Book a Session
        </Link>
        <button onClick={toggleWaitlist} disabled={waitlistLoading}
          title={onWaitlist ? 'Leave waitlist' : 'Join waitlist — get notified when a slot opens'}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border font-medium text-sm transition-colors ${
            onWaitlist
              ? 'bg-amber-50 border-amber-400 text-amber-700 hover:bg-amber-100'
              : 'bg-white border-gray-300 text-gray-600 hover:border-teal-400 hover:text-teal-700'
          }`}>
          {onWaitlist ? <BellOff size={16} /> : <Bell size={16} />}
          {onWaitlist ? 'On waitlist' : 'Waitlist'}
        </button>
      </div>

      {flagModalId !== null && (
        <FlagModal
          reviewId={flagModalId}
          onClose={() => setFlagModalId(null)}
          onFlagged={() => handleFlagged(flagModalId)}
        />
      )}
    </div>
  )
}
