import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Target, Plus, Trash2, Pencil, CheckCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

type Status = 'active' | 'completed' | 'paused' | 'abandoned'
type Category = 'sobriety' | 'mental_health' | 'relationships' | 'work' | 'physical' | 'other'

interface Goal {
  id: number
  title: string
  description: string
  category: Category
  target_date: string
  status: Status
  progress: number
  milestones: string[]
  notes: string
}

const CATEGORY_COLORS: Record<Category, string> = {
  sobriety:       'bg-blue-100 text-blue-700',
  mental_health:  'bg-purple-100 text-purple-700',
  relationships:  'bg-pink-100 text-pink-700',
  work:           'bg-yellow-100 text-yellow-700',
  physical:       'bg-green-100 text-green-700',
  other:          'bg-gray-100 text-gray-700',
}

const STATUS_COLORS: Record<Status, string> = {
  active:     'bg-teal-100 text-teal-700',
  completed:  'bg-green-100 text-green-700',
  paused:     'bg-amber-100 text-amber-700',
  abandoned:  'bg-gray-100 text-gray-400',
}

const EMPTY: Partial<Goal> = {
  title: '', description: '', category: 'mental_health',
  target_date: '', status: 'active', progress: 0, milestones: [], notes: ''
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<Partial<Goal>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [milestoneDraft, setMilestoneDraft] = useState('')

  const load = () => api.get('/goals').then(r => setGoals(r.data.goals ?? r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setEditId(null); setShowForm(true) }
  const openEdit = (g: Goal) => { setForm({ ...g, milestones: [...(g.milestones ?? [])] }); setEditId(g.id); setShowForm(true) }

  const save = async () => {
    setSaving(true)
    try {
      if (editId) {
        const r = await api.put(`/goals/${editId}`, form)
        setGoals(gs => gs.map(g => g.id === editId ? r.data.goal : g))
      } else {
        const r = await api.post('/goals', form)
        setGoals(gs => [r.data.goal, ...gs])
      }
      setShowForm(false)
    } catch {}
    finally { setSaving(false) }
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this goal?')) return
    await api.delete(`/goals/${id}`)
    setGoals(gs => gs.filter(g => g.id !== id))
  }

  const setProgress = async (g: Goal, val: number) => {
    setGoals(gs => gs.map(x => x.id === g.id ? { ...x, progress: val } : x))
    await api.put(`/goals/${g.id}/progress`, { progress: val })
  }

  const toggleExpand = (id: number) => {
    setExpanded(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const addMilestone = () => {
    if (milestoneDraft.trim()) {
      setForm(f => ({ ...f, milestones: [...(f.milestones ?? []), milestoneDraft.trim()] }))
      setMilestoneDraft('')
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading goals…</div>

  const active    = goals.filter(g => g.status === 'active')
  const completed = goals.filter(g => g.status === 'completed')
  const other     = goals.filter(g => g.status !== 'active' && g.status !== 'completed')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target size={22} className="text-teal-600" /> My Recovery Goals
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track your progress. Small steps count.</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Goal
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Goal' : 'New Goal'}</h2>
              <div>
                <label className="label">Title</label>
                <input className="input-field" value={form.title ?? ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Stay sober for 30 days" />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input-field" rows={2} value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What does success look like?" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Category</label>
                  <select className="input-field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}>
                    {(['sobriety','mental_health','relationships','work','physical','other'] as Category[]).map(c => (
                      <option key={c} value={c}>{c.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Target date</label>
                  <input type="date" className="input-field" value={form.target_date ?? ''} onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Progress: {form.progress ?? 0}%</label>
                <input type="range" min={0} max={100} step={5} className="w-full accent-teal-600"
                  value={form.progress ?? 0} onChange={e => setForm(f => ({ ...f, progress: +e.target.value }))} />
              </div>
              <div>
                <label className="label">Milestones</label>
                {(form.milestones ?? []).map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm py-1">
                    <CheckCircle size={13} className="text-teal-500" />
                    <span className="flex-1 text-gray-700">{m}</span>
                    <button onClick={() => setForm(f => ({ ...f, milestones: f.milestones?.filter((_,j)=>j!==i) }))} className="text-gray-400 hover:text-red-400">×</button>
                  </div>
                ))}
                <div className="flex gap-2 mt-1">
                  <input value={milestoneDraft} onChange={e => setMilestoneDraft(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMilestone())}
                    className="input-field flex-1 text-sm" placeholder="Add a milestone…" />
                  <button onClick={addMilestone} className="btn-secondary px-3"><Plus size={14} /></button>
                </div>
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea className="input-field" rows={2} value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any notes or context…" />
              </div>
              {editId && (
                <div>
                  <label className="label">Status</label>
                  <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Status }))}>
                    {(['active','completed','paused','abandoned'] as Status[]).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={save} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                  {editId ? 'Update' : 'Create Goal'}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <div className="card text-center py-12 text-gray-400">
          <Target size={40} className="mx-auto mb-3 opacity-30" />
          <p>No goals yet. Set your first recovery goal.</p>
        </div>
      )}

      {/* Active goals */}
      {active.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Active ({active.length})</h2>
          <div className="space-y-3">
            {active.map(g => <GoalCard key={g.id} g={g} expanded={expanded.has(g.id)} onToggle={() => toggleExpand(g.id)} onEdit={() => openEdit(g)} onDelete={() => remove(g.id)} onProgress={v => setProgress(g, v)} />)}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Completed ({completed.length})</h2>
          <div className="space-y-3">
            {completed.map(g => <GoalCard key={g.id} g={g} expanded={expanded.has(g.id)} onToggle={() => toggleExpand(g.id)} onEdit={() => openEdit(g)} onDelete={() => remove(g.id)} onProgress={v => setProgress(g, v)} />)}
          </div>
        </div>
      )}

      {other.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Other ({other.length})</h2>
          <div className="space-y-3">
            {other.map(g => <GoalCard key={g.id} g={g} expanded={expanded.has(g.id)} onToggle={() => toggleExpand(g.id)} onEdit={() => openEdit(g)} onDelete={() => remove(g.id)} onProgress={v => setProgress(g, v)} />)}
          </div>
        </div>
      )}
    </div>
  )
}

function GoalCard({ g, expanded, onToggle, onEdit, onDelete, onProgress }: {
  g: Goal; expanded: boolean
  onToggle: () => void; onEdit: () => void; onDelete: () => void; onProgress: (v: number) => void
}) {
  const bar = g.status === 'completed' ? 100 : g.progress
  return (
    <div className="card">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-gray-900 text-sm">{g.title}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[g.category]}`}>{g.category.replace('_',' ')}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[g.status]}`}>{g.status}</span>
          </div>
          {g.target_date && (
            <p className="text-xs text-gray-400 mb-2">Target: {new Date(g.target_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          )}
          <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
            <div className="h-2 rounded-full bg-teal-500 transition-all duration-500" style={{ width: `${bar}%` }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{bar}%</span>
            {g.status === 'active' && (
              <input type="range" min={0} max={100} step={5} value={g.progress}
                onChange={e => onProgress(+e.target.value)}
                className="w-24 accent-teal-600 h-1" />
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={onToggle} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-teal-600 rounded-lg"><Pencil size={14} /></button>
          <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"><Trash2 size={14} /></button>
        </div>
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-sm text-gray-600">
          {g.description && <p>{g.description}</p>}
          {g.milestones?.length > 0 && (
            <div>
              <p className="font-medium text-gray-700 text-xs uppercase mb-1">Milestones</p>
              <ul className="space-y-1">
                {g.milestones.map((m, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle size={12} className="text-teal-500 flex-shrink-0" />{m}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {g.notes && <p className="text-gray-500 italic text-xs">{g.notes}</p>}
        </div>
      )}
    </div>
  )
}
