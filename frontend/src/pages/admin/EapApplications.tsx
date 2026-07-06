import { useEffect, useState } from 'react'
import api from '../../api/axios'
import {
  Building2, Mail, Phone, Users, Clock, CheckCircle2, XCircle,
  DollarSign, FileText, AlertCircle, Loader2, Landmark, Receipt, Smartphone,
} from 'lucide-react'

interface Application {
  id: number
  status: string
  company: {
    id: number
    name: string
    contact_name: string
    contact_email: string
    contact_phone: string
    industry: string | null
    employee_count: number
    kra_pin: string | null
  }
  tier: { id: number; name: string; pricing_model?: string; price_kes_annual: number; sessions_per_employee: number } | null
  sessions_total: number
  monthly_bill: number
  payment_method: string | null
  billing_notes: string | null
  amount_paid: number
  created_at: string
  activated_at: string | null
}

const METHOD_LABEL: Record<string, string> = {
  invoice_net30: 'Invoice · Net 30',
  bank_transfer: 'Bank transfer',
  cheque:        'Cheque',
  mpesa:         'M-Pesa Business',
}

const METHOD_ICON: Record<string, any> = {
  invoice_net30: Receipt,
  bank_transfer: Landmark,
  cheque:        FileText,
  mpesa:         Smartphone,
}

const STATUS_STYLE: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-800 border-amber-200',
  active:   'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-rose-100 text-rose-800 border-rose-200',
  expired:  'bg-gray-100 text-gray-600 border-gray-200',
}

export default function EapApplications() {
  const [apps, setApps]       = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [filter, setFilter]   = useState<'pending' | 'active' | 'all'>('pending')
  const [actioningId, setActioningId] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    api.get('/admin/eap-applications')
      .then(r => setApps(r.data.applications ?? []))
      .catch(e => setError(e.response?.data?.error ?? 'Could not load applications'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const filtered = apps.filter(a => filter === 'all' ? true : a.status === filter)

  const approve = async (id: number) => {
    if (!confirm('Approve and activate this application? An HR credentials email will be sent.')) return
    setActioningId(id)
    try {
      await api.post(`/admin/eap-applications/${id}/approve`, {})
      alert('Approved. HR credentials email queued.')
      load()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Approval failed.')
    } finally {
      setActioningId(null)
    }
  }

  const reject = async (id: number) => {
    const reason = prompt('Reason for rejection (visible in internal notes only):', '')
    if (reason === null) return
    setActioningId(id)
    try {
      await api.post(`/admin/eap-applications/${id}/reject`, { reason })
      load()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Rejection failed.')
    } finally {
      setActioningId(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">EAP applications</h1>
          <p className="text-gray-500 text-sm mt-1">Review new corporate EAP applications and activate paying customers.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
          {(['pending','active','all'] as const).map(f => (
            <button key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm font-semibold rounded ${filter === f ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : 'Active'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg px-4 py-3 flex items-center gap-2">
          <AlertCircle size={16}/> {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center"><Loader2 size={28} className="animate-spin mx-auto text-primary-600"/></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <Building2 size={40} className="mx-auto text-gray-300 mb-3"/>
          <p className="text-gray-500 text-sm">No {filter === 'all' ? '' : filter} applications right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(a => {
            const MI = METHOD_ICON[a.payment_method ?? ''] ?? Receipt
            return (
              <div key={a.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900">{a.company.name}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[a.status] || STATUS_STYLE.pending}`}>
                        {a.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">Applied {new Date(a.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-primary-700">KSh {a.monthly_bill.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">per month · {a.tier?.name ?? 'no tier'} tier</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-start gap-2 text-sm">
                    <Users size={14} className="text-gray-400 mt-0.5"/>
                    <div>
                      <div className="text-xs text-gray-500">Team size</div>
                      <div className="font-semibold text-gray-900">{a.company.employee_count} employees</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MI size={14} className="text-gray-400 mt-0.5"/>
                    <div>
                      <div className="text-xs text-gray-500">Wants to pay via</div>
                      <div className="font-semibold text-gray-900">{METHOD_LABEL[a.payment_method ?? ''] ?? 'Not specified'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Clock size={14} className="text-gray-400 mt-0.5"/>
                    <div>
                      <div className="text-xs text-gray-500">Session allocation</div>
                      <div className="font-semibold text-gray-900">{a.sessions_total} sessions</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Contact</div>
                    <div className="font-semibold text-gray-900">{a.company.contact_name}</div>
                    <div className="flex flex-col gap-0.5 mt-1 text-xs">
                      <a href={`mailto:${a.company.contact_email}`} className="text-primary-700 hover:underline flex items-center gap-1"><Mail size={11}/> {a.company.contact_email}</a>
                      <a href={`tel:${a.company.contact_phone}`}   className="text-primary-700 hover:underline flex items-center gap-1"><Phone size={11}/> {a.company.contact_phone}</a>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Compliance details</div>
                    <div className="text-xs text-gray-700 space-y-0.5">
                      <div><span className="text-gray-500">Industry:</span> {a.company.industry ?: '—'}</div>
                      <div><span className="text-gray-500">KRA PIN:</span> {a.company.kra_pin ?: '—'}</div>
                    </div>
                  </div>
                </div>

                {a.billing_notes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-900 mb-4">
                    <b>Billing notes:</b> {a.billing_notes}
                  </div>
                )}

                {a.status === 'pending' && (
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => approve(a.id)}
                      disabled={actioningId === a.id}
                      className="px-5 py-2.5 rounded-lg font-semibold text-white text-sm flex items-center gap-2 disabled:opacity-50 transition-transform hover:scale-[1.02]"
                      style={{ background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)' }}
                    >
                      {actioningId === a.id ? <Loader2 size={14} className="animate-spin"/> : <CheckCircle2 size={14}/>}
                      Approve &amp; activate
                    </button>
                    <button
                      onClick={() => reject(a.id)}
                      disabled={actioningId === a.id}
                      className="px-5 py-2.5 rounded-lg font-semibold text-rose-700 border-2 border-rose-200 hover:bg-rose-50 text-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      <XCircle size={14}/> Reject
                    </button>
                    <a
                      href={`mailto:${a.company.contact_email}?subject=Your%20Afya%20Yako%20EAP%20application`}
                      className="ml-auto px-4 py-2.5 rounded-lg font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 text-sm flex items-center gap-2"
                    >
                      <Mail size={14}/> Reply to buyer
                    </a>
                  </div>
                )}

                {a.status === 'active' && (
                  <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                    <CheckCircle2 size={16}/> Activated {a.activated_at ? `on ${new Date(a.activated_at).toLocaleDateString('en-GB')}` : ''} · KSh {Number(a.amount_paid).toLocaleString()} paid
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
