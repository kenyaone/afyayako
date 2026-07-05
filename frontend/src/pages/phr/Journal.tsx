import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { BookOpen, Plus, Pencil, Trash2, Search, Save, Loader2, X } from 'lucide-react'

interface Entry {
  id: number
  title: string | null
  content: string
  mood: number | null
  tags: string[]
  created_at: string
}

const MOOD_EMOJI: Record<number, string> = {
  1: '😞', 2: '😔', 3: '😐', 4: '🙂', 5: '😊',
  6: '😄', 7: '😁', 8: '🌟', 9: '💪', 10: '🎉'
}

const TAG_SUGGESTIONS = ['anxiety', 'sleep', 'relationships', 'work', 'gratitude', 'progress', 'setback', 'therapy', 'recovery']

const EMPTY = { title: '', content: '', mood: 5, tags: [] as string[] }

export default function Journal() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Partial<Entry> & { id?: number } | null>(null)
  const [saving, setSaving] = useState(false)
  const [tagDraft, setTagDraft] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const load = async (q = '', pg = 1) => {
    const r = await api.get(`/journal?q=${encodeURIComponent(q)}&page=${pg}`)
    const data = r.data.data ?? r.data
    if (pg === 1) setEntries(data)
    else setEntries(prev => [...prev, ...data])
    setHasMore(!!(r.data.next_page_url))
    setLoading(false)
  }

  useEffect(() => { load(search, 1) }, [search])

  const openNew = () => setEditing({ ...EMPTY })
  const openEdit = (e: Entry) => setEditing({ ...e, tags: [...(e.tags ?? [])] })

  const save = async () => {
    if (!editing) return
    setSaving(true)
    try {
      if (editing.id) {
        const r = await api.put(`/journal/${editing.id}`, editing)
        setEntries(es => es.map(e => e.id === editing.id ? r.data.entry : e))
      } else {
        const r = await api.post('/journal', editing)
        setEntries(es => [r.data.entry, ...es])
      }
      setEditing(null)
    } catch {}
    finally { setSaving(false) }
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this entry?')) return
    await api.delete(`/journal/${id}`)
    setEntries(es => es.filter(e => e.id !== id))
  }

  const addTag = (t: string) => {
    const tag = t.toLowerCase().trim()
    if (tag && !editing?.tags?.includes(tag)) {
      setEditing(e => ({ ...e, tags: [...(e?.tags ?? []), tag] }))
    }
    setTagDraft('')
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading journal…</div>

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen size={22} className="text-indigo-500" /> My Journal
          </h1>
          <p className="text-sm text-gray-500 mt-1">Private. Only you can read this.</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Write
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-3 text-gray-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="input-field pl-8 text-sm" placeholder="Search entries…" />
      </div>

      {/* Write/Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editing.id ? 'Edit entry' : 'New entry'}</h2>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              <input className="input-field font-medium" value={editing.title ?? ''} onChange={e => setEditing(d => ({ ...d, title: e.target.value }))} placeholder="Title (optional)" />
              <textarea className="input-field" rows={8} value={editing.content ?? ''} onChange={e => setEditing(d => ({ ...d, content: e.target.value }))} placeholder="What's on your mind today?" autoFocus />
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Mood: {editing.mood ?? 5}/10 {MOOD_EMOJI[editing.mood ?? 5]}
                </label>
                <input type="range" min={1} max={10} className="w-full accent-indigo-500"
                  value={editing.mood ?? 5} onChange={e => setEditing(d => ({ ...d, mood: +e.target.value }))} />
                <div className="flex justify-between text-xs text-gray-400 mt-1"><span>Very low</span><span>Excellent</span></div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(editing.tags ?? []).map(tag => (
                    <span key={tag} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                      {tag}
                      <button onClick={() => setEditing(d => ({ ...d, tags: d?.tags?.filter(t => t !== tag) }))} className="text-indigo-400 hover:text-indigo-600">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {TAG_SUGGESTIONS.filter(t => !editing.tags?.includes(t)).map(t => (
                    <button key={t} onClick={() => addTag(t)} className="text-xs bg-gray-100 hover:bg-indigo-100 text-gray-500 hover:text-indigo-700 px-2 py-0.5 rounded-full transition-colors">+ {t}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={tagDraft} onChange={e => setTagDraft(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(tagDraft))}
                    className="input-field flex-1 text-sm" placeholder="Custom tag…" />
                  <button onClick={() => addTag(tagDraft)} className="btn-secondary px-3 text-sm">Add</button>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={save} disabled={saving || !editing.content?.trim()} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
              </button>
              <button onClick={() => setEditing(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="card text-center py-12 text-gray-400">
          <BookOpen size={40} className="mx-auto mb-3 opacity-20" />
          <p>{search ? 'No entries match your search.' : 'Start writing. Your thoughts are safe here.'}</p>
        </div>
      )}

      <div className="space-y-3">
        {entries.map(e => (
          <div key={e.id} className="card group hover:border-indigo-200 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {e.mood && <span className="text-lg">{MOOD_EMOJI[e.mood]}</span>}
                  <span className="font-semibold text-gray-900 text-sm">{e.title || 'Untitled entry'}</span>
                  <span className="text-xs text-gray-400 ml-auto flex-shrink-0">
                    {new Date(e.created_at).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{e.content}</p>
                {e.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {e.tags.map(t => (
                      <span key={t} className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button onClick={() => openEdit(e)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg"><Pencil size={13} /></button>
                <button onClick={() => remove(e.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"><Trash2 size={13} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button onClick={() => { const next = page + 1; setPage(next); load(search, next) }}
          className="btn-secondary w-full text-sm">Load more</button>
      )}
    </div>
  )
}
