import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'
import type { SobrietyTracker as SobrietyType } from '../../types'
import { TrendingUp, Plus, Trophy } from 'lucide-react'

const SUBSTANCES = ['alcohol', 'gambling', 'tobacco', 'cannabis', 'miraa', 'other']
const MILESTONES = [7, 14, 30, 60, 90, 180, 365]

function getMilestone(days: number) {
  const next = MILESTONES.find(m => m > days)
  const achieved = MILESTONES.filter(m => m <= days)
  return { next, achieved }
}

export default function SobrietyTracker() {
  const [trackers, setTrackers] = useState<SobrietyType[]>([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset } = useForm<{ substance: string; start_date: string }>()

  useEffect(() => {
    api.get('/phr/sobriety').then(r => {
      const raw = r.data.trackers ?? r.data.results ?? r.data
      setTrackers(Array.isArray(raw) ? raw : [])
    })
  }, [])

  const onSubmit = async (data: any) => {
    setSaving(true)
    try {
      const res = await api.post('/phr/sobriety', data)
      setTrackers(prev => [...prev, res.data])
      setShowForm(false)
      reset()
    } finally {
      setSaving(false)
    }
  }

  const updateStreak = async (id: number) => {
    try {
      const res = await api.post(`/phr/sobriety/${id}/refresh`)
      const updated = res.data.tracker ?? res.data
      setTrackers(prev => prev.map(t => t.id === id ? updated : t))
    } catch {}
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sobriety Tracker</h1>
          <p className="text-gray-500 text-sm mt-1">Track your recovery journey. Every day counts.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Tracker
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Start Tracking</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">What are you tracking?</label>
            <select {...register('substance', { required: true })} className="input-field">
              <option value="">Choose...</option>
              {SUBSTANCES.map(s => (
                <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (when did you last stop?)</label>
            <input {...register('start_date', { required: true })} type="date" className="input-field" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : 'Start Tracker'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      )}

      {trackers.length === 0 ? (
        <div className="card text-center py-10 text-gray-400">
          <TrendingUp size={40} className="mx-auto mb-3 text-gray-300" />
          <p>No sobriety trackers yet. Start your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {trackers.map(t => {
            const { next, achieved } = getMilestone(t.current_streak)
            const pct = next ? Math.min(100, (t.current_streak / next) * 100) : 100
            return (
              <div key={t.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-semibold text-gray-900 capitalize text-lg">{t.substance}</div>
                    <div className="text-xs text-gray-400">Since {t.start_date}</div>
                  </div>
                  <button onClick={() => updateStreak(t.id)} className="text-xs text-primary-600 hover:underline">
                    Update
                  </button>
                </div>

                <div className="text-center py-4">
                  <div className="text-5xl font-bold text-primary-700">{t.current_streak}</div>
                  <div className="text-gray-500 mt-1">days sober</div>
                </div>

                {next && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Next milestone: {next} days</span>
                      <span>{t.current_streak}/{next}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}

                {achieved.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {achieved.map(m => (
                      <span key={m} className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                        <Trophy size={10} /> {m}d
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-between text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                  <span>Best streak: {t.longest_streak} days</span>
                  <span>Relapses: {t.total_relapses}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
