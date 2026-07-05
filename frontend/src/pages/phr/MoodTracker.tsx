import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'
import type { MoodLog } from '../../types'
import { format } from 'date-fns'
import { Plus, Heart } from 'lucide-react'

const MOODS = [
  { value: 'excellent', emoji: '😄', label: 'Excellent', score: 10 },
  { value: 'good', emoji: '🙂', label: 'Good', score: 7 },
  { value: 'neutral', emoji: '😐', label: 'Neutral', score: 5 },
  { value: 'sad', emoji: '😢', label: 'Sad', score: 3 },
  { value: 'terrible', emoji: '😣', label: 'Terrible', score: 1 },
]

interface MoodForm {
  mood: string
  mood_score: number
  energy_level: number
  sleep_quality: number
  triggers: string
  coping_strategy: string
  notes: string
  logged_at: string
}

export default function MoodTracker() {
  const [logs, setLogs] = useState<MoodLog[]>([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const { register, handleSubmit, setValue, watch, reset } = useForm<MoodForm>({
    defaultValues: { logged_at: new Date().toISOString().slice(0, 16) }
  })
  const selectedMood = watch('mood')

  useEffect(() => {
    api.get('/phr/mood?days=30').then(r => {
      const raw = r.data.data ?? r.data.results ?? r.data
      setLogs(Array.isArray(raw) ? raw : [])
    }).catch(() => setLogs([]))
  }, [])

  const onSubmit = async (data: MoodForm) => {
    setSaving(true)
    setSubmitError('')
    try {
      const res = await api.post('/phr/mood', data)
      setLogs(prev => [res.data, ...prev])
      setShowForm(false)
      reset()
    } catch (e: any) {
      setSubmitError(e.response?.data?.error || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const moodColor: Record<string, string> = {
    excellent: 'bg-green-50 text-green-700', good: 'bg-blue-50 text-blue-700',
    neutral: 'bg-gray-50 text-gray-700', sad: 'bg-yellow-50 text-yellow-700',
    terrible: 'bg-red-50 text-red-700',
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mood Tracker</h1>
          <p className="text-gray-500 text-sm mt-1">Track how you feel each day.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setSubmitError('') }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Log Mood
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
          <h2 className="font-semibold text-gray-900">How are you feeling?</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select your mood</label>
            <div className="flex gap-3 flex-wrap">
              {MOODS.map(m => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => { setValue('mood', m.value); setValue('mood_score', m.score) }}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all ${
                    selectedMood === m.value ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-xs font-medium text-gray-600">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <input type="hidden" {...register('mood', { required: true })} />
          <input type="hidden" {...register('mood_score')} />

          {[
            { name: 'energy_level', label: 'Energy Level (1–10)' },
            { name: 'sleep_quality', label: 'Sleep Quality (1–10)' },
          ].map(({ name, label }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                {...register(name as keyof MoodForm, { required: true, min: 1, max: 10, valueAsNumber: true })}
                type="number" min={1} max={10}
                className="input-field w-24"
              />
            </div>
          ))}

          {[
            { name: 'triggers', label: 'What triggered this mood?', placeholder: 'Work stress, argument, good news...' },
            { name: 'coping_strategy', label: 'How did you cope?', placeholder: 'Went for a walk, called a friend...' },
            { name: 'notes', label: 'Notes (optional)', placeholder: 'Anything else on your mind...' },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <textarea
                {...register(name as keyof MoodForm)}
                rows={2}
                className="input-field resize-none"
                placeholder={placeholder}
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
            <input {...register('logged_at')} type="datetime-local" className="input-field" />
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{submitError}</div>
          )}

          <div className="flex gap-3">
            <button type="submit" disabled={saving || !selectedMood} className="btn-primary flex-1">
              {saving ? 'Saving...' : 'Save Mood Log'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setSubmitError('') }} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {logs.length === 0 ? (
          <div className="card text-center py-8 text-gray-400">
            <Heart size={36} className="mx-auto mb-2 text-gray-300" />
            No mood logs yet. Start tracking today!
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className={`card border-l-4 ${
              log.mood === 'excellent' || log.mood === 'good' ? 'border-l-green-400' :
              log.mood === 'neutral' ? 'border-l-gray-400' :
              log.mood === 'sad' ? 'border-l-yellow-400' : 'border-l-red-400'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{MOODS.find(m => m.value === log.mood)?.emoji}</span>
                  <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${moodColor[log.mood] || ''}`}>
                    {MOODS.find(m => m.value === log.mood)?.label}
                  </span>
                  <span className="text-sm text-gray-500">Score: {log.mood_score}/10</span>
                </div>
                <span className="text-xs text-gray-400">{format(new Date(log.logged_at), 'MMM d, h:mm a')}</span>
              </div>
              <div className="flex gap-4 text-xs text-gray-500 mb-2">
                <span>Energy: {log.energy_level}/10</span>
                <span>Sleep: {log.sleep_quality}/10</span>
              </div>
              {log.triggers && <p className="text-sm text-gray-600"><strong>Trigger:</strong> {log.triggers}</p>}
              {log.notes && <p className="text-sm text-gray-500 mt-1 italic">{log.notes}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
