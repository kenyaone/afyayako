import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { FileText, Plus, Pencil, Trash2, Copy, Loader2, X } from 'lucide-react'

interface Template {
  id: number
  name: string
  category: string
  subjective: string | null
  objective: string | null
  assessment: string | null
  plan: string | null
  notes: string | null
}

const CATEGORIES = ['general', 'intake', 'follow-up', 'crisis', 'discharge', 'group']
const EMPTY: Partial<Template> = { name: '', category: 'general', subjective: '', objective: '', assessment: '', plan: '', notes: '' }

const STARTER_TEMPLATES: Partial<Template>[] = [
  {
    name: 'Initial Intake Assessment',
    category: 'intake',
    subjective: "Patient presents for initial assessment. Chief complaint: [describe in patient's words]. History of presenting illness: [onset, duration, severity]. Past psychiatric history: [previous diagnoses, hospitalisations, medications]. Social history: [living situation, employment, support systems]. Substance use history: [type, frequency, last use, previous treatment].",
    objective: "Patient appears [calm/distressed/cooperative/guarded]. Mood: [depressed/anxious/neutral]. Affect: [flat/restricted/full]. Thought process: [organised/disorganised]. Risk assessment: [low/medium/high risk for self-harm or harm to others].",
    assessment: "Provisional diagnosis: [ICD-10 code and description]. Severity: [mild/moderate/severe]. Risk level: [low/medium/high]. Complicating factors: [co-morbidities, psychosocial stressors].",
    plan: "1. Commence [therapy type] — [frequency] sessions.\n2. Safety plan discussed and documented.\n3. Next session in [1/2] weeks.\n4. Crisis resources shared: Befrienders Kenya 0800 723 253, NACADA 1192.",
    notes: 'Informed consent obtained. Confidentiality limits explained.',
  },
  {
    name: 'Regular Follow-up',
    category: 'follow-up',
    subjective: "Patient returns for follow-up. Current mood rated [x/10]. Since last session: [describe significant events, changes, homework review]. Sleep: [hours, quality]. Appetite: [good/poor]. Substance use since last session: [nil/specify].",
    objective: "General presentation: [improved/unchanged/deteriorated]. Engagement: [good/moderate/poor]. Homework completed: [yes/partial/no]. Risk update: [no new concerns / describe any new risks].",
    assessment: "Progress towards treatment goals: [on track/slow/no progress]. Current clinical impression: [describe]. Risk: [unchanged/increased/decreased].",
    plan: "1. Continue current treatment plan.\n2. Next session: [date/timeframe].\n3. Homework for next session: [describe].",
    notes: '',
  },
  {
    name: 'Crisis Intervention',
    category: 'crisis',
    subjective: "Patient presenting in crisis. Precipitating event: [describe]. Suicidal ideation: [none/passive/active with plan/active with intent]. Self-harm: [none/recent]. Protective factors: [reasons for living, social support]. Risk factors: [isolation, means access, previous attempts].",
    objective: "Risk level: [low/medium/high/very high]. Means restriction discussed: [yes/no]. Safety plan reviewed or created: [yes/no]. Emergency contact identified: [name/number if documented].",
    assessment: "Crisis level: [acute/sub-acute]. Immediate risk: [low/medium/high]. Hospitalisation required: [no/voluntary/involuntary].",
    plan: "1. Safety plan updated/created and copy given to patient.\n2. Crisis hotlines: Befrienders Kenya 0800 723 253, Emergency 999.\n3. Emergency contact notified [with consent/without consent — duty to warn].\n4. Follow-up contact within [24hrs/48hrs].",
    notes: 'Mandatory reporting obligations considered.',
  },
  {
    name: 'Discharge Summary',
    category: 'discharge',
    subjective: "Patient completed treatment programme. Duration: [x sessions over x months]. Initial presenting complaint: [brief summary]. Patient-reported outcome: [significant improvement/improvement/partial improvement].",
    objective: "Final assessment scores: [PHQ-9: x, GAD-7: x]. Overall improvement: [x% reduction in symptoms]. Risk at discharge: [low/nil active concerns].",
    assessment: "Treatment goals achieved: [fully/partially]. Relapse risk: [low/moderate/high]. Protective factors at discharge: [social support, coping skills, ongoing care].",
    plan: "1. Discharge from active treatment — goals achieved.\n2. Relapse prevention plan discussed.\n3. Open-door policy: patient can re-refer if symptoms recur.\n4. Onward referral to: [support group/GP/community services].",
    notes: '',
  },
]

export default function SessionTemplates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Template> & { id?: number } | null>(null)
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [copied, setCopied] = useState<number | null>(null)

  useEffect(() => {
    api.get('/session-templates').then(r => setTemplates(r.data.templates ?? [])).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    if (!editing) return
    setSaving(true)
    try {
      if (editing.id) {
        const r = await api.put(`/session-templates/${editing.id}`, editing)
        setTemplates(ts => ts.map(t => t.id === editing.id ? r.data.template : t))
      } else {
        const r = await api.post('/session-templates', editing)
        setTemplates(ts => [r.data.template, ...ts])
      }
      setEditing(null)
    } catch {}
    finally { setSaving(false) }
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this template?')) return
    await api.delete(`/session-templates/${id}`)
    setTemplates(ts => ts.filter(t => t.id !== id))
  }

  const copySOAP = (t: Template) => {
    const text = `S: ${t.subjective ?? ''}\n\nO: ${t.objective ?? ''}\n\nA: ${t.assessment ?? ''}\n\nP: ${t.plan ?? ''}${t.notes ? '\n\nNotes: ' + t.notes : ''}`
    navigator.clipboard.writeText(text)
    setCopied(t.id)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading templates…</div>

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText size={22} className="text-orange-500" /> Session Note Templates
          </h1>
          <p className="text-sm text-gray-500 mt-1">Save SOAP note starters. Copy into your session notes at the end of a call.</p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Template
        </button>
      </div>

      {/* Editor modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editing.id ? 'Edit template' : 'New template'}</h2>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Name</label>
                  <input className="input-field" value={editing.name ?? ''} onChange={e => setEditing(d => ({ ...d, name: e.target.value }))} placeholder="e.g. Initial intake" />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select className="input-field" value={editing.category ?? 'general'} onChange={e => setEditing(d => ({ ...d, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {(['subjective', 'objective', 'assessment', 'plan'] as const).map(field => (
                <div key={field}>
                  <label className="label capitalize">{field === 'assessment' ? 'Assessment (A)' : field === 'subjective' ? 'Subjective (S)' : field === 'objective' ? 'Objective (O)' : 'Plan (P)'}</label>
                  <textarea className="input-field text-sm" rows={3} value={(editing as any)[field] ?? ''}
                    onChange={e => setEditing(d => ({ ...d, [field]: e.target.value }))}
                    placeholder={field === 'subjective' ? 'Patient reports…' : field === 'objective' ? 'Observations, mood rating…' : field === 'assessment' ? 'Clinical impression…' : 'Next steps…'} />
                </div>
              ))}
              <div>
                <label className="label">Notes</label>
                <textarea className="input-field text-sm" rows={2} value={editing.notes ?? ''}
                  onChange={e => setEditing(d => ({ ...d, notes: e.target.value }))} placeholder="Any extra notes…" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={save} disabled={saving || !editing.name?.trim()} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving && <Loader2 size={14} className="animate-spin" />} Save Template
              </button>
              <button onClick={() => setEditing(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {templates.length === 0 && (
        <div className="space-y-4">
          <div className="card text-center py-8 text-gray-400">
            <FileText size={36} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium text-gray-600">No templates yet.</p>
            <p className="text-sm mt-1">Pick a starter below or create your own.</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Starter Templates — Click to add</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STARTER_TEMPLATES.map(t => (
                <button
                  key={t.name}
                  onClick={() => setEditing({ ...t })}
                  className="text-left card hover:border-orange-300 hover:shadow-md transition-all group p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-orange-100 transition-colors">
                      <FileText size={15} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
                      <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">{t.category}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">{t.subjective}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {templates.map(t => (
          <div key={t.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 text-sm">{t.name}</span>
                <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">{t.category}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => copySOAP(t)} title="Copy SOAP notes"
                  className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg transition-colors">
                  <Copy size={13} className={copied === t.id ? 'text-green-500' : ''} />
                </button>
                <button onClick={() => setExpanded(expanded === t.id ? null : t.id)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg text-xs font-medium">
                  {expanded === t.id ? 'Hide' : 'View'}
                </button>
                <button onClick={() => setEditing({ ...t })} className="p-1.5 text-gray-400 hover:text-orange-600 rounded-lg"><Pencil size={13} /></button>
                <button onClick={() => remove(t.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"><Trash2 size={13} /></button>
              </div>
            </div>
            {expanded === t.id && (
              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs text-gray-600">
                {t.subjective && <div><p className="font-bold text-gray-500 mb-1">S:</p><p>{t.subjective}</p></div>}
                {t.objective && <div><p className="font-bold text-gray-500 mb-1">O:</p><p>{t.objective}</p></div>}
                {t.assessment && <div><p className="font-bold text-gray-500 mb-1">A:</p><p>{t.assessment}</p></div>}
                {t.plan && <div><p className="font-bold text-gray-500 mb-1">P:</p><p>{t.plan}</p></div>}
                {t.notes && <div className="col-span-2"><p className="font-bold text-gray-500 mb-1">Notes:</p><p>{t.notes}</p></div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
