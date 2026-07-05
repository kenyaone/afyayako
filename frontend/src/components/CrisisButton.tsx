import { useState, useEffect } from 'react'
import { Phone, X, AlertTriangle, Shield } from 'lucide-react'
import api from '../api/axios'

interface Hotline {
  name: string
  phone: string
  available: string
}

export default function CrisisButton() {
  const [open, setOpen] = useState(false)
  const [hotlines, setHotlines] = useState<Hotline[]>([])
  const [reported, setReported] = useState(false)
  const [reporting, setReporting] = useState(false)

  useEffect(() => {
    if (open && hotlines.length === 0) {
      api.get('/crisis/hotlines')
        .then(r => setHotlines(r.data.hotlines ?? []))
        .catch(() => setHotlines([
          { name: 'Befrienders Kenya', phone: '0800 723 253', available: '24/7' },
          { name: 'NACADA', phone: '1192', available: '24/7' },
          { name: 'Kenya Red Cross', phone: '1199', available: '24/7' },
        ]))
    }
  }, [open])

  const reportCrisis = async () => {
    setReporting(true)
    try {
      await api.post('/crisis/report', {
        content: 'User pressed SOS button — manual crisis report',
        trigger_source: 'mood_log',
      })
      setReported(true)
    } catch {}
    finally { setReporting(false) }
  }

  return (
    <>
      {/* Floating SOS button — bottom-left, clear of AiChat */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-5 z-40 w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-300"
        aria-label="Crisis / Emergency Help"
        title="Crisis Help — tap if you are in danger"
      >
        <Phone size={20} />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-4 pb-4 sm:pb-0">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle size={16} className="text-red-600" />
                  </div>
                  <h2 className="font-bold text-gray-900 dark:text-white text-lg">Crisis Support</h2>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">You are not alone. Help is available right now.</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-2">
                <X size={18} />
              </button>
            </div>

            {/* Hotlines */}
            <div className="space-y-2 mb-4">
              {hotlines.map(h => (
                <a
                  key={h.phone}
                  href={`tel:${h.phone.replace(/\s/g, '')}`}
                  className="flex items-center justify-between bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl px-4 py-3 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors group"
                >
                  <div>
                    <p className="font-semibold text-red-900 dark:text-red-200 text-sm">{h.name}</p>
                    <p className="text-xs text-red-600 dark:text-red-400">{h.available}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-700 dark:text-red-300 text-sm">{h.phone}</span>
                    <Phone size={14} className="text-red-500 group-hover:scale-110 transition-transform" />
                  </div>
                </a>
              ))}
            </div>

            {/* Emergency */}
            <a
              href="tel:999"
              className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm mb-4 transition-colors"
            >
              <Phone size={16} /> Call 999 (Police / Ambulance)
            </a>

            {/* Report to platform */}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
              {reported ? (
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-xl px-4 py-3">
                  <Shield size={14} />
                  Our team has been notified and will follow up.
                </div>
              ) : (
                <button
                  onClick={reportCrisis}
                  disabled={reporting}
                  className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-medium py-2 transition-colors disabled:opacity-50"
                >
                  {reporting ? 'Alerting platform…' : 'Also alert the Afya Yako team'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
