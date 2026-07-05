import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Heart, Users, Plus, CheckCircle, Loader2, HandHeart, ShieldCheck, Clock } from 'lucide-react'

interface Mentor {
  id: number
  display_name: string
  avatar: string | null
  bio: string
  conditions_helped: string[]
  years_in_recovery: number
  is_verified: boolean
}

interface MyProfile {
  id: number
  bio: string
  conditions_helped: string[]
  years_in_recovery: number
  is_active: boolean
  is_verified: boolean
}

const CONDITIONS = ['depression', 'anxiety', 'alcohol', 'substance use', 'gambling', 'trauma', 'grief', 'relationships']

export default function PeerMentors() {
  const [mentors, setMentors]       = useState<Mentor[]>([])
  const [myProfile, setMyProfile]   = useState<MyProfile | null>(null)
  const [loading, setLoading]       = useState(true)
  const [showApply, setShowApply]   = useState(false)
  const [form, setForm]             = useState({ bio: '', conditions_helped: [] as string[], years_in_recovery: 1 })
  const [saving, setSaving]         = useState(false)
  const [connecting, setConnecting] = useState<number | null>(null)
  const [connected, setConnected]   = useState<Set<number>>(new Set())

  useEffect(() => {
    Promise.all([
      api.get('/peer-mentors'),
      api.get('/peer-mentors/me').catch(() => ({ data: { profile: null } })),
    ]).then(([list, me]) => {
      setMentors(list.data.mentors ?? [])
      setMyProfile(me.data.profile)
      if (me.data.profile) setForm({
        bio: me.data.profile.bio ?? '',
        conditions_helped: me.data.profile.conditions_helped ?? [],
        years_in_recovery: me.data.profile.years_in_recovery ?? 1,
      })
    }).finally(() => setLoading(false))
  }, [])

  const toggleCondition = (c: string) => {
    setForm(f => ({
      ...f,
      conditions_helped: f.conditions_helped.includes(c)
        ? f.conditions_helped.filter(x => x !== c)
        : [...f.conditions_helped, c]
    }))
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      const r = await api.post('/peer-mentors/apply', form)
      setMyProfile(r.data.profile)
      setShowApply(false)
    } catch {} finally { setSaving(false) }
  }

  const withdraw = async () => {
    if (!confirm('Remove yourself from the peer mentor pool?')) return
    await api.post('/peer-mentors/withdraw')
    setMyProfile(p => p ? { ...p, is_active: false } : null)
  }

  const connect = async (id: number) => {
    setConnecting(id)
    try {
      await api.post(`/peer-mentors/${id}/connect`)
      setConnected(s => new Set(s).add(id))
    } catch {} finally { setConnecting(null) }
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading…</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HandHeart size={22} className="text-rose-500" /> Peer Mentors
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Connect with people who've walked a similar path. Real lived experience, zero judgment.
          </p>
        </div>
        {myProfile?.is_active
          ? <button onClick={withdraw} className="btn-secondary text-sm text-red-600 border-red-300">Leave mentor pool</button>
          : <button onClick={() => setShowApply(s => !s)} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={14} /> Become a mentor
            </button>
        }
      </div>

      {/* My mentor status */}
      {myProfile && (
        <div className={`card border ${myProfile.is_active ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center gap-2">
            {myProfile.is_active
              ? <CheckCircle size={16} className="text-rose-500" />
              : <Clock size={16} className="text-amber-500" />
            }
            <p className={`text-sm font-semibold ${myProfile.is_active ? 'text-rose-800' : 'text-amber-800'}`}>
              {myProfile.is_active
                ? myProfile.is_verified ? '✅ Verified Peer Mentor' : 'Active Peer Mentor'
                : 'Application under review — pending admin approval'}
            </p>
          </div>
          <p className={`text-xs mt-1 ${myProfile.is_active ? 'text-rose-600' : 'text-amber-600'}`}>
            {myProfile.is_active
              ? 'Others can request to connect with you. You will be notified in-app.'
              : 'Our team reviews all applications within 24 hours for safety. You will be notified once approved.'}
          </p>
          {myProfile.is_active && (
            <button onClick={() => setShowApply(true)} className="text-xs text-rose-600 hover:underline mt-2">Edit profile</button>
          )}
        </div>
      )}

      {/* Apply form */}
      {showApply && (
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900">{myProfile ? 'Edit mentor profile' : 'Become a peer mentor'}</h2>
          <p className="text-xs text-gray-500">Share your story to help others. Your display name is shown, not your real name.</p>
          <div>
            <label className="label">Your story (short bio)</label>
            <textarea className="input-field" rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="e.g. I've been in recovery from alcohol dependency for 3 years. I know how hard the first steps are…" />
          </div>
          <div>
            <label className="label">Conditions you can help with</label>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map(c => (
                <button key={c} onClick={() => toggleCondition(c)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    form.conditions_helped.includes(c)
                      ? 'bg-rose-100 border-rose-400 text-rose-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-rose-300'
                  }`}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Years in recovery: {form.years_in_recovery}</label>
            <input type="range" min={1} max={20} className="w-full accent-rose-500"
              value={form.years_in_recovery} onChange={e => setForm(f => ({ ...f, years_in_recovery: +e.target.value }))} />
          </div>
          <div className="flex gap-3">
            <button onClick={saveProfile} disabled={saving || !form.bio.trim()} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />} Save
            </button>
            <button onClick={() => setShowApply(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
        <strong>Important:</strong> Peer mentors are not therapists. They offer lived-experience support only.
        If you're in crisis, please use the safety resources in your Safety Plan or call <strong>1192</strong>.
      </div>

      {mentors.length === 0 && (
        <div className="card text-center py-10 text-gray-400">
          <Users size={36} className="mx-auto mb-3 opacity-20" />
          <p>No peer mentors yet. Be the first to join the pool.</p>
        </div>
      )}

      <div className="space-y-3">
        {mentors.map(m => (
          <div key={m.id} className="card">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 font-bold text-base flex-shrink-0">
                {m.display_name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 text-sm">{m.display_name}</span>
                  {m.is_verified && (
                    <span className="inline-flex items-center gap-1 text-xs bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.5 rounded-full font-medium">
                      <ShieldCheck size={10} /> Verified
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{m.years_in_recovery} yr{m.years_in_recovery !== 1 ? 's' : ''} in recovery</span>
                </div>
                <p className="text-sm text-gray-600 mt-1 leading-snug line-clamp-2">{m.bio}</p>
                {m.conditions_helped?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {m.conditions_helped.map(c => (
                      <span key={c} className="text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">{c}</span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => connect(m.id)} disabled={connecting === m.id || connected.has(m.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                  connected.has(m.id)
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-white border-gray-300 hover:border-rose-400 hover:text-rose-600 text-gray-600'
                }`}>
                {connecting === m.id ? <Loader2 size={12} className="animate-spin" /> :
                 connected.has(m.id) ? <CheckCircle size={12} /> : <Heart size={12} />}
                {connected.has(m.id) ? 'Sent' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
