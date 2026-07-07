import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, AlertTriangle, Calendar, Video, Info, CheckCheck, Inbox } from 'lucide-react'
import api from '../api/axios'

interface AppNotification {
  id: number
  type: string
  title: string
  body: string | null
  is_urgent: boolean
  read_at: string | null
  created_at: string
  data?: Record<string, any> | null
}

const typeIcon = (type: string) => {
  if (type === 'crisis_alert') return <AlertTriangle className="text-red-500" size={18} />
  if (type === 'new_booking' || type === 'booking.created') return <Calendar className="text-blue-500" size={18} />
  if (type === 'session_starting' || type === 'session.starting') return <Video className="text-emerald-500" size={18} />
  return <Info className="text-gray-400" size={18} />
}

const formatTime = (iso: string) => {
  const d = new Date(iso)
  const now = new Date()
  const mins = Math.floor((now.getTime() - d.getTime()) / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return d.toLocaleDateString('en-KE', { day: '2-digit', month: 'short' }) + ' · ' + d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
}

export default function Notifications() {
  const navigate = useNavigate()
  const [items, setItems] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all')

  const fetch = async () => {
    try {
      const r = await api.get('/notifications')
      setItems(r.data.notifications ?? [])
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => {
    fetch()
    const id = setInterval(fetch, 30_000)
    return () => clearInterval(id)
  }, [])

  const markAllRead = async () => {
    setItems(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })))
    try { await api.post('/notifications/read', {}) } catch {}
  }

  const openItem = async (n: AppNotification) => {
    const link = (n.data as any)?.link as string | undefined
    if (!n.read_at) {
      setItems(prev => prev.map(x => x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x))
      try { await api.post('/notifications/read', { ids: [n.id] }) } catch {}
    }
    if (link) navigate(link)
  }

  const filtered = items.filter(n => {
    if (filter === 'unread') return !n.read_at
    if (filter === 'urgent') return n.is_urgent
    return true
  })

  const unreadCount = items.filter(n => !n.read_at).length

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell size={22} className="text-primary-600" /> Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        {(['all', 'unread', 'urgent'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              filter === f
                ? 'bg-primary-700 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {f === 'all' ? 'All' : f === 'unread' ? `Unread${unreadCount ? ` · ${unreadCount}` : ''}` : 'Urgent only'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-16 text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <Inbox size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">Nothing here yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {filtered.map(n => {
            const link = (n.data as any)?.link as string | undefined
            const Wrap: any = link ? 'button' : 'div'
            return (
              <Wrap
                key={n.id}
                onClick={link ? () => openItem(n) : undefined}
                className={`w-full text-left px-5 py-4 flex gap-4 items-start transition
                  ${!n.read_at ? 'bg-blue-50/40' : ''}
                  ${n.is_urgent ? 'border-l-4 border-red-400' : ''}
                  ${link ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
              >
                <div className="mt-0.5">{typeIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className={`font-semibold text-sm ${n.is_urgent ? 'text-red-700' : 'text-gray-900'}`}>
                      {n.title}
                    </div>
                    <div className="text-[11px] text-gray-400 shrink-0">{formatTime(n.created_at)}</div>
                  </div>
                  {n.body && <p className="text-sm text-gray-600 leading-relaxed">{n.body}</p>}
                  {!n.read_at && (
                    <div className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-blue-500" aria-label="unread" />
                  )}
                </div>
              </Wrap>
            )
          })}
        </div>
      )}
    </div>
  )
}
