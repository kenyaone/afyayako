import { useState, useRef, useEffect } from 'react'
import api from '../api/axios'
import { MessageCircle, Send, X, Shield, AlertCircle, Loader2, Bot } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  isCrisis?: boolean
}

export default function AiChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Habari! I\'m Siri, your wellness companion 🌿\n\nI\'m here to listen, share wellness tips, and support you between sessions. I\'m not a therapist — for clinical support, please speak to your professional.\n\nHow are you feeling today?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = async () => {
    const text = input.trim()
    if (!text || loading || sessionEnded) return

    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await api.post('/ai/chat', {
        messages: newMessages.map(m => ({ role: m.role, content: m.content })),
      })

      const reply: Message = {
        role: 'assistant',
        content: res.data.reply,
        isCrisis: res.data.is_crisis,
      }
      setMessages(prev => [...prev, reply])
      if (res.data.end_session) setSessionEnded(true)
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I\'m having trouble connecting right now. Please try again.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary-700 hover:bg-primary-800 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105"
        aria-label="Open wellness chat"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col" style={{ height: '520px' }}>
          {/* Header */}
          <div className="bg-primary-700 text-white rounded-t-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
              <Bot size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">Siri — Wellness Companion</div>
              <div className="text-xs text-primary-200">Not a therapist · Private & encrypted</div>
            </div>
          </div>

          {/* Guardrail notice */}
          <div className="mx-3 mt-2 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
            <Shield size={12} className="flex-shrink-0 mt-0.5" />
            <span>Siri provides wellness support only — not therapy or diagnosis. In crisis? Call <strong>0800 723 253</strong></span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-primary-700 text-white rounded-br-sm'
                      : m.isCrisis
                        ? 'bg-red-50 border border-red-300 text-red-800 rounded-bl-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {m.isCrisis && (
                    <div className="flex items-center gap-1 font-semibold mb-1">
                      <AlertCircle size={14} /> Important
                    </div>
                  )}
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2">
                  <Loader2 size={16} className="text-gray-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {sessionEnded ? (
            <div className="p-3 text-center text-sm text-gray-500 border-t border-gray-100">
              Session ended. Please reach out to the crisis lines above.
            </div>
          ) : (
            <div className="p-3 border-t border-gray-100 flex gap-2">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="How are you feeling..."
                rows={1}
                className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary-400 max-h-24"
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl bg-primary-700 hover:bg-primary-800 text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-colors self-end"
              >
                <Send size={15} />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
