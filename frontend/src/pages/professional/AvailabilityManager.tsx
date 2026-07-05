import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Plus, Trash2, CheckCircle, Loader2 } from 'lucide-react'
import { useT } from '../../contexts/I18nContext'

interface Slot { day_of_week: number; start_time: string; end_time: string }

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

export default function AvailabilityManager() {
  const { t } = useT()
  const [slots, setSlots] = useState<Slot[]>([])
  const [maxClients, setMaxClients] = useState(20)
  const [isOnline, setIsOnline] = useState(false)
  const [customLocation, setCustomLocation] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/availability/mine')
      .then(r => {
        setSlots(r.data.slots?.map((s: any) => ({
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
        })) ?? [])
        setMaxClients(r.data.max_clients_per_week ?? 20)
        setIsOnline(r.data.is_available_online ?? false)
        setCustomLocation(r.data.location_city ?? '')
      })
      .finally(() => setLoading(false))
  }, [])

  const addSlot = () => setSlots(s => [...s, { day_of_week: 1, start_time: '09:00', end_time: '17:00' }])

  const removeSlot = (i: number) => setSlots(s => s.filter((_, idx) => idx !== i))

  const updateSlot = (i: number, field: keyof Slot, value: any) =>
    setSlots(s => s.map((slot, idx) => idx === i ? { ...slot, [field]: value } : slot))

  const save = async () => {
    setSaving(true)
    try {
      await api.put('/availability', {
        slots,
        max_clients_per_week: maxClients,
        is_available_online: isOnline,
        location_city: customLocation
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) {
      alert(e.response?.data?.error || 'Failed to save.')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="text-center py-10 text-gray-400">{t('loading')}</div>

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('availabilityTitle')}</h1>
        <p className="text-gray-500 text-sm mt-1">Set your weekly schedule. Patients can only book during these hours.</p>
      </div>

      <div className="card space-y-4">
        {/* Online Status Toggle */}
        <div className="border-b border-gray-100 pb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isOnline}
              onChange={e => setIsOnline(e.target.checked)}
              className="w-5 h-5 accent-primary-600 rounded"
            />
            <div>
              <span className="font-medium text-gray-900">Available Online</span>
              <p className="text-xs text-gray-500">Toggle this ON to be visible for online bookings</p>
            </div>
            {isOnline && <span className="ml-auto px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">🟢 Online</span>}
          </label>
        </div>

        {/* Custom Location */}
        <div className="border-b border-gray-100 pb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Location / Service Area
          </label>
          <input
            type="text"
            value={customLocation}
            onChange={e => setCustomLocation(e.target.value)}
            placeholder="e.g. Nairobi - Westlands, or Mombasa CBD"
            className="input-field text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">Tell patients where you're located or your service area</p>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">{t('weeklySchedule')}</h2>
          <button onClick={addSlot} className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1.5">
            <Plus size={14} /> {t('addSlot')}
          </button>
        </div>

        {slots.length === 0 && (
          <div className="text-center py-6 text-gray-400 text-sm">
            No slots set. Add your first availability window.
          </div>
        )}

        <div className="space-y-3">
          {slots.map((slot, i) => (
            <div key={i} className="flex items-center gap-3 flex-wrap bg-gray-50 rounded-xl p-3">
              <select
                value={slot.day_of_week}
                onChange={e => updateSlot(i, 'day_of_week', Number(e.target.value))}
                className="input-field text-sm py-1.5 flex-1 min-w-[120px]"
              >
                {DAYS.map((d, di) => <option key={di} value={di}>{d}</option>)}
              </select>
              <input
                type="time"
                value={slot.start_time}
                onChange={e => updateSlot(i, 'start_time', e.target.value)}
                className="input-field text-sm py-1.5 w-28"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="time"
                value={slot.end_time}
                onChange={e => updateSlot(i, 'end_time', e.target.value)}
                className="input-field text-sm py-1.5 w-28"
              />
              <button onClick={() => removeSlot(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('maxClients')}</label>
          <div className="flex items-center gap-3">
            <input
              type="number" min={1} max={60}
              value={maxClients}
              onChange={e => setMaxClients(Number(e.target.value))}
              className="input-field text-sm w-24"
            />
            <span className="text-xs text-gray-400">clients/week (controls your workload)</span>
          </div>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="btn-primary py-2.5 flex items-center gap-2"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <CheckCircle size={15} /> : null}
          {saved ? 'Saved!' : t('saveAvailability')}
        </button>
      </div>
    </div>
  )
}
