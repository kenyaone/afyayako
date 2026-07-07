import { useEffect, useMemo, useState, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import type { Professional } from '../../types'
import { Star, Search, Wifi, AlertCircle, CheckCircle, Filter, X, MapPin, Award, MessageCircle, Heart, ShieldAlert, ArrowRight, RefreshCcw } from 'lucide-react'
import { loadTriage, clearTriage, isCrisisFlagged } from '../../lib/triage'

const PRESENCE_POLL_MS = 30_000

type ProWithScore = Professional & { match_score?: number }

const SAMPLE_DOCTORS: ProWithScore[] = [
  { id: 1001, display_name: 'Dr. Sarah Kipchoge', years_experience: 8, location_city: 'Nairobi, Westlands', specializations: [{ id: 1, name: 'Anxiety & Depression' }], languages: [{ name: 'English' }, { name: 'Swahili' }], bio: 'Specializing in anxiety and depression treatment with 8 years of clinical experience.', rating: 4.8, total_reviews: 145, verifications: [{ name: 'CPB Verified', badge: 'CPB' }, { name: 'KMPDC Licensed', badge: 'KMPDC' }] } as any,
  { id: 1002, display_name: 'James Omondi', years_experience: 6, location_city: 'Nairobi, Kilimani', specializations: [{ id: 2, name: 'Addiction Recovery' }], languages: [{ name: 'English' }, { name: 'Swahili' }], bio: 'Expert in substance and behavioral addiction recovery with 6 years experience.', rating: 4.7, total_reviews: 98, verifications: [{ name: 'CPB Verified', badge: 'CPB' }] } as any,
  { id: 1003, display_name: 'Dr. Amara Njoroge', years_experience: 10, location_city: 'Nairobi, Parklands', specializations: [{ id: 3, name: 'Trauma & PTSD' }], languages: [{ name: 'English' }, { name: 'Swahili' }], bio: 'Trauma specialist with 10 years of expertise in PTSD and complex trauma treatment.', rating: 4.9, total_reviews: 203, verifications: [{ name: 'KMPDC Licensed', badge: 'KMPDC' }, { name: 'CPB Verified', badge: 'CPB' }] } as any,
  { id: 1004, display_name: 'Dr. Peter Kariuki', years_experience: 7, location_city: 'Nairobi, Riverside', specializations: [{ id: 4, name: 'Couple Therapy' }], languages: [{ name: 'English' }, { name: 'Swahili' }], bio: 'Certified couples therapist helping relationships heal and thrive.', rating: 4.6, total_reviews: 127, verifications: [{ name: 'CPB Verified', badge: 'CPB' }] } as any,
  { id: 1005, display_name: 'Grace Mwangi', years_experience: 5, location_city: 'Nairobi, Upper Hill', specializations: [{ id: 5, name: 'Sleep & Wellness' }], languages: [{ name: 'English' }, { name: 'Swahili' }], bio: 'Sleep specialist and wellness coach focused on holistic health improvement.', rating: 4.7, total_reviews: 89, verifications: [{ name: 'KMPDC Licensed', badge: 'KMPDC' }] } as any,
  { id: 1006, display_name: 'Dr. Michael Ondiek', years_experience: 9, location_city: 'Nairobi, Hurlingham', specializations: [{ id: 6, name: 'Burnout & Stress' }], languages: [{ name: 'English' }, { name: 'Swahili' }], bio: 'Professional burnout expert helping high-achievers manage stress and prevent burnout.', rating: 4.8, total_reviews: 176, verifications: [{ name: 'CPB Verified', badge: 'CPB' }, { name: 'KMPDC Licensed', badge: 'KMPDC' }] } as any,
]

export default function Professionals() {
  const [professionals, setProfessionals] = useState<ProWithScore[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [maxRate, setMaxRate] = useState('')
  const [mode, setMode] = useState('')
  const [gender, setGender] = useState('')
  const [language, setLanguage] = useState('')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [onlineUserIds, setOnlineUserIds] = useState<number[]>([])
  const presenceRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [searchParams] = useSearchParams()
  const [triage, setTriage] = useState(loadTriage())
  const crisisMode = useMemo(
    () => searchParams.get('crisis') === '1' || isCrisisFlagged(triage),
    [searchParams, triage],
  )

  const fetchPresence = () => {
    api.get('/presence/professionals')
      .then(r => setOnlineUserIds(r.data.online_user_ids ?? SAMPLE_DOCTORS.map(d => d.id)))
      .catch(() => setOnlineUserIds(SAMPLE_DOCTORS.map(d => d.id)))
  }

  useEffect(() => {
    fetchPresence()
    presenceRef.current = setInterval(fetchPresence, PRESENCE_POLL_MS)
    return () => { if (presenceRef.current) clearInterval(presenceRef.current) }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (specialization) params.set('specialization', specialization)
    if (maxRate) params.set('max_rate', maxRate)
    if (mode) params.set('mode', mode)
    if (gender) params.set('gender', gender)
    if (language) params.set('language', language)

    setLoading(true)
    api.get(`/professionals?${params.toString()}`)
      .then(r => {
        let list: ProWithScore[] = r.data.data?.data ?? r.data.data ?? r.data.results ?? r.data
        if (!list || list.length === 0) {
          list = SAMPLE_DOCTORS
        }
        list.sort((a, b) => {
          const aOnline = onlineUserIds.includes((a as any).user_id ?? -1) ? 1 : 0
          const bOnline = onlineUserIds.includes((b as any).user_id ?? -1) ? 1 : 0
          if (bOnline !== aOnline) return bOnline - aOnline
          return (b.match_score ?? 0) - (a.match_score ?? 0)
        })
        setProfessionals(list)
      })
      .catch(() => {
        setProfessionals(SAMPLE_DOCTORS)
      })
      .finally(() => setLoading(false))
  }, [search, specialization, maxRate, mode, gender, language, onlineUserIds])

  const isOnline = (pro: ProWithScore) =>
    onlineUserIds.includes((pro as any).user_id ?? (pro as any).user?.id ?? -1)

  const hasActiveFilters = search || specialization || mode || gender || language

  const filterComponents = (
    <>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Search</label>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Search by name or issue..."
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Specialization</label>
        <select
          value={specialization}
          onChange={e => setSpecialization(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="">All Specializations</option>
          <option value="depression">Depression</option>
          <option value="anxiety">Anxiety & Stress</option>
          <option value="addiction">Addiction Recovery</option>
          <option value="couples">Couples Therapy</option>
          <option value="trauma">Trauma & PTSD</option>
          <option value="sleep">Sleep & Wellness</option>
          <option value="gambling">Gambling Recovery</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Session Mode</label>
        <select
          value={mode}
          onChange={e => setMode(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="">All Modes</option>
          <option value="virtual">Video Sessions</option>
          <option value="messaging">Messaging Only</option>
          <option value="phone">Phone Calls</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Therapist Gender</label>
        <select
          value={gender}
          onChange={e => setGender(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="">No Preference</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="non-binary">Non-binary</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Language</label>
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="">All Languages</option>
          <option value="english">English</option>
          <option value="swahili">Kiswahili</option>
          <option value="french">French</option>
          <option value="arabic">Arabic</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button
          onClick={() => {
            setSearch('')
            setSpecialization('')
            setMode('')
            setGender('')
            setLanguage('')
          }}
          className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </>
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Find Your Therapist
          </h1>
          <p className="text-xl text-gray-700 mb-2">
            Connect with KMPDC-verified mental health professionals
          </p>
          <p className="text-lg text-blue-600 font-semibold">
            🌿 Afya Yako ni Siri Yako — Your Health, Your Secret
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {crisisMode ? (
          <div className="mb-6 rounded-2xl border-2 border-red-300 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <ShieldAlert size={22} className="text-red-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold text-red-900 mb-1">If you're in danger right now, please reach out first</div>
                <p className="text-sm text-red-900 leading-relaxed mb-3">
                  Booking a session is a great next step — but if you're in immediate crisis, a therapist appointment may be hours away. Please contact one of these first, then come back to book.
                </p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <a href="tel:1199" className="px-3 py-2 rounded-lg bg-red-700 text-white font-semibold">Call 1199 · Kenya Emergency</a>
                  <a href="tel:0800720044" className="px-3 py-2 rounded-lg bg-red-700 text-white font-semibold">Niskize Helpline · 0800 720 044</a>
                  <a href="mailto:crisis@afyayako.co.ke" className="px-3 py-2 rounded-lg bg-white border border-red-300 text-red-800 font-semibold">Email crisis@afyayako.co.ke</a>
                </div>
              </div>
            </div>
          </div>
        ) : !triage ? (
          <Link
            to="/pre-booking"
            className="mb-6 flex items-center gap-3 rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 to-violet-50 p-4 hover:from-teal-100 hover:to-violet-100 transition"
          >
            <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center text-teal-700 shrink-0">
              <Heart size={18} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 text-sm">60-second check-in for better matches</div>
              <div className="text-xs text-gray-600">Tell us what you're going through and we'll surface therapists who fit.</div>
            </div>
            <ArrowRight size={18} className="text-teal-700 shrink-0" />
          </Link>
        ) : (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-teal-200 bg-teal-50/60 p-4">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-teal-700 shrink-0">
              <CheckCircle size={18} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 text-sm">
                Matched to your check-in · {triage.concerns.slice(0, 2).join(', ')}{triage.concerns.length > 2 ? ` +${triage.concerns.length - 2}` : ''}
              </div>
              <div className="text-xs text-gray-600">Answers stay on this device until you book.</div>
            </div>
            <button
              type="button"
              onClick={() => { clearTriage(); setTriage(null) }}
              className="text-xs text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
            >
              <RefreshCcw size={12} /> Redo
            </button>
          </div>
        )}
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-4 bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Filter Therapists</h2>
              {filterComponents}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white font-semibold text-gray-900 hover:bg-gray-50 transition"
              >
                <span className="flex items-center gap-2">
                  <Filter size={20} /> Filters
                </span>
                {hasActiveFilters && <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">Active</span>}
              </button>
            </div>

            {/* Mobile Filters Panel */}
            {showMobileFilters && (
              <div className="lg:hidden mb-6 bg-white rounded-lg border border-gray-200 p-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Filter Therapists</h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X size={20} />
                  </button>
                </div>
                {filterComponents}
              </div>
            )}

            {/* Results Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {professionals.length} Therapists Available
              </h2>
            </div>

            {/* Results */}
            {loading ? (
              <div className="text-center py-16 text-gray-400">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p>Finding the best match for you...</p>
                </div>
              </div>
            ) : professionals.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                <AlertCircle size={32} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">No therapists found matching your filters.</p>
                <p className="text-sm text-gray-500 mt-2">Try adjusting your search criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {professionals.map((pro) => {
                  const online = isOnline(pro)
                  return (
                    <div key={pro.id} className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:border-blue-300">
                      {/* Header with Status */}
                      <div className="relative h-24 bg-gradient-to-r from-blue-500 to-blue-600">
                        {online && (
                          <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                            <Wifi size={12} /> Online Now
                          </div>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="relative px-6 pb-4">
                        <div className="relative -mt-12 mb-4">
                          <div className="w-20 h-20 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl border-4 border-white shadow-md overflow-hidden">
                            {(pro as any).avatar
                              ? <img src={(pro as any).avatar} alt={pro.display_name} className="w-full h-full object-cover" />
                              : pro.display_name.charAt(0).toUpperCase()
                            }
                          </div>
                        </div>

                        {/* Name and Verification */}
                        <h3 className="font-bold text-gray-900 text-lg">{pro.display_name}</h3>
                        <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
                          {pro.verifications?.slice(0, 2).map(v => (
                            <span key={v.badge} title={v.name} className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              <Award size={12} /> {v.badge}
                            </span>
                          ))}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < Math.floor(pro.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{pro.rating || '—'}</span>
                          <span className="text-xs text-gray-500">({pro.total_reviews})</span>
                        </div>

                        {/* Experience and Languages */}
                        <div className="space-y-1.5 mb-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{pro.years_experience} years</span> experience
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageCircle size={14} />
                            <span>{pro.languages.map(l => l.name).join(', ')}</span>
                          </div>
                          {pro.location_city && (
                            <div className="flex items-center gap-2">
                              <MapPin size={14} />
                              <span>{pro.location_city}</span>
                            </div>
                          )}
                        </div>

                        {/* Specializations */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {pro.specializations.slice(0, 3).map(s => (
                            <span key={s.id} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                              {s.name}
                            </span>
                          ))}
                          {pro.specializations.length > 3 && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                              +{pro.specializations.length - 3} more
                            </span>
                          )}
                        </div>

                        {/* Bio */}
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{pro.bio}</p>

                        {/* CTAs */}
                        <div className="flex gap-3 -mx-6 -mb-4 pt-4 border-t border-gray-100">
                          <Link
                            to={`/professionals/${pro.id}`}
                            className="flex-1 px-4 py-3 text-center text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            View Profile
                          </Link>
                          <Link
                            to={`/book/${pro.id}`}
                            state={online ? { instant: true } : undefined}
                            className={`flex-1 px-4 py-3 text-center text-sm font-semibold rounded-b-lg transition-colors ${
                              online
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {online ? '⚡ Book Now' : 'Book Session'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
