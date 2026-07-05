import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Pill, Plus, Pencil, ChevronDown, ChevronUp, CheckCircle, XCircle, Loader2, Clock } from 'lucide-react'

interface Med {
  id: number
  name: string
  dosage: string
  frequency: string
  start_date: string
  end_date: string | null
  is_active: boolean
  notes: string
}

interface MedLog {
  id: number
  taken: boolean
  side_effects: string | null
  mood_after: number | null
  logged_at: string
}

const EMPTY_MED = { name: '', dosage: '', frequency: 'daily', start_date: '', end_date: '', notes: '' }

export default function Medications() {
  const [meds, setMeds] = useState<Med[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<typeof EMPTY_MED>({ ...EMPTY_MED })
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [logs, setLogs] = useState<Record<number, MedLog[]>>({})
  const [logForm, setLogForm] = useState({ taken: true, side_effects: '', mood_after: '' })
  const [loggingId, setLoggingId] = useState<number | null>(null)

  const load = () => api.get('/medications').then(r => setMeds(r.data.medications ?? r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm({ ...EMPTY_MED }); setEditId(null); setShowForm(true) }
  const openEdit = (m: Med) => { setForm({ name: m.name, dosage: m.dosage, frequency: m.frequency, start_date: m.start_date, end_date: m.end_date ?? '', notes: m.notes }); setEditId(m.id); setShowForm(true) }

  const save = async () => {
    setSaving(true)
    try {
      if (editId) {
        const r = await api.put(`/medications/${editId}`, form)
        setMeds(ms => ms.map(m => m.id === editId ? r.data.medication : m))
      } else {
        const r = await api.post('/medications', form)
        setMeds(ms => [r.data.medication, ...ms])
      }
      setShowForm(false)
    } catch {}
    finally { setSaving(false) }
  }

  const toggleExpand = async (id: number) => {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (!logs[id]) {
      const r = await api.get(`/medications/${id}/logs`)
      setLogs(l => ({ ...l, [id]: r.data.logs ?? r.data }))
    }
  }

  const logDose = async (medId: number) => {
    setLoggingId(medId)
    try {
      await api.post(`/medications/${medId}/log`, {
        taken: logForm.taken,
        side_effects: logForm.side_effects || null,
        mood_after: logForm.mood_after ? +logForm.mood_after : null,
      })
      const r = await api.get(`/medications/${medId}/logs`)
      setLogs(l => ({ ...l, [medId]: r.data.logs ?? r.data }))
      setLogForm({ taken: true, side_effects: '', mood_after: '' })
    } catch {}
    finally { setLoggingId(null) }
  }

  const active = meds.filter(m => m.is_active)
  const inactive = meds.filter(m => !m.is_active)

  if (loading) return <div className="text-center py-12 text-gray-400">Loading medications…</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Pill size={22} className="text-blue-600" /> Medication Tracker
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track your prescriptions and log daily doses.</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Medication' : 'Add Medication'}</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Medication name</label>
                  <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Sertraline" />
                </div>
                <div>
                  <label className="label">Dosage</label>
                  <input className="input-field" value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} placeholder="e.g. 50mg" />
                </div>
              </div>
              <div>
                <label className="label">Frequency</label>
                <select className="input-field" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
                  {['daily','twice daily','three times daily','weekly','as needed'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Start date</label>
                  <input type="date" className="input-field" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
                </div>
                <div>
                  <label className="label">End date</label>
                  <input type="date" className="input-field" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea className="input-field" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any special instructions…" />
              </div>
              <div className="flex gap-3">
                <button onClick={save} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving && <Loader2 size={14} className="animate-spin" />} Save
                </button>
                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {meds.length === 0 && (
        <div className="card text-center py-12 text-gray-400">
          <Pill size={40} className="mx-auto mb-3 opacity-30" />
          <p>No medications added yet.</p>
        </div>
      )}

      {active.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Active</h2>
          <div className="space-y-3">
            {active.map(m => (
              <div key={m.id} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{m.name}</span>
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{m.dosage}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={11} />{m.frequency}</span>
                    </div>
                    {m.start_date && <p className="text-xs text-gray-400 mt-0.5">Since {new Date(m.start_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(m)} className="p-1.5 text-gray-400 hover:text-teal-600 rounded-lg"><Pencil size={14} /></button>
                    <button onClick={() => toggleExpand(m.id)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                      {expanded === m.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {expanded === m.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                    {/* Log a dose */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-semibold text-gray-700">Log today's dose</p>
                      <div className="flex gap-3">
                        <button onClick={() => setLogForm(f => ({ ...f, taken: true }))}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border transition-colors ${logForm.taken ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-500'}`}>
                          <CheckCircle size={14} /> Took it
                        </button>
                        <button onClick={() => setLogForm(f => ({ ...f, taken: false }))}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border transition-colors ${!logForm.taken ? 'bg-red-50 border-red-400 text-red-700' : 'bg-white border-gray-200 text-gray-500'}`}>
                          <XCircle size={14} /> Missed
                        </button>
                      </div>
                      <input className="input-field text-sm" placeholder="Side effects (optional)" value={logForm.side_effects}
                        onChange={e => setLogForm(f => ({ ...f, side_effects: e.target.value }))} />
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Mood after (1–10)</label>
                        <input type="range" min={1} max={10} className="w-full accent-teal-600" value={logForm.mood_after || 5}
                          onChange={e => setLogForm(f => ({ ...f, mood_after: e.target.value }))} />
                        <div className="flex justify-between text-xs text-gray-400"><span>Poor</span><span>Great</span></div>
                      </div>
                      <button onClick={() => logDose(m.id)} disabled={loggingId === m.id} className="btn-primary w-full flex items-center justify-center gap-2">
                        {loggingId === m.id ? <Loader2 size={14} className="animate-spin" /> : null} Log Dose
                      </button>
                    </div>

                    {/* Recent logs */}
                    {logs[m.id] && logs[m.id].length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Recent doses</p>
                        <div className="space-y-1.5">
                          {logs[m.id].slice(0, 7).map(log => (
                            <div key={log.id} className="flex items-center gap-2 text-sm">
                              {log.taken
                                ? <CheckCircle size={13} className="text-green-500 flex-shrink-0" />
                                : <XCircle size={13} className="text-red-400 flex-shrink-0" />}
                              <span className="text-gray-500 text-xs">{new Date(log.logged_at).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                              {log.side_effects && <span className="text-xs text-amber-600 flex-1 truncate">{log.side_effects}</span>}
                              {log.mood_after && <span className="text-xs text-gray-400 ml-auto">mood {log.mood_after}/10</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {m.notes && <p className="text-xs text-gray-500 italic">{m.notes}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {inactive.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Past / Inactive</h2>
          <div className="space-y-2">
            {inactive.map(m => (
              <div key={m.id} className="card opacity-60 flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-700">{m.name}</span>
                  <span className="text-xs text-gray-400 ml-2">{m.dosage}</span>
                </div>
                <button onClick={() => openEdit(m)} className="p-1.5 text-gray-400 hover:text-teal-600 rounded-lg"><Pencil size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
