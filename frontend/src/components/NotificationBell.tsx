import { useEffect, useRef, useState } from 'react'
import { Bell, AlertTriangle, Calendar, Video, Info, X } from 'lucide-react'
import api from '../api/axios'

interface AppNotification {
  id: number
  type: string
  title: string
  body: string | null
  is_urgent: boolean
  read_at: string | null
  created_at: string
  data?: Record<string, any>
}

const POLL_MS = 10_000

const typeIcon = (type: string) => {
  if (type === 'crisis_alert') return <AlertTriangle size={14} className="text-red-500 shrink-0" />
  if (type === 'new_booking')   return <Calendar size={14} className="text-blue-500 shrink-0" />
  if (type === 'session_starting') return <Video size={14} className="text-green-500 shrink-0" />
  return <Info size={14} className="text-gray-400 shrink-0" />
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unread, setUnread] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    try {
      const r = await api.get('/notifications')
      setNotifications(r.data.notifications ?? [])
      setUnread(r.data.unread_count ?? 0)
    } catch {}
  }

  useEffect(() => {
    fetchNotifications()
    const id = setInterval(fetchNotifications, POLL_MS)
    return () => clearInterval(id)
  }, [])

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleOpen = async () => {
    setOpen(o => !o)
    if (!open && unread > 0) {
      // mark all read optimistically
      setUnread(0)
      setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })))
      api.post('/notifications/read', {}).catch(() => {})
    }
  }

  const dismiss = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const urgentCount = notifications.filter(n => n.is_urgent && !n.read_at).length

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className={`absolute -top-0.5 -right-0.5 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none
            ${urgentCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-primary-600'}`}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-900 text-sm">Notifications</span>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="text-center text-sm text-gray-400 py-8">No notifications</div>
            ) : notifications.map(n => (
              <div
                key={n.id}
                className={`px-4 py-3 flex gap-3 items-start group transition-colors
                  ${!n.read_at ? 'bg-blue-50/40' : 'bg-white'}
                  ${n.is_urgent ? 'border-l-2 border-red-400' : ''}`}
              >
                <div className="mt-0.5">{typeIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-semibold ${n.is_urgent ? 'text-red-700' : 'text-gray-800'}`}>
                    {n.title}
                  </div>
                  {n.body && (
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</div>
                  )}
                  <div className="text-[10px] text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <button
                  onClick={() => dismiss(n.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gray-500 shrink-0"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
