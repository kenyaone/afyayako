import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { Send, ArrowLeft, Users, Shield, Loader2, Video } from 'lucide-react'
import { useT } from '../../contexts/I18nContext'

interface Msg {
  id: number
  display_name: string
  content: string
  is_pinned: boolean
  is_mine: boolean
  created_at: string
}

const POLL_MS = 5_000

export default function GroupChat() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useT()
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastTs = useRef<string | null>(null)

  const loadInitial = async () => {
    try {
      const r = await api.get(`/groups/${id}/messages`)
      const loaded = r.data.messages ?? []
      setMsgs(loaded)
      if (loaded.length) lastTs.current = loaded[loaded.length - 1].created_at
    } catch (e: any) {
      if (e.response?.status === 403) setError('Join this group to see messages.')
    }
  }

  const poll = async () => {
    if (!lastTs.current) return
    try {
      const r = await api.get(`/groups/${id}/messages?since=${encodeURIComponent(lastTs.current)}`)
      const fresh = r.data.messages ?? []
      if (fresh.length) {
        setMsgs(prev => [...prev, ...fresh])
        lastTs.current = fresh[fresh.length - 1].created_at
      }
    } catch {}
  }

  useEffect(() => {
    loadInitial()
    pollRef.current = setInterval(poll, POLL_MS)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  const send = async () => {
    if (!text.trim() || sending) return
    setSending(true)
    try {
      const r = await api.post(`/groups/${id}/messages`, { content: text.trim() })
      setMsgs(prev => [...prev, r.data.message])
      lastTs.current = r.data.message.created_at
      setText('')
    } catch (e: any) {
      alert(e.response?.data?.error || 'Failed to send.')
    } finally { setSending(false) }
  }

  const fmt = (iso: string) => new Date(iso).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' })

  // Group messages by date
  let lastDate = ''

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <button onClick={() => navigate('/groups')} className="p-1 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={18} className="text-gray-500" />
        </button>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{groupName || 'Support Group'}</div>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <Shield size={10} /> Anonymous · All messages are private to group members
          </div>
        </div>
        <a
          href={`https://meet.jit.si/AfyaYakoGroup-${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
          title="Join group video call"
        >
          <Video size={13} /> Group Video
        </a>
      </div>

      {error ? (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">{error}</div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-4 space-y-1 pr-1">
            {msgs.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-10">
                No messages yet. Be the first to share.
              </div>
            )}
            {msgs.map(m => {
              const d = fmtDate(m.created_at)
              const showDate = d !== lastDate
              lastDate = d
              return (
                <div key={m.id}>
                  {showDate && (
                    <div className="text-center text-xs text-gray-400 py-2">{d}</div>
                  )}
                  <div className={`flex ${m.is_mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] ${m.is_mine ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                      {!m.is_mine && (
                        <span className="text-[10px] text-gray-400 font-medium px-1">{m.display_name}</span>
                      )}
                      <div className={`rounded-2xl px-3.5 py-2 text-sm ${
                        m.is_mine
                          ? 'bg-primary-600 text-white rounded-br-sm'
                          : m.is_pinned
                          ? 'bg-amber-50 border border-amber-300 text-gray-800 rounded-bl-sm'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                      }`}>
                        {m.is_pinned && <span className="text-amber-600 text-xs block mb-1 font-medium">📌 Pinned</span>}
                        {m.content}
                      </div>
                      <span className="text-[10px] text-gray-400 px-1">{fmt(m.created_at)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Crisis reminder */}
          <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-2 text-xs text-red-600 flex items-start gap-2">
            <Shield size={12} className="mt-0.5 flex-shrink-0" />
            If you are in crisis, call Befrienders Kenya: <strong>0800 723 253</strong> (free, 24/7)
          </div>

          {/* Input */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              className="flex-1 input-field text-sm"
              placeholder={t('sendMsg')}
              maxLength={1000}
            />
            <button
              onClick={send}
              disabled={!text.trim() || sending}
              className="btn-primary px-4 flex items-center gap-1 disabled:opacity-50"
            >
              {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
