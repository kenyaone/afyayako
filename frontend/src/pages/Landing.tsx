import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Shield, Video, Lock, CheckCircle, ArrowRight, Phone, Globe, MessageCircle, Users, Award, Zap } from 'lucide-react'
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
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-700 hover:bg-primary-600 rounded-full shadow-lg flex items-center justify-center text-white text-2xl transition-all"
        aria-label="Get support"
      >
        {open ? '✕' : '💬'}
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-primary-700 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">Afya Yako Support</p>
              <p className="text-primary-100 text-xs">Siri Yako — Your secret is safe</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-primary-100 hover:text-white text-lg">✕</button>
          </div>
          <div className="p-4 space-y-3">
            {result ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-700 leading-relaxed">{TRIAGE_RESULTS[result].msg}</p>
                <Link to={TRIAGE_RESULTS[result].link} onClick={() => setOpen(false)}
                  className="block w-full bg-primary-700 hover:bg-primary-600 text-white text-center text-sm font-semibold py-2.5 rounded-lg transition-colors">
                  {TRIAGE_RESULTS[result].label}
                </Link>
                <button onClick={reset} className="w-full text-xs text-gray-500 hover:text-gray-700 font-medium">← Back</button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-800">{TRIAGE_STEPS[0].q}</p>
                {TRIAGE_STEPS[0].opts.map((opt) => (
                  <button key={opt.label} onClick={() => setResult(opt.next)}
                    className="w-full text-left text-sm px-3 py-2 rounded-lg border border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-colors text-gray-700">
                    {opt.label}
                  </button>
                ))}
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
]

export default function Landing() {
  const [onlineDocs, setOnlineDocs] = useState<OnlineDoc[]>([])

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/professionals', { params: { is_available_online: true } })
        setOnlineDocs(res.data.professionals || [])
      } catch {
        setOnlineDocs(SAMPLE_DOCTORS)
      }
    }
    fetchDoctors()
  }, [])

  const onlineCount = onlineDocs.length || SAMPLE_DOCTORS.length

  return (
    <div className="min-h-screen font-sans bg-white">
      {/* ── NAV ── */}
      <nav className="bg-white sticky top-0 z-50 border-b border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 max-w-7xl mx-auto">
          <Link to="/" className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span>Afya Yako</span>
          </Link>
          <div className="flex gap-3 items-center">
            <select
              onChange={(e) => {
                const lang = e.target.value
                if (lang === 'sw') {
                  const event = new Event('change')
                  const googleTranslateElement = document.querySelector('[aria-label="Google Translate"]')
                  const select = googleTranslateElement?.querySelector('select')
                  if (select) {
                    select.value = 'sw'
                    select.dispatchEvent(event)
                  }
                }
              }}
              className="text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50"
            >
              <option value="en">English</option>
              <option value="sw">Kiswahili</option>
            </select>
            <Link to="/signup" state={{ role: 'professional' }} className="px-4 py-2 text-primary-700 hover:text-primary-600 text-sm font-bold transition-colors border-l border-gray-200 pl-4">
              🏥 For Therapists
            </Link>
            <Link to="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">Sign In</Link>
            <Link to="/signup" className="px-5 py-2 bg-primary-700 hover:bg-primary-600 rounded-lg font-semibold text-sm text-white transition-colors">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary-100 border border-primary-300 text-primary-700 text-xs px-4 py-2 rounded-full mb-6 font-medium">
              🇰🇪 Kenya's Trusted Mental Health Platform
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-3 text-gray-900">
              Your Health, Your Secret
            </h1>
            <p className="text-2xl font-semibold text-primary-700 mb-6">
              Afya Yako Siri Yako
            </p>
            <p className="text-gray-700 text-lg mb-8 leading-relaxed">
              Get therapy from KMPDC-verified professionals. Completely anonymous. No real name needed. Your confidentiality is our priority.
            </p>
            <div className="flex gap-4 flex-wrap mb-8">
              <Link to="/signup" className="flex items-center gap-2 px-6 py-3 bg-primary-700 hover:bg-primary-600 rounded-lg font-semibold text-white transition-colors shadow-md hover:shadow-lg">
                Start Free Assessment <ArrowRight size={18} />
              </Link>
              <Link to="/professionals" className="px-6 py-3 border-2 border-primary-600 hover:bg-primary-50 rounded-lg font-semibold text-primary-700 transition-colors">
                Browse Therapists
              </Link>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-700">
              <div className="flex items-center gap-1.5">
                <Shield size={16} className="text-primary-600" />
                Encrypted & Private
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={16} className="text-primary-600" />
                KMPDC Verified
              </div>
            </div>
          </div>
          <div className="relative h-72 md:h-[480px] rounded-2xl overflow-hidden shadow-lg border-4 border-white">
            <img src="/stress.jpg" alt="Mental health support" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-900/30 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur border border-white/60 rounded-lg px-4 py-3">
              <p className="text-primary-900 text-sm font-semibold">🌿 Siri Yako</p>
              <p className="text-primary-700 text-xs mt-1">Your Health, Your Secret. Private therapy for everyone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── THERAPY TYPE SELECTOR WITH IMAGES ── */}
      <section className="bg-white py-16 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Find the right therapy for you</h2>
            <p className="text-gray-600 text-lg">Afya Yako ni Siri Yako — Your health journey is your secret</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '👤',
                title: 'Individual Therapy',
                subtitle: 'Personal mental health support',
                desc: 'Depression, anxiety, stress, trauma, grief, and more. One-on-one therapy tailored to your needs.',
                bg: 'from-blue-500 to-blue-600',
                image: '/stress.jpg'
              },
              {
                icon: '👥',
                title: 'Couples Therapy',
                subtitle: 'Strengthen your relationship',
                desc: 'Relationship counseling, communication skills, conflict resolution, and relationship healing.',
                bg: 'from-pink-500 to-rose-600',
                image: '/drunkard.jpg'
              },
              {
                icon: '👨‍👧',
                title: 'Teen Support',
                subtitle: 'Help for your child',
                desc: 'Parents find therapists for their teens. Fully supervised, confidential, and safe. Your teen cannot sign up directly.',
                bg: 'from-purple-500 to-indigo-600',
                image: '/stress.jpg'
              },
            ].map((type, idx) => (
              <Link
                key={idx}
                to="/signup"
                state={{ therapyType: type.title.toLowerCase() }}
                className="group relative h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
              >
                <img src={type.image} alt={type.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className={`absolute inset-0 bg-gradient-to-b ${type.bg} opacity-70 group-hover:opacity-60 transition-opacity`} />
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <div className="text-4xl mb-3">{type.icon}</div>
                  <h3 className="font-bold text-2xl mb-1">{type.title}</h3>
                  <p className="text-sm font-medium text-white/90 mb-3">{type.subtitle}</p>
                  <p className="text-sm leading-relaxed text-white/95 mb-4">{type.desc}</p>
                  <div className="flex items-center gap-2 font-semibold text-white group-hover:gap-3 transition-all">
                    Get started <ArrowRight size={18} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              🌿 <strong>Afya Yako Siri Yako</strong> — Your health is your secret. All therapy is completely confidential.
            </p>
          </div>
        </div>
      </section>

      {/* ── STATISTICS SECTION ── */}
      <section className="bg-primary-700 text-white py-16 px-5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Trusted by thousands in Kenya</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: '150+', label: 'KMPDC Verified Therapists' },
              { number: '5,000+', label: 'Patients Helped' },
              { number: '100%', label: 'Online & Anonymous' },
              { number: '24/7', label: 'Support Available' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <p className="text-primary-100 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-white py-20 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">How Afya Yako Works</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Three simple steps to get help</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: '📋', title: 'Take an Assessment', desc: 'Answer quick questions to understand your needs. Results are completely private.' },
              { step: '2', icon: '✓', title: 'Get Matched', desc: 'Our AI matches you with the best KMPDC-verified therapist for you.' },
              { step: '3', icon: '💬', title: 'Start Therapy', desc: 'Connect securely via video, phone, or messaging. Stay completely anonymous.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-3xl mb-4">
                  {icon}
                </div>
                <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm mb-4">
                  {step}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST & PRIVACY ── */}
      <section className="bg-gray-50 py-20 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Your privacy is guaranteed</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">🌿 Afya Yako Siri Yako — Your health, your secret</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Lock, title: 'Anonymous Signup', desc: 'Use a username only. Your real identity stays completely private.' },
              { icon: Shield, title: 'KMPDC Verified', desc: 'All therapists are licensed and verified by Kenya\'s medical board.' },
              { icon: Video, title: 'Encrypted Sessions', desc: 'Military-grade encryption on all video calls. Not WhatsApp or Google.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon size={24} className="text-primary-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR THERAPISTS SECTION ── */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-primary-200 text-sm font-semibold mb-2">🏥 JOIN OUR NETWORK</p>
              <h2 className="text-4xl font-bold mb-4">Are you a licensed therapist?</h2>
              <p className="text-primary-100 text-lg mb-6 leading-relaxed">
                Help Kenyans access affordable, confidential mental health care. Join Afya Yako and reach patients who need you. KMPDC verified, CPB certified professionals welcome.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex gap-3">
                  <span className="text-xl">✓</span>
                  <span>Set your own schedule and rates</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-xl">✓</span>
                  <span>Reach more patients in Kenya</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-xl">✓</span>
                  <span>Secure, encrypted platform</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-xl">✓</span>
                  <span>Full verification support</span>
                </li>
              </ul>
              <Link
                to="/signup"
                state={{ role: 'professional' }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-primary-50 text-primary-700 rounded-lg font-bold text-lg transition-colors shadow-lg"
              >
                Apply Now <ArrowRight size={20} />
              </Link>
            </div>
            <div className="hidden md:block text-center">
              <div className="text-6xl mb-4">🏥</div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
                <p className="text-2xl font-bold mb-4">Join 150+ Licensed Therapists</p>
                <p className="text-primary-100 text-sm leading-relaxed">
                  Build your practice, help your community. Afya Yako connects you with patients seeking confidential, professional care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-primary-800 text-white py-20 px-5 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-4xl font-bold mb-3">🌿 Afya Yako Siri Yako</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Health, Your Secret</h2>
          <p className="text-primary-100 text-lg mb-8">Get therapy from KMPDC-verified professionals. Free assessment. Anonymous. No credit card required.</p>
          <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-primary-50 text-primary-700 rounded-lg font-bold text-lg transition-colors shadow-lg">
            Start Free Assessment <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Crisis Banner */}
      <div className="bg-red-700 text-white text-center py-4 px-4 text-xs md:text-sm">
        <Phone size={13} className="inline mr-2" />
        <strong>In crisis right now?</strong> Befrienders Kenya: <a href="tel:0800723253" className="underline font-bold">0800 723 253</a> {' · '} NACADA: <a href="tel:1192" className="underline font-bold">1192</a> {' · '} Kenya Red Cross: <a href="tel:1199" className="underline font-bold">1199</a> — Free, 24/7
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-sm py-12 px-5">
        <div className="max-w-7xl mx-auto mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-white font-bold text-base mb-4 flex items-center gap-2">
                <span className="text-2xl">🌿</span>
                Afya Yako Siri Yako
              </div>
              <p className="text-gray-500 text-sm">Mental health support from KMPDC-verified therapists. Your secret is safe.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/professionals" className="hover:text-white transition-colors">Find Therapist</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/signup" state={{ role: 'professional' }} className="hover:text-white transition-colors">For Therapists</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><a href="mailto:support@afyayako.co.ke" className="hover:text-white transition-colors">Email Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-xs">© {new Date().getFullYear()} Afya Yako. All rights reserved. 🌿 Siri Yako — Your secret is safe.</p>
              <div className="flex gap-4 mt-4 md:mt-0 text-xs">
                <span className="text-gray-500">KMPDC Licensed</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Chatbot Triage Widget */}
      <ChatbotTriage />
    </div>
  )
}
