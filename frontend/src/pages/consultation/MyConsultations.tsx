import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import type { Consultation } from '../../types'
import { format } from 'date-fns'
import { Video, Clock, CheckCircle, XCircle, AlertCircle, FileText, Calendar, PlayCircle, RotateCcw, X, Loader2, Star, MessageSquare } from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Awaiting Payment', color: 'text-yellow-700 bg-yellow-50', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-blue-700 bg-blue-50', icon: CheckCircle },
  in_progress: { label: 'In Progress', color: 'text-green-700 bg-green-50', icon: Video },
  completed: { label: 'Completed', color: 'text-gray-600 bg-gray-50', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-700 bg-red-50', icon: XCircle },
}

export default function MyConsultations() {
  const user = useAuthStore(s => s.user)
  const isProfessional = user?.role === 'professional'
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [rescheduling, setRescheduling] = useState<Consultation | null>(null)
  const [newDate, setNewDate]         = useState('')
  const [reschedSaving, setReschedSaving] = useState(false)

  useEffect(() => {
    const endpoint = isProfessional ? '/consultations/professional/list' : '/consultations'
    const fetchConsultations = () =>
      api.get(endpoint)
        .then(r => {
          const data = r.data.data ?? r.data.results ?? r.data
          setConsultations(Array.isArray(data) ? data : [])
        })
        .catch(() => setError('Could not load sessions.'))

    fetchConsultations().finally(() => setLoading(false))
    const poll = setInterval(fetchConsultations, 10_000)
    return () => clearInterval(poll)
  }, [isProfessional])

  const doReschedule = async () => {
    if (!rescheduling || !newDate) return
    setReschedSaving(true)
    try {
      const utcDate = new Date(newDate).toISOString()
      await api.put(`/consultations/${rescheduling.id}/reschedule`, { scheduled_at: utcDate })
      setConsultations(prev => prev.map(c => c.id === rescheduling.id ? { ...c, scheduled_at: utcDate } : c))
      setRescheduling(null)
      setNewDate('')
    } catch (e: any) {
      alert(e.response?.data?.error ?? 'Could not reschedule. Please contact support.')
    } finally { setReschedSaving(false) }
  }

  if (loading) return <div className="text-center py-10 text-gray-400">Loading sessions...</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{isProfessional ? 'My Patient Sessions' : 'My Sessions'}</h1>
        {!isProfessional && <Link to="/professionals" className="btn-primary text-sm">Book New Session</Link>}
      </div>

      {/* Reschedule modal */}
      {rescheduling && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Reschedule Session</h2>
              <button onClick={() => setRescheduling(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <p className="text-sm text-gray-500">
              Current: <span className="font-medium text-gray-800">{format(new Date(rescheduling.scheduled_at), 'EEE, MMM d · h:mm a')}</span>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New date &amp; time</label>
              <input type="datetime-local" className="input-field" value={newDate}
                min={new Date().toISOString().slice(0, 16)}
                onChange={e => setNewDate(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={doReschedule} disabled={reschedSaving || !newDate}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                {reschedSaving && <Loader2 size={14} className="animate-spin" />}
                Confirm
              </button>
              <button onClick={() => setRescheduling(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
            <p className="text-xs text-gray-400 text-center">Rescheduling within 24 hrs of your session may incur a late fee per our cancellation policy.</p>
          </div>
        </div>
      )}

      {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}

      {consultations.length === 0 ? (
        <div className="card text-center py-10">
          <Video size={40} className="text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-600 mb-2">No sessions yet</h3>
          <p className="text-sm text-gray-400 mb-4">Find a therapist and book your first session.</p>
          <Link to="/professionals" className="btn-primary">Find a Therapist</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {consultations.map((c) => {
            const statusConf = STATUS_CONFIG[c.status] || STATUS_CONFIG['pending']
            const StatusIcon = statusConf.icon
            const canJoin = ['confirmed', 'in_progress'].includes(c.status)
            const statusLabel = (isProfessional && c.status === 'in_progress') ? 'Live' : statusConf.label

            return (
              <div key={c.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {isProfessional
                        ? (c.user_display_name || 'Patient')
                        : (c.professional_detail?.display_name || 'Therapist')}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {format(new Date(c.scheduled_at), 'EEE, MMM d · h:mm a')}
                      {' · '}{c.duration_minutes} min
                    </div>
                    <div className="text-sm text-gray-500">
                      KES {Number(c.amount).toLocaleString()} · {c.consultation_id}
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${isProfessional && c.status === 'in_progress' ? 'text-green-700 bg-green-100 ring-1 ring-green-400' : statusConf.color}`}>
                    <StatusIcon size={12} />
                    {statusLabel}
                  </span>
                </div>

                {c.professional_notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                    <span className="font-medium">Therapist's note: </span>{c.professional_notes}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-4">
                  {c.status === 'confirmed' && !isProfessional && new Date(c.scheduled_at) > new Date() && (
                    <button onClick={() => { setRescheduling(c); setNewDate('') }}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                      <RotateCcw size={12} /> Reschedule
                    </button>
                  )}
                  {canJoin && (
                    <Link
                      to={`/session/${c.consultation_id}`}
                      className={`flex-1 text-center text-sm py-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors ${
                        isProfessional
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'btn-primary'
                      }`}
                    >
                      {isProfessional ? (
                        <><PlayCircle size={14} /> Start Session</>
                      ) : (
                        <><Video size={14} /> Join Session</>
                      )}
                    </Link>
                  )}
                  {c.status === 'completed' && !c.user_rating && !isProfessional && (
                    <FeedbackButton
                      consultationId={c.consultation_id}
                      onDone={() => setConsultations(prev => prev.map(x => x.id === c.id ? { ...x, user_rating: 5 } : x))}
                    />
                  )}
                  {c.status === 'completed' && c.user_rating && (
                    <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 flex items-center gap-1 self-center">
                      <Star size={11} fill="currentColor" /> Reviewed
                    </span>
                  )}
                  {isProfessional && ['confirmed', 'in_progress', 'completed'].includes(c.status) && (
                    <Link
                      to={`/treatment-plan/${c.consultation_id}`}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                    >
                      <FileText size={13} /> Treatment Plan
                    </Link>
                  )}
                  {c.status === 'completed' && !isProfessional && (
                    <>
                      <RequestNotesButton consultationId={c.id} alreadyRequested={!!c.notes_requested_at} />
                      <ReceiptButton consultationId={(c as any).consultation_id} />
                      <Link
                        to={`/book/${c.professional_id ?? (typeof c.professional === 'object' ? (c.professional as any).id : c.professional)}`}
                        state={{ is_follow_up: true, parent_id: c.id }}
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                      >
                        <Calendar size={13} /> Follow-up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function RequestNotesButton({ consultationId, alreadyRequested }: { consultationId: number; alreadyRequested: boolean }) {
  const [requested, setRequested] = useState(alreadyRequested)

  const handleRequest = async () => {
    try {
      await api.post(`/consultations/${consultationId}/notes-request`)
      setRequested(true)
    } catch {}
  }

  return requested ? (
    <span className="text-xs text-gray-500 self-center flex items-center gap-1">
      <FileText size={12} /> Notes requested
    </span>
  ) : (
    <button onClick={handleRequest} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
      <FileText size={13} /> Request Notes
    </button>
  )
}

function ReceiptButton({ consultationId }: { consultationId: string }) {
  const [loading, setLoading] = useState(false)

  const download = async () => {
    if (!consultationId) return
    setLoading(true)
    try {
      const r = await api.get(`/consultations/${consultationId}/receipt`)
      const d = r.data.receipt
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Clinical Receipt ${d.receipt_number}</title>
<style>body{font-family:sans-serif;max-width:600px;margin:40px auto;padding:20px;color:#111}
h1{color:#0d9488;font-size:20px}table{width:100%;border-collapse:collapse;margin:16px 0}
td{padding:8px 10px;border:1px solid #e5e7eb;font-size:13px}td:first-child{background:#f9fafb;font-weight:600;width:40%}
.header{border-bottom:2px solid #0d9488;padding-bottom:12px;margin-bottom:20px}
.footer{margin-top:24px;font-size:11px;color:#9ca3af;text-align:center}</style></head>
<body><div class="header"><h1>Afya Yako Siri Yako — Clinical Receipt</h1>
<p style="margin:4px 0;font-size:13px;color:#6b7280">${d.platform_url} · For insurance reimbursement</p></div>
<table>
<tr><td>Receipt No.</td><td>${d.receipt_number}</td></tr>
<tr><td>Session ID</td><td>${d.consultation_id}</td></tr>
<tr><td>Issue Date</td><td>${d.issue_date}</td></tr>
<tr><td>Session Date &amp; Time</td><td>${d.session_date} (EAT)</td></tr>
<tr><td>Duration</td><td>${d.duration_minutes} minutes</td></tr>
<tr><td>Patient</td><td>${d.patient_name}</td></tr>
<tr><td>Therapist</td><td>${d.therapist_name}</td></tr>
<tr><td>KMPDC License No.</td><td>${d.kmpdc_license}</td></tr>
<tr><td>Service</td><td>${d.service_type}</td></tr>
<tr><td>ICD-10 Code</td><td>${d.icd10_code} — ${d.icd10_description}</td></tr>
<tr><td><strong>Amount (KES)</strong></td><td><strong>${d.amount_kes}</strong></td></tr>
</table>
<p style="font-size:12px;color:#4b5563">This receipt is issued for insurance reimbursement purposes. The session was conducted via secure encrypted telehealth video (Jitsi Meet). For insurer queries contact: billing@mhapke.com</p>
<div class="footer">Afya Yako Siri Yako · mhapke.com · Nairobi, Kenya</div></body></html>`
      const blob = new Blob([html], { type: 'text/html' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `receipt-${d.receipt_number}.html`
      a.click()
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <button onClick={download} disabled={loading} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
      <FileText size={13} /> {loading ? '…' : 'Receipt'}
    </button>
  )
}

function FeedbackButton({ consultationId, onDone }: { consultationId: string; onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const [overall, setOverall]   = useState(0)
  const [comms, setComms]       = useState(0)
  const [feltHeard, setFeltHeard]     = useState(false)
  const [recommend, setRecommend]     = useState(false)
  const [feltSafe, setFeltSafe]       = useState(false)
  const [comment, setComment]         = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState('')

  const submit = async () => {
    if (!overall || !comms) { setError('Please rate both fields.'); return }
    setSubmitting(true); setError('')
    try {
      await api.post(`/consultations/${consultationId}/feedback`, {
        overall_rating: overall,
        communication_rating: comms,
        felt_heard: feltHeard,
        would_recommend: recommend,
        felt_safe: feltSafe,
        comment: comment.trim() || null,
      })
      setOpen(false)
      onDone()
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Could not submit. Please try again.')
    } finally { setSubmitting(false) }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
        <MessageSquare size={12} /> Review Session
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Star size={16} className="text-amber-400" /> How was your session?
              </h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            {/* Overall */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Overall experience</p>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setOverall(n)}>
                    <Star size={28} className={n <= overall ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                  </button>
                ))}
              </div>
            </div>

            {/* Communication */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Communication & clarity</p>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setComms(n)}>
                    <Star size={28} className={n <= comms ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                  </button>
                ))}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Felt heard',     val: feltHeard,  set: setFeltHeard },
                { label: 'Would recommend',val: recommend,   set: setRecommend },
                { label: 'Felt safe',      val: feltSafe,    set: setFeltSafe },
              ].map(({ label, val, set }) => (
                <label key={label} className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer text-xs font-medium transition-colors ${val ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500'}`}>
                  <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} className="sr-only" />
                  <CheckCircle size={18} className={val ? 'text-teal-500' : 'text-gray-300'} />
                  {label}
                </label>
              ))}
            </div>

            {/* Comment */}
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Optional comment (anonymous)…"
              className="input-field text-sm resize-none"
              rows={3}
              maxLength={1000}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => setOpen(false)} className="btn-secondary flex-1 text-sm py-2.5">Cancel</button>
              <button onClick={submit} disabled={submitting || !overall || !comms} className="btn-primary flex-1 text-sm py-2.5 disabled:opacity-50">
                {submitting ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
