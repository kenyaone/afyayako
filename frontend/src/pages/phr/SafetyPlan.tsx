import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Shield, Plus, Trash2, Save, CheckCircle, Phone, AlertTriangle, Heart, Loader2 } from 'lucide-react'

interface Plan {
  id: number
  warning_signs: string[]
  coping_strategies: string[]
  support_contacts: { name: string; phone: string; relationship: string }[]
  crisis_resources: { name: string; phone: string; available: string }[]
  reasons_to_live: string[]
  safe_environment_steps: string[]
  reviewed_at: string
}

function ListEditor({ label, items, onChange, placeholder }: {
  label: string; items: string[]; onChange: (v: string[]) => void; placeholder: string
}) {
  const [draft, setDraft] = useState('')
  const add = () => { if (draft.trim()) { onChange([...items, draft.trim()]); setDraft('') } }
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <ul className="space-y-1.5 mb-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm">
            <span className="flex-1 text-gray-800">{item}</span>
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">
              <Trash2 size={13} />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          className="input-field flex-1 text-sm" placeholder={placeholder} />
        <button onClick={add} className="btn-secondary px-3 py-2"><Plus size={14} /></button>
      </div>
    </div>
  )
}

function ContactEditor({ contacts, onChange }: {
  contacts: { name: string; phone: string; relationship: string }[]
  onChange: (v: typeof contacts) => void
}) {
  const [draft, setDraft] = useState({ name: '', phone: '', relationship: '' })
  const add = () => {
    if (draft.name && draft.phone) {
      onChange([...contacts, { ...draft }])
      setDraft({ name: '', phone: '', relationship: '' })
    }
  }
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Support contacts (people you can call)</label>
      <ul className="space-y-1.5 mb-2">
        {contacts.map((c, i) => (
          <li key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm">
            <div className="flex-1">
              <span className="font-medium text-gray-800">{c.name}</span>
              {c.relationship && <span className="text-gray-400 ml-1">({c.relationship})</span>}
              <span className="text-teal-600 ml-2">{c.phone}</span>
            </div>
            <button onClick={() => onChange(contacts.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">
              <Trash2 size={13} />
            </button>
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-3 gap-2">
        <input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
          className="input-field text-sm" placeholder="Name" />
        <input value={draft.phone} onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))}
          className="input-field text-sm" placeholder="Phone" />
        <div className="flex gap-2">
          <input value={draft.relationship} onChange={e => setDraft(d => ({ ...d, relationship: e.target.value }))}
            className="input-field text-sm flex-1" placeholder="Relation" />
          <button onClick={add} className="btn-secondary px-3"><Plus size={14} /></button>
        </div>
      </div>
    </div>
  )
}

const DEFAULT_RESOURCES = [
  { name: 'Befrienders Kenya', phone: '0800 723 253', available: '24/7 Free' },
  { name: 'NACADA Helpline',   phone: '1192',         available: '24/7 Free' },
  { name: 'Kenya Red Cross',   phone: '1199',         available: '24/7' },
]

export default function SafetyPlan() {
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [warnSigns,   setWarnSigns]   = useState<string[]>([])
  const [coping,      setCoping]      = useState<string[]>([])
  const [contacts,    setContacts]    = useState<Plan['support_contacts']>([])
  const [crisis,      setCrisis]      = useState(DEFAULT_RESOURCES)
  const [reasons,     setReasons]     = useState<string[]>([])
  const [safeSteps,   setSafeSteps]   = useState<string[]>([])

  useEffect(() => {
    api.get('/safety-plan').then(r => {
      const p = r.data.plan
      if (p) {
        setPlan(p)
        setWarnSigns(p.warning_signs ?? [])
        setCoping(p.coping_strategies ?? [])
        setContacts(p.support_contacts ?? [])
        setCrisis(p.crisis_resources?.length ? p.crisis_resources : DEFAULT_RESOURCES)
        setReasons(p.reasons_to_live ?? [])
        setSafeSteps(p.safe_environment_steps ?? [])
      }
    }).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const r = await api.post('/safety-plan', {
        warning_signs: warnSigns,
        coping_strategies: coping,
        support_contacts: contacts,
        crisis_resources: crisis,
        reasons_to_live: reasons,
        safe_environment_steps: safeSteps,
      })
      setPlan(r.data.plan)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {}
    finally { setSaving(false) }
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading safety plan…</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield size={22} className="text-red-500" /> My Safety Plan
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Your personal plan for when things feel difficult. Review it regularly with your therapist.
          </p>
        </div>
        {plan?.reviewed_at && (
          <span className="text-xs text-gray-400">
            Last reviewed {new Date(plan.reviewed_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex gap-3 items-start">
        <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-800">
          <strong>In immediate danger?</strong> Call <strong>999</strong> or go to the nearest emergency department.
          Do not wait for a session.
        </p>
      </div>

      <div className="space-y-5">
        {/* Step 1 */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <h2 className="font-semibold text-gray-900">My warning signs</h2>
          </div>
          <p className="text-xs text-gray-500 mb-3">Thoughts, feelings, or behaviours that tell me I'm heading into crisis.</p>
          <ListEditor label="" items={warnSigns} onChange={setWarnSigns} placeholder="e.g. I stop sleeping, I isolate from friends…" />
        </div>

        {/* Step 2 */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <h2 className="font-semibold text-gray-900">Coping strategies I can do alone</h2>
          </div>
          <p className="text-xs text-gray-500 mb-3">Things that distract me or help me feel better without contacting anyone.</p>
          <ListEditor label="" items={coping} onChange={setCoping} placeholder="e.g. Go for a walk, do breathing exercise, listen to music…" />
        </div>

        {/* Step 3 */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <h2 className="font-semibold text-gray-900">People and places that distract me</h2>
          </div>
          <ListEditor label="" items={safeSteps} onChange={setSafeSteps} placeholder="e.g. Visit my sister, go to the mall, call a friend to talk about anything…" />
        </div>

        {/* Step 4 */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
            <Phone size={14} className="text-blue-500" />
            <h2 className="font-semibold text-gray-900">People I can ask for help</h2>
          </div>
          <ContactEditor contacts={contacts} onChange={setContacts} />
        </div>

        {/* Step 5 */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">5</span>
            <h2 className="font-semibold text-gray-900">Crisis services</h2>
          </div>
          <ul className="space-y-2">
            {crisis.map((r, i) => (
              <li key={i} className="flex items-center justify-between bg-purple-50 rounded-lg px-3 py-2 text-sm">
                <span className="font-medium text-gray-800">{r.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{r.available}</span>
                  <a href={`tel:${r.phone.replace(/\s/g,'')}`} className="text-purple-700 font-bold">{r.phone}</a>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Step 6 */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">6</span>
            <Heart size={14} className="text-green-500" />
            <h2 className="font-semibold text-gray-900">Reasons to stay safe</h2>
          </div>
          <p className="text-xs text-gray-500 mb-3">What matters most to me. Read this when everything feels hopeless.</p>
          <ListEditor label="" items={reasons} onChange={setReasons} placeholder="e.g. My children, my dream of starting a business, my dog…" />
        </div>
      </div>

      <button onClick={save} disabled={saving} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
        {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> :
         saved  ? <><CheckCircle size={16} /> Saved!</> :
                  <><Save size={16} /> Save Safety Plan</>}
      </button>

      <p className="text-xs text-center text-gray-400">
        Share this plan with your therapist at your next session so they can help you refine it.
      </p>
    </div>
  )
}
