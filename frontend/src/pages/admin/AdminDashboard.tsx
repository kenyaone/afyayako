import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import { format } from 'date-fns'
import {
  CheckCircle, XCircle, Clock, Users, Star,
  ChevronDown, ChevronUp, BarChart2, DollarSign, AlertCircle, RotateCcw, Video,
  MessageSquare, Shield, Plus, Trash2, Edit3, Eye, Download, HandHeart, ShieldCheck, Lock,
  AlertTriangle
} from 'lucide-react'
import TestAccountManager from './TestAccountManager'
import ComplianceDashboard from './ComplianceDashboard'

// Loads a professional's application photo from the authenticated admin endpoint
// (photos live on a private disk, so they must be fetched with the bearer token
// as a blob rather than referenced directly in an <img src>).
function ProfilePhoto({ proId, hasPhoto, name }: { proId: number; hasPhoto?: boolean; name?: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!hasPhoto) return
    let revoked: string | null = null
    let active = true
    api.get(`/admin/professionals/${proId}/photo`, { responseType: 'blob' })
      .then(r => {
        if (!active) return
        const objUrl = URL.createObjectURL(r.data)
        revoked = objUrl
        setUrl(objUrl)
      })
      .catch(() => active && setFailed(true))
    return () => { active = false; if (revoked) URL.revokeObjectURL(revoked) }
  }, [proId, hasPhoto])

  if (hasPhoto && url) {
    return <img src={url} alt={name ?? 'Professional photo'} className="w-28 h-28 rounded-xl object-cover border-2 border-primary-200" />
  }
  return (
    <div className="w-28 h-28 rounded-xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-xs text-center px-2">
      {hasPhoto && !failed ? 'Loading…' : 'No photo'}
    </div>
  )
}

interface Group {
  id: number; name: string; slug: string; description: string
  category: string; icon: string; is_active: boolean; member_count: number
}
interface FlaggedMsg {
  id: number; content: string; display_name: string; created_at: string
  group: { id: number; name: string }
  user: { id: number; display_name: string; username: string }
}

interface FlaggedReview {
  id: number
  overall_rating: number
  comment: string | null
  flag_reason: string
  flagged_at: string
  flagged_by: string
  professional: string | null
  professional_id: number | null
}

interface ProfRow {
  id: number
  kmpdc_license: string
  cpb_license?: string | null
  qualification?: string | null
  credential_document?: string | null
  signature_name?: string | null
  professional_type?: string | null
  bio: string
  years_experience: number
  gender: string
  rate_per_hour: number
  mpesa_number: string
  status?: string
  verification_status: string
  rating: number
  total_sessions: number
  sop_agreed?: boolean
  has_photo?: boolean
  created_at: string
  user: { id: number; username: string; display_name: string; email: string; phone: string }
  specializations: { id: number; name: string }[]
  languages: { id: number; name: string }[]
}

interface Stats {
  total_users: number
  total_professionals: number
  total_consultations: number
  total_revenue_kes: number
  crisis_events_total: number
  crisis_events_unresolved: number
}

type TabType = 'pending' | 'verified' | 'rejected'
type MainTab = 'professionals' | 'sessions' | 'groups' | 'moderation' | 'users' | 'peer_mentors' | 'supervision' | 'test_accounts' | 'compliance'

interface PeerMentorRow {
  id: number
  user_id: number
  display_name: string
  username: string
  bio: string
  conditions_helped: string[]
  years_in_recovery: number
  is_active: boolean
  is_verified: boolean
  created_at: string
}

interface UserRow {
  id: number
  username: string
  display_name: string
  email: string
  role: string
  is_banned: boolean
  created_at: string
}

const TAB_LABEL: Record<TabType, string> = {
  pending: 'Pending Review',
  verified: 'Approved',
  rejected: 'Rejected',
}

interface ConsultRow {
  id: number
  consultation_id: string
  status: string
  scheduled_at: string
  duration_minutes: number
  amount: number
  user: { display_name: string; username: string }
  professional: { user: { display_name: string } }
}

export default function AdminDashboard() {
  const user = useAuthStore(s => s.user)
  const navigate = useNavigate()
  const [mainTab, setMainTab] = useState<MainTab>('professionals')
  const [tab, setTab] = useState<TabType>('pending')
  const [professionals, setProfessionals] = useState<ProfRow[]>([])
  const [consultations, setConsultations] = useState<ConsultRow[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<number | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [confirmingId, setConfirmingId] = useState<number | null>(null)
  const [groups, setGroups]         = useState<Group[]>([])
  const [flaggedMsgs, setFlaggedMsgs] = useState<FlaggedMsg[]>([])
  const [usersList, setUsersList]   = useState<UserRow[]>([])
  const [usersSearch, setUsersSearch] = useState('')
  const [usersLoading, setUsersLoading] = useState(false)
  const [banningId, setBanningId]   = useState<number | null>(null)
  const [peerMentors, setPeerMentors] = useState<PeerMentorRow[]>([])
  const [flaggedReviews, setFlaggedReviews] = useState<FlaggedReview[]>([])
  const [actingReview, setActingReview] = useState<number | null>(null)
  const [approvingMentor, setApprovingMentor] = useState<number | null>(null)
  const [newGroup, setNewGroup] = useState({ name: '', description: '', category: 'depression', icon: '💬', is_active: true })
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [savingGroup, setSavingGroup] = useState(false)
  // Supervision (Guideline 9)
  const [verifiedPros, setVerifiedPros] = useState<any[]>([])
  const [supervisions, setSupervisions] = useState<any[]>([])
  const [supLoading, setSupLoading] = useState(false)
  const [assignSup, setAssignSup] = useState({ supervisor_id: '', supervisee_id: '' })
  const [supActing, setSupActing] = useState(false)
  const [supMsg, setSupMsg] = useState('')

  const fetchSupervision = () => {
    setSupLoading(true)
    Promise.all([
      api.get('/admin/professionals?status=verified').then(r => setVerifiedPros(r.data.data ?? r.data ?? [])).catch(() => setVerifiedPros([])),
      api.get('/admin/supervisions').then(r => setSupervisions(r.data.data ?? r.data ?? [])).catch(() => setSupervisions([])),
    ]).finally(() => setSupLoading(false))
  }

  const toggleEligibility = async (proId: number, eligible: boolean) => {
    setSupMsg('')
    try {
      await api.put(`/admin/professionals/${proId}/supervisor-eligibility`, { eligible })
      setVerifiedPros(prev => prev.map(p => p.id === proId ? { ...p, is_eligible_supervisor: eligible } : p))
    } catch (e: any) {
      setSupMsg(e.response?.data?.error || 'Failed to update eligibility')
    }
  }

  const assignSupervision = async () => {
    if (!assignSup.supervisor_id || !assignSup.supervisee_id) { setSupMsg('Choose both a supervisor and a supervisee.'); return }
    if (assignSup.supervisor_id === assignSup.supervisee_id) { setSupMsg('Supervisor and supervisee must differ.'); return }
    setSupActing(true); setSupMsg('')
    try {
      await api.post('/admin/supervisions', {
        supervisor_id: Number(assignSup.supervisor_id),
        supervisee_id: Number(assignSup.supervisee_id),
      })
      setAssignSup({ supervisor_id: '', supervisee_id: '' })
      fetchSupervision()
    } catch (e: any) {
      setSupMsg(e.response?.data?.error || 'Failed to assign supervision')
    } finally { setSupActing(false) }
  }

  const endSupervision = async (id: number) => {
    setSupActing(true); setSupMsg('')
    try { await api.put(`/admin/supervisions/${id}/end`); fetchSupervision() }
    catch (e: any) { setSupMsg(e.response?.data?.error || 'Failed to end supervision') }
    finally { setSupActing(false) }
  }

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/dashboard'); return }
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (user?.role !== 'admin') return
    setLoading(true)
    api.get(`/admin/professionals?status=${tab}`)
      .then(r => setProfessionals(r.data.data ?? r.data))
      .catch(() => setProfessionals([]))
      .finally(() => setLoading(false))
  }, [tab])

  useEffect(() => {
    if (user?.role !== 'admin') return
    if (mainTab === 'sessions') {
      setLoading(true)
      api.get('/admin/consultations')
        .then(r => setConsultations(r.data.data ?? r.data))
        .catch(() => setConsultations([]))
        .finally(() => setLoading(false))
    }
    if (mainTab === 'groups') {
      api.get('/admin/groups').then(r => setGroups(r.data.groups ?? [])).catch(() => {})
    }
    if (mainTab === 'moderation') {
      api.get('/admin/moderation/flagged').then(r => setFlaggedMsgs(r.data.data ?? r.data)).catch(() => {})
      api.get('/admin/reviews/flagged').then(r => setFlaggedReviews(r.data.flagged ?? [])).catch(() => {})
    }
    if (mainTab === 'users') {
      setUsersLoading(true)
      api.get('/admin/users').then(r => setUsersList(r.data.users ?? [])).catch(() => {}).finally(() => setUsersLoading(false))
    }
    if (mainTab === 'peer_mentors') {
      api.get('/admin/peer-mentors').then(r => setPeerMentors(r.data.mentors ?? [])).catch(() => {})
    }
    if (mainTab === 'supervision') {
      fetchSupervision()
    }
  }, [mainTab])

  const createGroup = async () => {
    if (!newGroup.name || !newGroup.description) return
    setSavingGroup(true)
    try {
      const r = await api.post('/admin/groups', newGroup)
      setGroups(prev => [...prev, r.data.group])
      setNewGroup({ name: '', description: '', category: 'depression', icon: '💬', is_active: true })
      setShowNewGroup(false)
    } catch (e: any) { alert(e.response?.data?.error ?? 'Failed to create group') }
    finally { setSavingGroup(false) }
  }

  const toggleGroup = async (g: Group) => {
    await api.put(`/admin/groups/${g.id}`, { is_active: !g.is_active })
    setGroups(prev => prev.map(x => x.id === g.id ? { ...x, is_active: !x.is_active } : x))
  }

  const searchUsers = async () => {
    setUsersLoading(true)
    api.get(`/admin/users${usersSearch ? `?search=${encodeURIComponent(usersSearch)}` : ''}`)
      .then(r => setUsersList(r.data.users ?? []))
      .catch(() => {})
      .finally(() => setUsersLoading(false))
  }

  const toggleBan = async (u: UserRow) => {
    setBanningId(u.id)
    try {
      const action = u.is_banned ? 'unban' : 'ban'
      await api.put(`/admin/users/${u.id}/${action}`)
      setUsersList(prev => prev.map(x => x.id === u.id ? { ...x, is_banned: !x.is_banned } : x))
    } catch (e: any) {
      alert(e.response?.data?.error ?? 'Failed to update user.')
    } finally { setBanningId(null) }
  }

  const approveMentor = async (id: number, approve: boolean) => {
    setApprovingMentor(id)
    try {
      await api.put(`/admin/peer-mentors/${id}/approve`, { approve })
      setPeerMentors(prev => prev.map(m => m.id === id ? { ...m, is_active: approve, is_verified: approve } : m))
    } catch { alert('Failed to update mentor.') }
    finally { setApprovingMentor(null) }
  }

  const hideMessage = async (groupId: number, msgId: number) => {
    await api.put(`/admin/groups/${groupId}/moderate/${msgId}`)
    setFlaggedMsgs(prev => prev.filter(m => m.id !== msgId))
  }

  const clearReview = async (id: number) => {
    setActingReview(id)
    try {
      await api.put(`/admin/reviews/${id}/clear`)
      setFlaggedReviews(prev => prev.filter(r => r.id !== id))
    } catch { alert('Failed to clear review.') }
    finally { setActingReview(null) }
  }

  const removeReview = async (id: number) => {
    if (!window.confirm('Remove this review from the professional\'s profile? This cannot be undone.')) return
    setActingReview(id)
    try {
      await api.delete(`/admin/reviews/${id}`)
      setFlaggedReviews(prev => prev.filter(r => r.id !== id))
    } catch { alert('Failed to remove review.') }
    finally { setActingReview(null) }
  }

  const handleConfirmPayment = async (id: number) => {
    setConfirmingId(id)
    try {
      await api.put(`/admin/consultations/${id}/confirm`)
      setConsultations(prev => prev.map(c => c.id === id ? { ...c, status: 'confirmed' } : c))
    } catch { alert('Failed to confirm.') }
    finally { setConfirmingId(null) }
  }

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    setActing(id)
    try {
      await api.put(`/admin/professionals/${id}/verify`, { action })
      setProfessionals(prev => prev.filter(p => p.id !== id))
    } catch (e: any) {
      alert(e.response?.data?.error || 'Action failed. Please try again.')
    } finally {
      setActing(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage professional verifications and platform metrics.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              const from = new Date(); from.setMonth(from.getMonth() - 3)
              window.location.href = `/api/admin/sha-report?from=${from.toISOString().split('T')[0]}&to=${new Date().toISOString().split('T')[0]}`
            }}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Download size={14} /> SHA Report
          </button>
          <button
            onClick={() => { window.location.href = '/api/admin/export/sessions' }}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Download size={14} /> Sessions CSV
          </button>
          <button
            onClick={() => { window.location.href = '/api/admin/export/users' }}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Download size={14} /> Users CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Users, label: 'Patients', value: stats.total_users, color: 'text-primary-600' },
            { icon: Star, label: 'Verified Pros', value: stats.total_professionals, color: 'text-green-600' },
            { icon: BarChart2, label: 'Consultations', value: stats.total_consultations, color: 'text-blue-600' },
            { icon: DollarSign, label: 'Revenue (KES)', value: `${(stats.total_revenue_kes / 1000).toFixed(1)}k`, color: 'text-accent-600' },
            { icon: AlertCircle, label: 'Crisis Events', value: stats.crisis_events_total, color: 'text-red-500' },
            { icon: AlertCircle, label: 'Unresolved Crisis', value: stats.crisis_events_unresolved, color: 'text-red-700' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card flex items-center gap-3 py-3">
              <Icon size={20} className={color} />
              <div>
                <div className="text-lg font-bold text-gray-900">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main tab switcher */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {([
          { key: 'professionals', icon: Users,        label: 'Applications' },
          { key: 'sessions',      icon: Video,         label: 'Sessions' },
          { key: 'groups',        icon: MessageSquare, label: 'Support Groups' },
          { key: 'moderation',    icon: Shield,        label: 'Moderation' },
          { key: 'users',         icon: Eye,           label: 'Users' },
          { key: 'peer_mentors',  icon: HandHeart,     label: 'Peer Mentors' },
          { key: 'supervision',   icon: Shield,        label: 'Supervision' },
          { key: 'compliance',    icon: AlertTriangle, label: 'Compliance' },
          { key: 'test_accounts', icon: Lock,          label: 'Test Accounts' },
        ] as { key: MainTab; icon: any; label: string }[]).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setMainTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              mainTab === key ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={14} /> {label}
            {key === 'moderation' && (flaggedMsgs.length + flaggedReviews.length) > 0 && (
              <span className="bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{flaggedMsgs.length + flaggedReviews.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Sessions table */}
      {mainTab === 'sessions' && (
        <div>
          {loading ? (
            <div className="text-center py-10 text-gray-400">Loading…</div>
          ) : consultations.length === 0 ? (
            <div className="card text-center py-10 text-gray-400">No sessions yet.</div>
          ) : (
            <div className="space-y-3">
              {consultations.map(c => {
                const statusColor: Record<string, string> = {
                  pending: 'text-yellow-700 bg-yellow-50',
                  confirmed: 'text-blue-700 bg-blue-50',
                  in_progress: 'text-green-700 bg-green-50',
                  completed: 'text-gray-600 bg-gray-50',
                  cancelled: 'text-red-700 bg-red-50',
                }
                return (
                  <div key={c.id} className="card flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {c.user?.display_name} → {c.professional?.user?.display_name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {format(new Date(c.scheduled_at), 'EEE MMM d, h:mm a')} · {c.duration_minutes} min · KES {Number(c.amount).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">{c.consultation_id}</div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColor[c.status] ?? 'bg-gray-50 text-gray-600'}`}>
                        {c.status}
                      </span>
                      {c.status === 'pending' && (
                        <button
                          onClick={() => handleConfirmPayment(c.id)}
                          disabled={confirmingId === c.id}
                          className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 disabled:opacity-50"
                        >
                          <CheckCircle size={12} />
                          {confirmingId === c.id ? '…' : 'Confirm'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      {mainTab === 'professionals' && <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Professional Applications</h2>
        <div className="flex gap-2 border-b border-gray-200 mb-4">
          {(['pending', 'verified', 'rejected'] as TabType[]).map(key => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === key
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {key === 'pending' && <Clock size={14} className={tab === key ? 'text-amber-500' : ''} />}
              {key === 'verified' && <CheckCircle size={14} className={tab === key ? 'text-green-600' : ''} />}
              {key === 'rejected' && <XCircle size={14} className={tab === key ? 'text-red-500' : ''} />}
              {TAB_LABEL[key]}
              {key === 'pending' && professionals.length > 0 && tab === 'pending' && (
                <span className="ml-1 bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {professionals.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading…</div>
        ) : professionals.length === 0 ? (
          <div className="card text-center py-10 text-gray-400">
            <Users size={36} className="mx-auto mb-2 text-gray-300" />
            No {TAB_LABEL[tab].toLowerCase()} applications.
          </div>
        ) : (
          <div className="space-y-4">
            {professionals.map(pro => (
              <div key={pro.id} className="card">

                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg flex-shrink-0">
                      {pro.user?.display_name?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{pro.user?.display_name}</div>
                      <div className="text-xs text-gray-500">
                        @{pro.user?.username}
                        {pro.user?.email && <> · {pro.user.email}</>}
                        {pro.user?.phone && <> · {pro.user.phone}</>}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono">{pro.kmpdc_license}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{pro.years_experience} yrs</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">{pro.gender}</span>
                        <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded font-medium">KES {Number(pro.rate_per_hour).toLocaleString()}/hr</span>
                        {pro.mpesa_number && (
                          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">M-Pesa: {pro.mpesa_number}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpanded(expanded === pro.id ? null : pro.id)}
                    className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0"
                    title="View bio"
                  >
                    {expanded === pro.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                {/* Specializations & Languages */}
                {(pro.specializations?.length > 0 || pro.languages?.length > 0) && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {pro.specializations?.map(s => (
                      <span key={s.id} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">{s.name}</span>
                    ))}
                    {pro.languages?.map(l => (
                      <span key={l.id} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">{l.name}</span>
                    ))}
                  </div>
                )}

                {/* Expanded full profile — review everything before approving */}
                {expanded === pro.id && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg text-sm text-gray-700 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <ProfilePhoto proId={pro.id} hasPhoto={pro.has_photo} name={pro.user?.display_name} />
                      <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2">
                        <div><div className="text-gray-400 text-xs uppercase tracking-wide">Full name</div>{pro.user?.display_name || '—'}</div>
                        <div><div className="text-gray-400 text-xs uppercase tracking-wide">Email</div>{pro.user?.email || '—'}</div>
                        <div><div className="text-gray-400 text-xs uppercase tracking-wide">Phone</div>{pro.user?.phone || '—'}</div>
                        <div><div className="text-gray-400 text-xs uppercase tracking-wide">Gender</div><span className="capitalize">{pro.gender || '—'}</span></div>
                        <div><div className="text-gray-400 text-xs uppercase tracking-wide">Qualification</div>{pro.qualification || <span className="text-red-500">Not provided</span>}</div>
                        <div><div className="text-gray-400 text-xs uppercase tracking-wide">Experience</div>{pro.years_experience} yrs</div>
                        <div><div className="text-gray-400 text-xs uppercase tracking-wide">KMPDC License</div><span className="font-mono">{pro.kmpdc_license || '—'}</span></div>
                        <div><div className="text-gray-400 text-xs uppercase tracking-wide">CPB License</div><span className="font-mono">{pro.cpb_license || '—'}</span></div>
                        <div><div className="text-gray-400 text-xs uppercase tracking-wide">Rate</div>KES {Number(pro.rate_per_hour).toLocaleString()}/hr</div>
                        <div><div className="text-gray-400 text-xs uppercase tracking-wide">M-Pesa</div>{pro.mpesa_number || '—'}</div>
                        <div><div className="text-gray-400 text-xs uppercase tracking-wide">Signature</div>{pro.signature_name || '—'}</div>
                        <div><div className="text-gray-400 text-xs uppercase tracking-wide">SOP Agreed</div>{pro.sop_agreed ? '✓ Yes' : '—'}</div>
                      </div>
                    </div>

                    {(pro.specializations?.length > 0 || pro.languages?.length > 0) && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Specializations</div>
                          <div className="flex flex-wrap gap-1.5">
                            {pro.specializations?.map(s => <span key={s.id} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">{s.name}</span>)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Languages</div>
                          <div className="flex flex-wrap gap-1.5">
                            {pro.languages?.map(l => <span key={l.id} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">{l.name}</span>)}
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Bio</div>
                      <p className="leading-relaxed">{pro.bio}</p>
                    </div>

                    {pro.credential_document && (
                      <div>
                        <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Credential Reference</div>
                        <p>{pro.credential_document}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Applied date */}
                <div className="mt-2 text-xs text-gray-400">
                  Applied {new Date(pro.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>

                {/* Action buttons — pending only */}
                {tab === 'pending' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleAction(pro.id, 'approve')}
                      disabled={acting === pro.id}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={15} />
                      {acting === pro.id ? 'Processing…' : 'Approve & Verify'}
                    </button>
                    <button
                      onClick={() => handleAction(pro.id, 'reject')}
                      disabled={acting === pro.id}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      <XCircle size={15} />
                      Reject
                    </button>
                  </div>
                )}

                {/* Restore for rejected */}
                {tab === 'rejected' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleAction(pro.id, 'approve')}
                      disabled={acting === pro.id}
                      className="flex items-center gap-2 py-2 px-4 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <RotateCcw size={14} />
                      Approve Instead
                    </button>
                    <span className="flex items-center gap-1.5 text-sm text-red-500 font-medium">
                      <XCircle size={14} /> Rejected
                    </span>
                  </div>
                )}

                {tab === 'verified' && (
                  <div className="mt-3 flex items-center gap-1.5 text-sm text-green-600 font-medium">
                    <CheckCircle size={14} /> Live on Platform · {pro.total_sessions} sessions · Rating {pro.rating ? pro.rating.toFixed(1) : 'N/A'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>}

      {/* ── SUPPORT GROUPS TAB ── */}
      {mainTab === 'groups' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Support Groups</h2>
            <button onClick={() => setShowNewGroup(!showNewGroup)} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
              <Plus size={14} /> New Group
            </button>
          </div>

          {showNewGroup && (
            <div className="card border-2 border-teal-200 space-y-3">
              <h3 className="font-semibold text-gray-800">Create New Group</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={newGroup.name} onChange={e => setNewGroup(g => ({ ...g, name: e.target.value }))}
                  className="input-field" placeholder="Group name" />
                <div className="flex gap-2">
                  <input value={newGroup.icon} onChange={e => setNewGroup(g => ({ ...g, icon: e.target.value }))}
                    className="input-field w-20" placeholder="Icon" />
                  <select value={newGroup.category} onChange={e => setNewGroup(g => ({ ...g, category: e.target.value }))} className="input-field flex-1">
                    {['depression','anxiety','addiction','gambling','tobacco','relationship','wellness'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <textarea value={newGroup.description} onChange={e => setNewGroup(g => ({ ...g, description: e.target.value }))}
                className="input-field w-full h-20" placeholder="Description visible to patients…" />
              <div className="flex gap-2">
                <button onClick={createGroup} disabled={savingGroup} className="btn-primary text-sm px-4">
                  {savingGroup ? 'Creating…' : 'Create Group'}
                </button>
                <button onClick={() => setShowNewGroup(false)} className="btn-secondary text-sm px-4">Cancel</button>
              </div>
            </div>
          )}

          {groups.length === 0 ? (
            <div className="card text-center py-10 text-gray-400">No groups yet. Create one above.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {groups.map(g => (
                <div key={g.id} className={`card flex items-start gap-3 ${!g.is_active ? 'opacity-50' : ''}`}>
                  <div className="text-3xl flex-shrink-0">{g.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      {g.name}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${g.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {g.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 capitalize">{g.category} · {g.member_count} members</div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{g.description}</p>
                  </div>
                  <button onClick={() => toggleGroup(g)} title={g.is_active ? 'Deactivate' : 'Activate'}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                    <Eye size={16} className={g.is_active ? 'text-green-500' : ''} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── USERS TAB ── */}
      {mainTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input value={usersSearch} onChange={e => setUsersSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchUsers()}
              className="input-field flex-1" placeholder="Search by username, display name, or email…" />
            <button onClick={searchUsers} className="btn-primary text-sm px-4 py-2">Search</button>
          </div>
          {usersLoading ? (
            <div className="text-center py-10 text-gray-400">Loading…</div>
          ) : usersList.length === 0 ? (
            <div className="card text-center py-10 text-gray-400">No users found.</div>
          ) : (
            <div className="space-y-2">
              {usersList.map(u => (
                <div key={u.id} className={`card flex items-center justify-between gap-3 py-3 ${u.is_banned ? 'opacity-60' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 text-sm">{u.display_name}</span>
                      <span className="text-xs text-gray-400">@{u.username}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded capitalize">{u.role}</span>
                      {u.is_banned && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">Banned</span>}
                    </div>
                    {u.email && <div className="text-xs text-gray-400 mt-0.5">{u.email}</div>}
                    <div className="text-xs text-gray-400">
                      Joined {new Date(u.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  {u.role !== 'admin' && (
                    <button onClick={() => toggleBan(u)} disabled={banningId === u.id}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium border flex items-center gap-1 disabled:opacity-50 ${
                        u.is_banned
                          ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                          : 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
                      }`}>
                      {banningId === u.id ? '…' : u.is_banned ? 'Unban' : 'Ban'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PEER MENTORS TAB ── */}
      {mainTab === 'peer_mentors' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <HandHeart size={18} className="text-rose-500" /> Peer Mentor Applications
          </h2>
          <p className="text-sm text-gray-500">Review and approve peer mentor applications before they appear publicly.</p>
          {peerMentors.length === 0 ? (
            <div className="card text-center py-10 text-gray-400">
              <HandHeart size={36} className="mx-auto mb-2 opacity-20" />
              No peer mentor applications yet.
            </div>
          ) : (
            <div className="space-y-3">
              {peerMentors.map(m => (
                <div key={m.id} className={`card border-l-4 ${m.is_verified ? 'border-teal-400' : m.is_active ? 'border-green-400' : 'border-amber-400'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-gray-900">{m.display_name}</span>
                        <span className="text-xs text-gray-400">@{m.username}</span>
                        <span className="text-xs text-gray-400">{m.years_in_recovery} yr{m.years_in_recovery !== 1 ? 's' : ''} in recovery</span>
                        {m.is_verified
                          ? <span className="inline-flex items-center gap-1 text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full"><ShieldCheck size={10} /> Verified</span>
                          : m.is_active
                          ? <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">Active (unverified)</span>
                          : <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">Pending Review</span>
                        }
                      </div>
                      <p className="text-sm text-gray-700">{m.bio}</p>
                      {m.conditions_helped?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {m.conditions_helped.map(c => (
                            <span key={c} className="text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">{c}</span>
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">Applied {new Date(m.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {!m.is_verified && (
                        <button onClick={() => approveMentor(m.id, true)} disabled={approvingMentor === m.id}
                          className="flex items-center gap-1 text-xs bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg font-medium disabled:opacity-50">
                          <CheckCircle size={12} /> Approve
                        </button>
                      )}
                      {m.is_active && (
                        <button onClick={() => approveMentor(m.id, false)} disabled={approvingMentor === m.id}
                          className="flex items-center gap-1 text-xs bg-red-50 border border-red-300 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium disabled:opacity-50">
                          <XCircle size={12} /> Revoke
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MODERATION TAB ── */}
      {mainTab === 'moderation' && (
        <div className="space-y-8">

          {/* Flagged Reviews */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Star size={18} className="text-amber-500" /> Flagged Reviews
              {flaggedReviews.length > 0 && (
                <span className="bg-amber-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">{flaggedReviews.length}</span>
              )}
            </h2>
            {flaggedReviews.length === 0 ? (
              <div className="card text-center py-8 text-gray-400 text-sm">
                <Star size={28} className="mx-auto mb-2 text-gray-200" />
                No flagged reviews — all clear.
              </div>
            ) : (
              <div className="space-y-3">
                {flaggedReviews.map(r => (
                  <div key={r.id} className="card border-l-4 border-amber-400">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            {[1,2,3,4,5].map(n => (
                              <Star key={n} size={12} className={n <= r.overall_rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                            ))}
                          </span>
                          <span>for <span className="font-medium text-gray-700">{r.professional ?? 'Unknown Professional'}</span></span>
                          <span>·</span>
                          <span>{r.flagged_at ? new Date(r.flagged_at).toLocaleDateString('en-KE') : '—'}</span>
                        </div>
                        {r.comment && (
                          <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-2 italic">"{r.comment}"</p>
                        )}
                        <div className="flex items-start gap-1.5 text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2">
                          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                          <span><strong>Reason:</strong> {r.flag_reason}</span>
                        </div>
                        <p className="text-xs text-gray-400">Reported by: {r.flagged_by}</p>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => clearReview(r.id)}
                          disabled={actingReview === r.id}
                          className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-medium"
                        >
                          <CheckCircle size={12} /> Keep
                        </button>
                        <button
                          onClick={() => removeReview(r.id)}
                          disabled={actingReview === r.id}
                          className="flex items-center gap-1 text-xs bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-medium"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Flagged Group Messages */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield size={18} className="text-red-500" /> Flagged Group Messages
              {flaggedMsgs.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">{flaggedMsgs.length}</span>
              )}
            </h2>
            {flaggedMsgs.length === 0 ? (
              <div className="card text-center py-8 text-gray-400 text-sm">
                <Shield size={28} className="mx-auto mb-2 text-gray-200" />
                No flagged messages — all clear.
              </div>
            ) : (
              <div className="space-y-3">
                {flaggedMsgs.map(m => (
                  <div key={m.id} className="card border-l-4 border-red-400">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                          <span className="font-medium text-gray-700">{m.display_name}</span>
                          in <span className="text-teal-600">{m.group?.name}</span>
                          · {new Date(m.created_at).toLocaleString('en-KE')}
                        </div>
                        <p className="text-sm text-gray-800 bg-red-50 rounded p-2">{m.content}</p>
                      </div>
                      <button
                        onClick={() => hideMessage(m.group.id, m.id)}
                        className="flex items-center gap-1 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-medium flex-shrink-0"
                      >
                        <Trash2 size={12} /> Hide
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {mainTab === 'supervision' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Supervision (Guideline 9)</h2>
            <p className="text-gray-500 text-sm">Designate eligible supervisors, then assign supervisor–supervisee relationships.</p>
          </div>

          {supMsg && <div className="card text-sm text-red-700 bg-red-50 border border-red-200">{supMsg}</div>}

          {/* Assign a supervision */}
          <div className="card space-y-3">
            <h3 className="font-semibold text-gray-900">Assign supervision</h3>
            <div className="grid md:grid-cols-3 gap-3">
              <select value={assignSup.supervisor_id} onChange={e => setAssignSup({ ...assignSup, supervisor_id: e.target.value })} className="input-field">
                <option value="">Supervisor (eligible)…</option>
                {verifiedPros.filter(p => p.is_eligible_supervisor).map(p => (
                  <option key={p.id} value={p.id}>{p.user?.display_name ?? `#${p.id}`}</option>
                ))}
              </select>
              <select value={assignSup.supervisee_id} onChange={e => setAssignSup({ ...assignSup, supervisee_id: e.target.value })} className="input-field">
                <option value="">Supervisee…</option>
                {verifiedPros.map(p => (
                  <option key={p.id} value={p.id}>{p.user?.display_name ?? `#${p.id}`}</option>
                ))}
              </select>
              <button onClick={assignSupervision} disabled={supActing} className="btn-primary disabled:opacity-50">
                {supActing ? 'Assigning…' : 'Assign'}
              </button>
            </div>
            {verifiedPros.filter(p => p.is_eligible_supervisor).length === 0 && (
              <p className="text-xs text-amber-600">No eligible supervisors yet — mark one below first.</p>
            )}
          </div>

          {/* Eligible-supervisor toggles */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Eligible supervisors</h3>
            {supLoading ? (
              <div className="text-center py-6 text-gray-400 text-sm">Loading…</div>
            ) : verifiedPros.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No verified professionals.</p>
            ) : (
              <div className="space-y-2">
                {verifiedPros.map(p => (
                  <div key={p.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{p.user?.display_name ?? `#${p.id}`}</div>
                      <div className="text-xs text-gray-400 font-mono">{p.kmpdc_license}</div>
                    </div>
                    <button
                      onClick={() => toggleEligibility(p.id, !p.is_eligible_supervisor)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium ${p.is_eligible_supervisor ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {p.is_eligible_supervisor ? '✓ Eligible' : 'Make eligible'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active supervisions */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Active supervisions</h3>
            {supervisions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No supervisions assigned yet.</p>
            ) : (
              <div className="space-y-2">
                {supervisions.map(s => (
                  <div key={s.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
                    <div className="text-sm text-gray-800">
                      <span className="font-medium">{s.supervisor?.user?.display_name ?? '—'}</span>
                      <span className="text-gray-400"> supervises </span>
                      <span className="font-medium">{s.supervisee?.user?.display_name ?? '—'}</span>
                      <span className="text-xs text-gray-400 ml-2">({s.sessions?.length ?? 0} sessions · {s.status})</span>
                    </div>
                    {s.status === 'active' && (
                      <button onClick={() => endSupervision(s.id)} disabled={supActing} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium disabled:opacity-50">
                        End
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {mainTab === 'compliance' && (
        <ComplianceDashboard />
      )}

      {mainTab === 'test_accounts' && (
        <TestAccountManager />
      )}
    </div>
  )
}
