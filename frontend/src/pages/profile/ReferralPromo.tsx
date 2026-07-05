import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Gift, Copy, CheckCircle, Loader2, Tag } from 'lucide-react'

export default function ReferralPromo() {
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loadingRef, setLoadingRef] = useState(true)

  // Validate promo code
  const [promoInput, setPromoInput] = useState('')
  const [validating, setValidating] = useState(false)
  const [promoResult, setPromoResult] = useState<{ valid: boolean; type: string; value: number; description: string } | null>(null)
  const [promoError, setPromoError] = useState('')

  useEffect(() => {
    api.get('/promo/my-referral').then(r => setReferralCode(r.data.code)).finally(() => setLoadingRef(false))
  }, [])

  const copyCode = () => {
    if (!referralCode) return
    navigator.clipboard.writeText(referralCode)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const validatePromo = async () => {
    if (!promoInput.trim()) return
    setValidating(true); setPromoResult(null); setPromoError('')
    try {
      const r = await api.post('/promo/validate', { code: promoInput.trim() })
      setPromoResult(r.data)
    } catch (e: any) {
      setPromoError(e.response?.data?.error ?? 'Invalid code')
    } finally { setValidating(false) }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Gift size={22} className="text-pink-500" /> Referrals & Promo Codes
        </h1>
        <p className="text-sm text-gray-500 mt-1">Share your code. Every friend who books earns you KES 200 credit.</p>
      </div>

      {/* My referral code */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-3">My Referral Code</h2>
        {loadingRef ? (
          <div className="text-gray-400 text-sm">Loading…</div>
        ) : referralCode ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <code className="text-2xl font-bold tracking-widest text-teal-700 flex-1">{referralCode}</code>
              <button onClick={copyCode} className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500">
                {copied ? <CheckCircle size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Share this code with friends. When they book their first session, they get <strong>KES 300 off</strong> and you earn <strong>KES 200 credit</strong>.
            </p>
            <button onClick={() => {
              const msg = `Book a mental health session on Afya Yako Siri Yako and get KES 300 off your first session. Use code: ${referralCode}\n\nhttps://mhapke.com`
              if (navigator.share) {
                navigator.share({ title: 'Get KES 300 off', text: msg }).catch(() => {})
              } else {
                navigator.clipboard.writeText(msg)
              }
            }} className="btn-primary w-full flex items-center justify-center gap-2">
              <Gift size={16} /> Share with Friends
            </button>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Could not load referral code.</p>
        )}
      </div>

      {/* Apply promo code */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Tag size={16} /> Apply a Promo Code</h2>
        <div className="flex gap-2">
          <input value={promoInput} onChange={e => setPromoInput(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && validatePromo()}
            className="input-field flex-1 font-mono tracking-wider uppercase"
            placeholder="ENTER CODE" maxLength={20} />
          <button onClick={validatePromo} disabled={validating || !promoInput.trim()}
            className="btn-primary px-4 flex items-center gap-2">
            {validating ? <Loader2 size={14} className="animate-spin" /> : 'Check'}
          </button>
        </div>

        {promoResult && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">Valid code!</p>
              <p className="text-sm text-green-700">{promoResult.description}</p>
            </div>
          </div>
        )}
        {promoError && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {promoError}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-3">
          Promo codes are applied at checkout when booking a session.
        </p>
      </div>

      {/* How it works */}
      <div className="card bg-teal-50 border-teal-200">
        <h2 className="font-semibold text-teal-800 mb-3">How it works</h2>
        <ol className="space-y-2 text-sm text-teal-700">
          <li className="flex gap-3"><span className="font-bold">1.</span> Copy your unique referral code above.</li>
          <li className="flex gap-3"><span className="font-bold">2.</span> Share it with a friend who needs mental health support.</li>
          <li className="flex gap-3"><span className="font-bold">3.</span> They enter it at checkout when booking their first session.</li>
          <li className="flex gap-3"><span className="font-bold">4.</span> They save KES 300, and you automatically receive KES 200 credit for your next session.</li>
        </ol>
      </div>
    </div>
  )
}
