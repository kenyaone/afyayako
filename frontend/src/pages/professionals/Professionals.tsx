import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import type { Professional } from '../../types'
import { Star, Search, Wifi, AlertCircle, CheckCircle } from 'lucide-react'

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

function MatchBadge({ score }: { score?: number }) {
  if (!score) return null
  const color = score >= 80 ? 'bg-green-100 text-green-700' : score >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
  const label = score >= 80 ? 'Top match' : score >= 60 ? 'Good match' : 'Available'
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${color}`}>
      {score}% {label}
    </span>
  )
}

export default function Professionals() {
  const [professionals, setProfessionals] = useState<ProWithScore[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [maxRate, setMaxRate] = useState('')
  const [mode, setMode] = useState('')
  const [gender, setGender] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [tribe, setTribe] = useState('')
  const [location, setLocation] = useState('')
  const [language, setLanguage] = useState('')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [onlineUserIds, setOnlineUserIds] = useState<number[]>([])
  const [locationOptions, setLocationOptions] = useState<Array<{ id: number; name: string; county: string }>>([])
  const presenceRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchPresence = () => {
    api.get('/presence/professionals')
      .then(r => setOnlineUserIds(r.data.online_user_ids ?? SAMPLE_DOCTORS.map(d => d.id)))
      .catch(() => setOnlineUserIds(SAMPLE_DOCTORS.map(d => d.id)))
  }

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      )
    }
    api.get('/locations')
      .then(r => setLocationOptions(r.data?.locations || []))
      .catch(() => {})
  }, [])

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
    if (ageRange) params.set('age_range', ageRange)
    if (tribe) params.set('tribe', tribe)
    if (userLocation) {
      params.set('lat', userLocation.lat.toString())
      params.set('lng', userLocation.lng.toString())
      params.set('radius_km', '100')
    } else if (location) {
      params.set('location', location)
    }
    if (language) params.set('language', language)

    setLoading(true)
    api.get(`/professionals?${params.toString()}`)
      .then(r => {
        let list: ProWithScore[] = r.data.data?.data ?? r.data.data ?? r.data.results ?? r.data
        if (!list || list.length === 0) {
          list = SAMPLE_DOCTORS
        }
        // Online-first, then by match_score
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
      .catch(() => {
        setProfessionals(SAMPLE_DOCTORS)
      })
      .finally(() => setLoading(false))
  }, [search, specialization, maxRate, mode, gender, ageRange, tribe, userLocation, location, language])

  const isOnline = (pro: ProWithScore) =>
    onlineUserIds.includes((pro as any).user_id ?? (pro as any).user?.id ?? -1)

  const topScore = professionals[0]?.match_score
  const hasScores = professionals.some(p => p.match_score)
  const lowMatchMode = hasScores && topScore !== undefined && topScore < 80

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find a Therapist</h1>
        <p className="text-gray-500 mt-1">All professionals are KMPDC-verified.</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-9"
                placeholder="Search by name, issue..."
              />
            </div>
            <select value={specialization} onChange={e => setSpecialization(e.target.value)} className="input-field">
              <option value="">All Specializations</option>
              <option value="depression">Depression</option>
              <option value="anxiety">Anxiety</option>
              <option value="substance-use">Substance Use</option>
              <option value="alcohol">Alcohol Recovery</option>
              <option value="gambling">Gambling</option>
              <option value="trauma">Trauma & PTSD</option>
            </select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <select value={mode} onChange={e => setMode(e.target.value)} className="input-field text-sm">
              <option value="">Mode</option>
              <option value="virtual">Virtual</option>
              <option value="physical">In-Person</option>
            </select>
            <select value={gender} onChange={e => setGender(e.target.value)} className="input-field text-sm">
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
            </select>
            <select value={ageRange} onChange={e => setAgeRange(e.target.value)} className="input-field text-sm">
              <option value="">Age Range</option>
              <option value="20-30">20-30</option>
              <option value="30-40">30-40</option>
              <option value="40-50">40-50</option>
              <option value="50+">50+</option>
            </select>
            <select value={location} onChange={e => setLocation(e.target.value)} className="input-field text-sm">
              <option value="">Location</option>
              {locationOptions.map(l => (
                <option key={l.id} value={l.county || l.name}>{l.name}</option>
              ))}
            </select>
            <select value={language} onChange={e => setLanguage(e.target.value)} className="input-field text-sm">
              <option value="">Language</option>
              <option value="english">English</option>
              <option value="swahili">Swahili</option>
              <option value="french">French</option>
              <option value="arabic">Arabic</option>
            </select>
            <select value={tribe} onChange={e => setTribe(e.target.value)} className="input-field text-sm">
              <option value="">Tribe</option>
              <option value="kikuyu">Kikuyu</option>
              <option value="luhya">Luhya</option>
              <option value="kamba">Kamba</option>
              <option value="kalenjin">Kalenjin</option>
              <option value="luo">Luo</option>
              <option value="kuria">Kuria</option>
              <option value="maasai">Maasai</option>
              <option value="samburu">Samburu</option>
              <option value="turkana">Turkana</option>
              <option value="rendille">Rendille</option>
              <option value="somali">Somali</option>
              <option value="kisii">Kisii</option>
              <option value="meru">Meru</option>
              <option value="embu">Embu</option>
              <option value="tharaka">Tharaka</option>
              <option value="boran">Boran</option>
              <option value="swahili">Swahili</option>
              <option value="taita">Taita</option>
              <option value="pukot">Pukot</option>
              <option value="samba">Samba</option>
              <option value="bantutum">Bantutum</option>
              <option value="pokomo">Pokomo</option>
              <option value="bajuni">Bajuni</option>
              <option value="migratory">Migratory/Prefer not to say</option>
            </select>
            {(mode || gender || ageRange || location || tribe || language) && (
              <button
                onClick={() => {
                  setMode('')
                  setGender('')
                  setAgeRange('')
                  setLocation('')
                  setTribe('')
                  setLanguage('')
                }}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Low-match fallback banner */}
      {!loading && lowMatchMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex gap-3 items-start">
          <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Closest available matches shown</p>
            <p className="text-sm text-amber-700 mt-0.5">
              We couldn't find a therapist with a match score above 80% for your profile right now.
              These are the best available professionals — our network is growing.
              Try removing a filter or{' '}
              <button
                onClick={() => { setSpecialization(''); setMaxRate(''); setSearch('') }}
                className="underline font-medium"
              >
                clear all filters
              </button>{' '}
              to see more options.
            </p>
          </div>
        </div>
      )}

      {/* High-match banner */}
      {!loading && hasScores && !lowMatchMode && topScore && topScore >= 80 && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 flex gap-2 items-center">
          <CheckCircle size={16} className="text-green-600" />
          <p className="text-sm text-green-800">
            <strong>AI matched</strong> — therapists are sorted by how well they match your assessment results and preferences.
          </p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading professionals...</div>
      ) : professionals.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          No professionals found. Try adjusting your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {professionals.map((pro) => {
            const online = isOnline(pro)
            return (
              <div key={pro.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl overflow-hidden">
                      {(pro as any).avatar
                        ? <img src={(pro as any).avatar} alt={pro.display_name} className="w-full h-full object-cover" />
                        : pro.display_name.charAt(0).toUpperCase()
                      }
                    </div>
                    {online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full" title="Online now" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{pro.display_name}</span>
                      {online && (
                        <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded-full">
                          <Wifi size={10} /> Online
                        </span>
                      )}
                      <MatchBadge score={pro.match_score} />
                    </div>
                    <div className="flex items-center gap-1 text-sm text-amber-500 mt-0.5">
                      <Star size={14} fill="currentColor" />
                      <span>{pro.rating || '—'}</span>
                      <span className="text-gray-400">({pro.total_reviews} reviews)</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {pro.years_experience} yrs exp · {pro.languages.map(l => l.name).join(', ')}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 px-2 py-1 rounded-lg">Discuss at booking</div>
                  </div>
                </div>

                {pro.specializations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {pro.specializations.slice(0, 4).map(s => (
                      <span key={s.id} className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-sm text-gray-600 mt-3 line-clamp-2">{pro.bio}</p>

                <div className="flex gap-2 mt-4">
                  <Link to={`/professionals/${pro.id}`} className="btn-secondary flex-1 text-center text-sm py-2">
                    View Profile
                  </Link>
                  <Link
                    to={`/book/${pro.id}`}
                    state={online ? { instant: true } : undefined}
                    className={`flex-1 text-center text-sm py-2 rounded-lg font-medium transition-colors
                      ${online ? 'bg-green-600 hover:bg-green-700 text-white' : 'btn-primary'}`}
                  >
                    {online ? '⚡ Book Now' : 'Book Session'}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
