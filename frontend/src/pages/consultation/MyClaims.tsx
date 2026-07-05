import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface Claim {
  id: number
  claim_reference: string
  provider: string
  member_number: string
  scheme_name: string
  amount: number
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'co_payment_required'
  created_at: string
  consultation?: { consultation_id: string; scheduled_at: string }
}

const STATUS_UI = {
  pending:              { label: 'Pending',           icon: Clock,         color: 'text-amber-600 bg-amber-50 border-amber-200' },
  submitted:            { label: 'Submitted',         icon: FileText,      color: 'text-blue-600 bg-blue-50 border-blue-200' },
  approved:             { label: 'Approved',          icon: CheckCircle,   color: 'text-green-600 bg-green-50 border-green-200' },
  rejected:             { label: 'Rejected',          icon: XCircle,       color: 'text-red-600 bg-red-50 border-red-200' },
  co_payment_required:  { label: 'Co-payment needed', icon: AlertCircle,   color: 'text-orange-600 bg-orange-50 border-orange-200' },
}

export default function MyClaims() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/my-claims').then(r => setClaims(r.data.claims ?? [])).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-12 text-gray-400">Loading claims…</div>

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText size={22} className="text-blue-600" /> Insurance Claims
        </h1>
        <p className="text-sm text-gray-500 mt-1">Track the status of your insurance and SHA reimbursement claims.</p>
      </div>

      {claims.length === 0 && (
        <div className="card text-center py-12 text-gray-400">
          <FileText size={40} className="mx-auto mb-3 opacity-20" />
          <p>No insurance claims yet.</p>
          <p className="text-xs mt-1">Claims are created when you pay via insurance at booking.</p>
        </div>
      )}

      <div className="space-y-3">
        {claims.map(c => {
          const ui = STATUS_UI[c.status] ?? STATUS_UI.pending
          const Icon = ui.icon
          return (
            <div key={c.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-xs text-gray-500">{c.claim_reference}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${ui.color}`}>
                      <Icon size={11} /> {ui.label}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{c.provider}</p>
                  <div className="text-xs text-gray-500 mt-0.5 space-y-0.5">
                    <p>Member: {c.member_number} {c.scheme_name && `· ${c.scheme_name}`}</p>
                    {c.consultation && (
                      <p>Session: {new Date(c.consultation.scheduled_at).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    )}
                    <p>Submitted: {new Date(c.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900">KES {Number(c.amount).toLocaleString()}</p>
                </div>
              </div>

              {c.status === 'rejected' && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2">
                  Your claim was rejected. Contact your insurer with your session receipt for manual review.
                </div>
              )}
              {c.status === 'co_payment_required' && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-orange-700 bg-orange-50 rounded-lg px-3 py-2">
                  Your insurer requires a co-payment. Contact them to confirm the amount owed.
                </div>
              )}
              {c.status === 'approved' && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                  Claim approved. Your insurer will process the reimbursement per their payment schedule.
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>SHA reimbursement:</strong> For SHA claims, visit <strong>portal.sha.go.ke</strong> with your session receipt and ICD-10 code. Download receipts from your session history.
      </div>
    </div>
  )
}
