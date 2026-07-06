import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X, Sparkles, Zap } from 'lucide-react'

/**
 * Time-triggered launch-offer popup on the public landing.
 * Shows 22s after page load OR at 50% scroll, whichever comes first.
 * Dismissal is remembered in localStorage for 7 days so returning
 * visitors aren't nagged.
 */

const STORAGE_KEY = 'ay_launch_offer_dismissed_at'
const REMEMBER_DAYS = 7
const TIME_TRIGGER_MS = 22_000
const SCROLL_TRIGGER_PCT = 0.5

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
  const [ready, setReady] = useState(false)   // fires opening animation

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
      // one animation-frame delay so transform starts from off-screen
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
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 transition-opacity"
      style={{ opacity: ready ? 1 : 0 }}
      onClick={dismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl transition-transform"
        style={{
          transform: ready ? 'translateY(0) scale(1)' : 'translateY(20px) scale(.96)',
          background: 'linear-gradient(135deg, #f97316 0%, #ec4899 55%, #8b5cf6 100%)',
        }}
      >
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          aria-label="Close"
        >
          <X size={18}/>
        </button>

        {/* Content */}
        <div className="p-8 md:p-10 text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 text-white text-xs px-3 py-1.5 rounded-full mb-4 font-semibold uppercase tracking-wide">
            <Sparkles size={13}/> Launch offer · Kenya
          </div>

          <h2 className="text-2xl md:text-3xl font-black leading-tight mb-3">
            First 10 companies get<br/>
            <span className="text-yellow-200">2 months free.</span>
          </h2>

          <p className="text-white/90 text-sm md:text-base mb-6 leading-relaxed">
            We're onboarding our first cohort of Kenyan employers this month.
            Book an EAP demo before <b>31st July 2026</b> and get your first 60 days on us
            — no card, no lock-in, just try it with your team.
          </p>

          <div className="space-y-2 mb-7 text-sm">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                <Zap size={12}/>
              </div>
              <span>Full EAP access for every employee</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                <Zap size={12}/>
              </div>
              <span>Onboarding + HR dashboard walk-through</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                <Zap size={12}/>
              </div>
              <span>Anonymised monthly reports included</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/corporate?promo=launch2mo"
              onClick={dismiss}
              className="flex-1 text-center px-5 py-3.5 bg-white text-slate-900 hover:bg-yellow-100 rounded-xl font-bold transition-colors"
            >
              Claim my 2 months →
            </Link>
            <a
              href="mailto:sales@afyayako.co.ke?subject=Book%20an%20EAP%20demo%20(launch%20offer)"
              onClick={dismiss}
              className="flex-1 text-center px-5 py-3.5 bg-white/15 hover:bg-white/25 border border-white/30 rounded-xl font-semibold transition-colors"
            >
              Book a demo
            </a>
          </div>

          <p className="text-xs text-white/70 mt-5 text-center">
            Limited to first 10 organisations. Applies to Small and Medium tiers.
          </p>
        </div>
      </div>
    </div>
  )
}
