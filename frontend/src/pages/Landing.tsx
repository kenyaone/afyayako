import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Shield, Video, Lock, CheckCircle, ArrowRight, Phone, Globe } from 'lucide-react'
import api from '../api/axios'

const TRIAGE_STEPS = [
  {
    q: 'What brings you here today?',
    opts: [
      { label: '😔 I feel depressed or hopeless',        next: 'phq9'  },
      { label: '😰 I feel anxious or overwhelmed',       next: 'gad7'  },
      { label: '🍺 I want to reduce alcohol or drug use',next: 'audit' },
      { label: '🎰 I have a gambling problem',           next: 'pgsi'  },
      { label: '💬 I just need someone to talk to',      next: 'talk'  },
    ],
  },
]

const TRIAGE_RESULTS: Record<string, { msg: string; link: string; label: string }> = {
  phq9:  { msg: 'It sounds like you may be experiencing depression. A PHQ-9 assessment takes 2 minutes and connects you with the right therapist.', link: '/assessments/phq9', label: 'Take PHQ-9 Assessment →' },
  gad7:  { msg: "Anxiety is very common and very treatable. Let's measure where you are with a quick GAD-7 screening.", link: '/assessments/gad7', label: 'Take GAD-7 Assessment →' },
  audit: { msg: 'Taking this step takes real courage. An AUDIT screening will help us understand your needs and match you with the right specialist.', link: '/assessments/audit', label: 'Take AUDIT Screening →' },
  pgsi:  { msg: "You're not alone. A quick PGSI screening helps us find the right support for you.", link: '/assessments/pgsi', label: 'Take PGSI Screening →' },
  talk:  { msg: 'Our verified therapists offer judgement-free sessions, fully private.', link: '/professionals', label: 'Browse Therapists →' },
}

function ChatbotTriage() {
  const [open, setOpen] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const reset = () => setResult(null)

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-teal-700 hover:bg-teal-600 rounded-full shadow-xl flex items-center justify-center text-white text-2xl transition-all"
        aria-label="Get help"
      >
        {open ? '×' : '💬'}
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="bg-teal-700 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">Afya Yako Support</p>
              <p className="text-teal-200 text-xs">Let us find the right help for you</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-teal-200 hover:text-white text-lg">×</button>
          </div>
          <div className="p-4 space-y-3">
            {result ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-700 leading-relaxed">{TRIAGE_RESULTS[result].msg}</p>
                <Link to={TRIAGE_RESULTS[result].link} onClick={() => setOpen(false)}
                  className="block w-full bg-teal-700 hover:bg-teal-600 text-white text-center text-sm font-semibold py-2.5 rounded-lg transition-colors">
                  {TRIAGE_RESULTS[result].label}
                </Link>
                <button onClick={reset} className="w-full text-xs text-gray-400 hover:text-gray-600">← Start over</button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-800">{TRIAGE_STEPS[0].q}</p>
                {TRIAGE_STEPS[0].opts.map((opt) => (
                  <button key={opt.label} onClick={() => setResult(opt.next)}
                    className="w-full text-left text-sm px-3 py-2 rounded-lg border border-gray-200 hover:border-teal-400 hover:bg-teal-50 transition-colors text-gray-700">
                    {opt.label}
                  </button>
                ))}
                <p className="text-xs text-gray-400 text-center pt-1">Anonymous. No sign-up needed to explore.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

interface OnlineDoc {
  id: number
  user_id: number
  display_name: string
  years_experience: number
  location_city?: string
  location_county?: string
  latitude?: number
  longitude?: number
  specializations: { id: number; name: string }[]
  verifications?: { name: string; badge: string }[]
}

const SAMPLE_DOCTORS: OnlineDoc[] = [
  {
    id: 1001,
    user_id: 1001,
    display_name: 'Dr. Sarah Kipchoge',
    years_experience: 8,
    location_city: 'Nairobi, Westlands',
    location_county: 'Nairobi',
    latitude: -1.2754,
    longitude: 36.8064,
    specializations: [{ id: 1, name: 'Anxiety & Depression' }],
    verifications: [{ name: 'CPB Verified', badge: 'CPB' }, { name: 'KMPDC Licensed', badge: 'KMPDC' }],
  },
  {
    id: 1002,
    user_id: 1002,
    display_name: 'James Omondi',
    years_experience: 6,
    location_city: 'Nairobi, Kilimani',
    location_county: 'Nairobi',
    latitude: -1.3000,
    longitude: 36.8000,
    specializations: [{ id: 2, name: 'Addiction Recovery' }],
    verifications: [{ name: 'CPB Verified', badge: 'CPB' }],
  },
  {
    id: 1003,
    user_id: 1003,
    display_name: 'Dr. Amara Njoroge',
    years_experience: 10,
    location_city: 'Nairobi, Parklands',
    location_county: 'Nairobi',
    latitude: -1.2500,
    longitude: 36.8200,
    specializations: [{ id: 3, name: 'Trauma & PTSD' }],
    verifications: [{ name: 'KMPDC Licensed', badge: 'KMPDC' }, { name: 'CPB Verified', badge: 'CPB' }],
  },
  {
    id: 1004,
    user_id: 1004,
    display_name: 'Dr. Peter Kariuki',
    years_experience: 7,
    location_city: 'Nairobi, Riverside',
    location_county: 'Nairobi',
    latitude: -1.2900,
    longitude: 36.8100,
    specializations: [{ id: 4, name: 'Couple Therapy' }],
    verifications: [{ name: 'CPB Verified', badge: 'CPB' }],
  },
  {
    id: 1005,
    user_id: 1005,
    display_name: 'Grace Mwangi',
    years_experience: 5,
    location_city: 'Nairobi, Upper Hill',
    location_county: 'Nairobi',
    latitude: -1.2800,
    longitude: 36.8300,
    specializations: [{ id: 5, name: 'Sleep & Wellness' }],
    verifications: [{ name: 'KMPDC Licensed', badge: 'KMPDC' }],
  },
  {
    id: 1006,
    user_id: 1006,
    display_name: 'Dr. Michael Ondiek',
    years_experience: 9,
    location_city: 'Nairobi, Hurlingham',
    location_county: 'Nairobi',
    latitude: -1.3200,
    longitude: 36.7800,
    specializations: [{ id: 6, name: 'Burnout & Stress' }],
    verifications: [{ name: 'CPB Verified', badge: 'CPB' }, { name: 'KMPDC Licensed', badge: 'KMPDC' }],
  },
]

export default function Landing() {
  const [onlineDocs, setOnlineDocs] = useState<OnlineDoc[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [filteredDocs, setFilteredDocs] = useState<OnlineDoc[]>([])
  const [selectedDistance, setSelectedDistance] = useState(50)

  const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      )
    }
  }, [])

  useEffect(() => {
    if (userLocation) {
      const nearby = onlineDocs.filter(doc => {
        if (!doc.latitude || !doc.longitude) return false
        const dist = calcDistance(userLocation.lat, userLocation.lng, doc.latitude, doc.longitude)
        return dist <= selectedDistance
      })
      setFilteredDocs(nearby)
    } else {
      setFilteredDocs(onlineDocs)
    }
  }, [onlineDocs, userLocation, selectedDistance])

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        if (userLocation) {
          const res = await api.get('/professionals', {
            params: {
              lat: userLocation.lat,
              lng: userLocation.lng,
              radius_km: 100,
              is_available_online: true,
            },
          })
          setOnlineDocs(res.data.professionals || [])
        } else {
          const res = await api.get('/professionals', {
            params: { is_available_online: true },
          })
          setOnlineDocs(res.data.professionals || [])
        }
      } catch {
        setOnlineDocs(SAMPLE_DOCTORS)
      }
    }
    fetchDoctors()
  }, [userLocation])

  const onlineCount = filteredDocs.length || onlineDocs.length

  return (
    <div className="min-h-screen font-sans bg-white">

      {/* ── NAV ── */}
      <nav className="bg-slate-900 sticky top-0 z-50">
        <div className="flex items-center justify-between px-5 py-3.5 max-w-5xl mx-auto">
          <span className="text-base font-bold text-white">🌿 Afya Yako Siri Yako</span>
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-600">
              <Globe size={16} className="text-slate-300" />
              <select
                onChange={(e) => {
                  const lang = e.target.value
                  if (lang === 'sw') {
                    // Trigger Google Translate for Kiswahili
                    const event = new Event('change')
                    const googleTranslateElement = document.querySelector('[aria-label="Google Translate"]')
                    const select = googleTranslateElement?.querySelector('select')
                    if (select) {
                      select.value = 'sw'
                      select.dispatchEvent(event)
                    }
                  }
                }}
                className="bg-transparent text-white text-sm font-medium cursor-pointer outline-none"
              >
                <option value="en">English</option>
                <option value="sw">Kiswahili</option>
              </select>
            </div>
            <Link to="/login" className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium">Login</Link>
            <Link to="/signup" className="px-4 py-2 bg-orange-500 hover:bg-orange-400 rounded-lg font-semibold text-sm text-white transition-colors">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* ── LIVE AVAILABILITY BANNER ── */}
      {onlineCount > 0 ? (
        <section className="bg-gradient-to-r from-orange-500 to-amber-500">
          <div className="max-w-5xl mx-auto px-5 py-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <span className="relative flex-shrink-0">
                  <span className="w-3.5 h-3.5 bg-white rounded-full block animate-ping absolute opacity-75" />
                  <span className="w-3.5 h-3.5 bg-white rounded-full block relative" />
                </span>
                <span className="text-white font-black text-lg md:text-2xl tracking-tight">
                  {onlineCount} Verified Therapist{onlineCount > 1 ? 's' : ''} Available Right Now
                </span>
              </div>
              <Link to="/signup" className="flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 font-black text-sm px-5 py-2.5 rounded-xl transition-colors shadow flex-shrink-0">
                ⚡ Talk to a Therapist Now <ArrowRight size={15} />
              </Link>
            </div>

            {userLocation && (
              <div className="mb-4 flex items-center gap-3 flex-wrap">
                <label className="text-white font-semibold text-sm">Filter by distance:</label>
                <select
                  value={selectedDistance}
                  onChange={e => setSelectedDistance(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg bg-white/20 text-white border border-white/40 text-sm font-semibold cursor-pointer"
                >
                  <option value={10} className="text-gray-900">Within 10 km</option>
                  <option value={25} className="text-gray-900">Within 25 km</option>
                  <option value={50} className="text-gray-900">Within 50 km</option>
                  <option value={100} className="text-gray-900">Within 100 km</option>
                  <option value={10000} className="text-gray-900">Any distance</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(filteredDocs.length > 0 ? filteredDocs : onlineDocs).map(doc => {
                const distance = userLocation && doc.latitude && doc.longitude
                  ? calcDistance(userLocation.lat, userLocation.lng, doc.latitude, doc.longitude).toFixed(1)
                  : null
                return (
                  <Link to="/signup" key={doc.id} className="flex items-start gap-3 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl px-4 py-3 transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-white/30 border-2 border-white/60 flex items-center justify-center text-white font-black text-base flex-shrink-0 mt-0.5">
                      {doc.display_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-white font-bold text-sm truncate">{doc.display_name}</span>
                        <span className="flex items-center gap-0.5 text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Online
                        </span>
                      </div>
                      {doc.verifications && doc.verifications.length > 0 && (
                        <div className="flex gap-1 flex-wrap mt-1">
                          {doc.verifications.map((v) => (
                            <span key={v.badge} title={v.name} className="text-[10px] bg-teal-500/70 text-white px-2 py-0.5 rounded-full font-semibold">
                              ✓ {v.badge}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-orange-100 text-xs truncate mt-0.5">{doc.specializations?.slice(0, 1).map(s => s.name).join(', ') || 'Mental Health'}</div>
                      <div className="text-orange-200 text-xs mt-0.5 flex items-center gap-1">
                        📍 {doc.location_city || 'Nairobi'} {distance && `(${distance} km)`} · {doc.years_experience} yrs
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-white/60 group-hover:text-white flex-shrink-0 transition-colors mt-0.5" />
                  </Link>
                )
              })}
            </div>
            <p className="text-orange-100 text-xs text-center mt-3">Free to sign up · No real name needed · Encrypted sessions</p>
          </div>
        </section>
      ) : (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0" />
            <p className="text-gray-500 text-sm text-center">No therapists online right now — <Link to="/signup" className="text-teal-600 hover:underline font-medium">book a scheduled session</Link></p>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="bg-slate-900 text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 py-14 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-900/60 border border-teal-700 text-teal-200 text-xs px-3 py-1.5 rounded-full mb-6 font-medium">
              🇰🇪 Kenya's mental health, addiction & gambling recovery platform
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-5">
              Verified therapists.<br />Total anonymity.<br />
              <span className="text-orange-400">Zero judgment.</span>
            </h1>
            <p className="text-slate-300 text-base md:text-lg mb-8 leading-relaxed">
              Speak to a <strong className="text-white">KMPDC & CPB-verified therapist</strong> — anonymously. No WhatsApp. No real name required.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link to="/signup" className="flex items-center gap-2 px-7 py-3.5 bg-orange-500 hover:bg-orange-400 rounded-xl font-bold text-white transition-colors shadow-lg shadow-orange-900/40">
                Take Free Assessment <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold transition-colors">
                Sign In
              </Link>
            </div>
            <div className="mt-5 flex items-center gap-2 text-sm text-slate-400">
              <Shield size={14} className="text-teal-400" />
              Free assessment · No credit card · Anonymous by default
            </div>
          </div>
          {/* Image */}
          <div className="relative h-72 md:h-[420px] rounded-2xl overflow-hidden shadow-2xl">
            <img src="/stress.jpg" alt="Mental health support" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur border border-white/40 rounded-lg px-3 py-2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-black text-blue-700">CPB</span>
              </div>
              <div className="text-xs font-semibold text-gray-800">CPB<br/>Verified</div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur border border-white/20 rounded-xl px-4 py-3">
              <p className="text-white text-sm font-semibold">You don't have to face this alone.</p>
              <p className="text-white/70 text-xs mt-0.5">Confidential support from KMPDC & CPB-verified therapists.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4 SERVICE AREAS ── */}
      <section className="bg-gray-50 py-16 px-5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 text-center mb-2">What We Help With</h2>
          <p className="text-gray-500 text-center mb-10">Comprehensive mental health, addiction, sleep, and wellbeing support.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">🧠</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Mental Health</h3>
              <p className="text-gray-500 text-sm mb-4">Depression, anxiety, stress, trauma, grief — with PHQ-9 and GAD-7 clinical screening.</p>
              <Link to="/signup" className="text-teal-600 text-sm font-semibold hover:underline flex items-center gap-1">Get help <ArrowRight size={13} /></Link>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="relative h-36 overflow-hidden">
                <img src="/drunkard.jpg" alt="Addiction recovery" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-900/70 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white font-bold text-sm">Addiction Recovery</div>
              </div>
              <div className="p-5">
                <p className="text-gray-500 text-sm mb-4">Alcohol, drugs, tobacco — with AUDIT screening and specialist support.</p>
                <Link to="/signup" className="text-teal-600 text-sm font-semibold hover:underline flex items-center gap-1">Start recovery <ArrowRight size={13} /></Link>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">🎰</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Gambling Recovery</h3>
              <p className="text-gray-500 text-sm mb-4">Problem gambling and betting addiction — with PGSI screening tool.</p>
              <Link to="/signup" className="text-teal-600 text-sm font-semibold hover:underline flex items-center gap-1">Find support <ArrowRight size={13} /></Link>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">😴</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Sleep Hygiene</h3>
              <p className="text-gray-500 text-sm mb-4">Insomnia, sleep disorders, and rest — with ISI clinical assessment.</p>
              <Link to="/signup" className="text-teal-600 text-sm font-semibold hover:underline flex items-center gap-1">Sleep better <ArrowRight size={13} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── BURNOUT ASSESSMENT HERO ── */}
      <section className="bg-gradient-to-r from-red-50 to-orange-50 py-12 md:py-16 px-5 border-b-2 border-red-100">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-red-100 border border-red-200 text-red-700 text-xs px-3 py-1.5 rounded-full mb-4 font-medium">
              🔥 Featured: Professional Burnout Tool
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">
              Are You Experiencing Burnout?
            </h2>
            <p className="text-gray-600 mb-5 leading-relaxed">
              Using the ProQOL-5 assessment, we measure compassion satisfaction, burnout, and secondary trauma. Get your personalized report with actionable insights and AI-generated recovery recommendations.
            </p>
            <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
              <CheckCircle size={16} className="text-teal-600" />
              30 questions • 5 minutes • Anonymous results
            </p>
            <Link to="/burnout-assessment" className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-red-900/20">
              Take Burnout Assessment <ArrowRight size={16} />
            </Link>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-red-100 shadow-lg">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600 font-bold">1</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Assess Your Status</p>
                  <p className="text-gray-500 text-xs">30-item ProQOL-5 assessment</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 text-orange-600 font-bold">2</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Get Your Zones</p>
                  <p className="text-gray-500 text-xs">Green • Yellow • Orange • Red</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-green-600 font-bold">3</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">AI-Powered Report</p>
                  <p className="text-gray-500 text-xs">Personalized recovery guide</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative py-16 md:py-20 px-5 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/stress.jpg" alt="" className="w-full h-full object-cover opacity-5" />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Take a Free Assessment', desc: 'Answer clinically-validated questions. Get your score and severity rating instantly — no sign-up needed.' },
              { step: '2', title: 'AI Matches You', desc: 'Based on your results, language, and gender preference, AI recommends the best-fit KMPDC-verified therapist.' },
              { step: '3', title: 'Connect Privately', desc: 'Book a session. Join your encrypted video call. No one knows your real identity unless you choose to share.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-teal-50 border-2 border-teal-200 flex items-center justify-center text-teal-700 font-black text-lg flex-shrink-0 mt-0.5">
                  {step}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1.5">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIVACY PROMISE ── */}
      <section className="bg-gray-50 py-14 px-5">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {[
            { icon: Lock, title: 'No Real Name', desc: 'Sign up with a username only. Your identity stays private.' },
            { icon: Video, title: 'Encrypted Video', desc: 'Private Jitsi rooms. Not Google, Facebook, or WhatsApp infrastructure.' },
            { icon: Shield, title: 'KMPDC Verified', desc: 'Every therapist is licensed and verified by Kenya\'s medical board.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Icon size={20} className="text-teal-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-gradient-to-br from-teal-700 to-emerald-800 text-white py-16 md:py-20 px-5 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-3">Ready to start?</h2>
          <p className="text-teal-100 mb-8">Free clinical assessment. Anonymous. No credit card.</p>
          <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-400 text-white rounded-2xl font-black text-lg transition-colors shadow-xl shadow-orange-900/30">
            Take Free Assessment <ArrowRight size={20} />
          </Link>
          <div className="mt-6 text-sm text-teal-200">
            Are you a therapist?{' '}
            <Link to="/signup" state={{ role: 'professional' }} className="text-white hover:underline font-semibold">Apply to join →</Link>
          </div>
        </div>
      </section>

      {/* Chatbot Triage Widget */}
      <ChatbotTriage />

      {/* Crisis Banner */}
      <div className="bg-red-700 text-white text-center py-4 px-4 text-xs md:text-sm">
        <Phone size={13} className="inline mr-2" />
        <strong>In crisis right now?</strong>{' '}
        Befrienders Kenya: <a href="tel:0800723253" className="underline font-bold">0800 723 253</a>
        {' · '}NACADA: <a href="tel:1192" className="underline font-bold">1192</a>
        {' · '}Kenya Red Cross: <a href="tel:1199" className="underline font-bold">1199</a>
        {' '}— Free, 24/7
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 text-gray-400 text-sm py-8 px-5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-bold text-gray-900 text-base">🌿 Afya Yako Siri Yako</div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-5 text-xs md:text-sm">
            <Link to="/faq" className="hover:text-gray-700 transition-colors">FAQ</Link>
            <Link to="/terms" className="hover:text-gray-700 transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-gray-700 transition-colors">Privacy</Link>
            <Link to="/refund-policy" className="hover:text-gray-700 transition-colors">Refund Policy</Link>
            <a href="mailto:support@mhapke.com" className="hover:text-gray-700 transition-colors">Support</a>
          </div>
          <div className="text-xs text-gray-400">© {new Date().getFullYear()} Afya Yako Siri Yako</div>
        </div>
      </footer>
    </div>
  )
}
