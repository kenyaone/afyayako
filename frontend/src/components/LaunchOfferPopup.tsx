import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X, Heart, TrendingUp } from 'lucide-react'

/**
 * Mission-driven overlay on the public landing.
 * Frames the ask around Kenyan workplace mental-health reality rather
 * than a price discount — the buyer here is HR/CEO signing an EAP out
 * of duty of care, not chasing a coupon.
 *
 * Shows 22s after page load OR at 50% scroll. Dismissal remembered in
 * localStorage for 7 days.
 */

const STORAGE_KEY = 'ay_launch_offer_dismissed_at'
const REMEMBER_DAYS = 7
const TIME_TRIGGER_MS = 800         // ~1 second — fires almost immediately
const SCROLL_TRIGGER_PCT = 0.05     // or basically any scroll (5%)

function wasDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const then = parseInt(raw, 10)
    if (!isFinite(then)) return false
    const elapsedDays = (Date.now() - then) / (1000 * 60 * 60 * 24)
    return elapsedDays < REMEMBER_DAYS
  } catch { return false }
}

function markDismissed() {
  try { localStorage.setItem(STORAGE_KEY, String(Date.now())) } catch {}
}

export default function LaunchOfferPopup() {
  const [open, setOpen] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (wasDismissedRecently()) return

    const timer = window.setTimeout(() => setOpen(true), TIME_TRIGGER_MS)

    const onScroll = () => {
      const scrolled = window.scrollY
      const height   = document.documentElement.scrollHeight - window.innerHeight
      const pct      = height > 0 ? scrolled / height : 0
      if (pct >= SCROLL_TRIGGER_PCT) setOpen(true)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    if (open) {
      const id = window.requestAnimationFrame(() => setReady(true))
      return () => window.cancelAnimationFrame(id)
    }
  }, [open])

  const dismiss = () => {
    markDismissed()
    setReady(false)
    window.setTimeout(() => setOpen(false), 200)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-opacity"
      style={{ opacity: ready ? 1 : 0 }}
      onClick={dismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl transition-transform bg-white"
        style={{ transform: ready ? 'translateY(0) scale(1)' : 'translateY(20px) scale(.96)' }}
      >
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X size={18}/>
        </button>

        {/* Coloured header band */}
        <div
          className="px-8 md:px-10 pt-8 pb-14 text-white relative"
          style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #059669 100%)' }}
        >
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/25 text-white text-xs px-3 py-1.5 rounded-full mb-4 font-semibold uppercase tracking-wide">
            <Heart size={13} className="text-rose-200"/> Duty of care
          </div>
          <h2 className="text-2xl md:text-3xl font-black leading-tight">
            Your team is<br/>carrying more<br/>
            <span className="text-yellow-200">than they can say.</span>
          </h2>
        </div>

        {/* Body — stats + mission */}
        <div className="p-8 md:p-10 -mt-8">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-5 mb-6">
            <div className="grid grid-cols-3 divide-x divide-gray-200 text-center">
              <div className="px-2">
                <div className="text-2xl font-black text-primary-700">1 in 4</div>
                <div className="text-[11px] text-gray-600 leading-tight mt-1">Kenyans will face a mental-health condition this year</div>
              </div>
              <div className="px-2">
                <div className="text-2xl font-black text-orange-600">75%</div>
                <div className="text-[11px] text-gray-600 leading-tight mt-1">of employees hide burnout from their employer</div>
              </div>
              <div className="px-2">
                <div className="text-2xl font-black text-rose-600">4×</div>
                <div className="text-[11px] text-gray-600 leading-tight mt-1">productivity loss vs. cost of treatment</div>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 text-center mt-3">
              Sources: KMPDC · Kenya MoH Tele-Mental Health Guidelines, 2021 · WHO Kenya
            </p>
          </div>

          <p className="text-gray-700 text-[15px] leading-relaxed mb-6">
            The employers who lead this decade will be the ones who treat mental health
            the way we now treat physical safety — as a duty, not a perk.
            <br/><br/>
            Give your team a confidential place to talk to a KMPDC-verified professional,
            before it becomes a crisis. Your name will be part of that shift.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/corporate?utm=popup_mission"
              onClick={dismiss}
              className="flex-1 text-center px-5 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-primary-900/20 transition-transform hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)' }}
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingUp size={16}/> Start with your team
              </div>
            </Link>
            <a
              href="mailto:sales@afyayako.co.ke?subject=EAP%20conversation"
              onClick={dismiss}
              className="flex-1 text-center px-5 py-3.5 bg-white hover:bg-gray-50 border-2 border-primary-600 rounded-xl font-semibold text-primary-700 transition-colors"
            >
              Talk to us first
            </a>
          </div>

          <p className="text-xs text-gray-500 mt-5 text-center">
            KMPDC- &amp; CPB-verified therapists · Anonymous by design · Kenya DPA 2019 compliant
          </p>
        </div>
      </div>
    </div>
  )
}
