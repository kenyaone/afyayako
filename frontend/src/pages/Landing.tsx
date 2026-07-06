import { Link } from 'react-router-dom'
import {
  Building2, GraduationCap, HeartHandshake, Shield, Video, Users,
  CheckCircle2, ArrowRight, Award, EyeOff, TrendingUp, FileCheck, Sparkles,
  Brain, Wind, Wine, Pill, Dice5, Flame, Moon, HeartCrack,
} from 'lucide-react'
import LaunchOfferPopup from '../components/LaunchOfferPopup'

/**
 * B2B / EAP-focused landing.
 * Target buyers: Kenyan companies, schools, and NGOs signing up for an
 * anonymous EAP for their staff/students.
 * All individual-therapy CTAs, chatbot triage, and live-availability
 * banner have been intentionally removed for this focus experiment.
 * The previous individual-focused landing is preserved as
 * LandingIndividual.tsx.bak (gitignored) for reference.
 */

const SEGMENTS = [
  {
    icon: Building2,
    title: 'Companies',
    tagline: 'From startups to enterprise',
    lines: [
      'Burnout, anxiety, and depression cost Kenyan employers billions in lost productivity every year.',
      'Give your team a private, always-on outlet — before it becomes a crisis.',
    ],
    href: '/corporate?from=companies',
    accent: 'orange',   // amber / warm
  },
  {
    icon: GraduationCap,
    title: 'Schools',
    tagline: 'Universities, TVETs, secondary schools',
    lines: [
      'Students face academic pressure, family stress, and mental-health stigma.',
      'Give them confidential support that never appears on their transcript.',
    ],
    href: '/corporate?from=schools',
    accent: 'violet',   // youth / creativity
  },
  {
    icon: HeartHandshake,
    title: 'NGOs',
    tagline: 'Field teams, aid workers, mission staff',
    lines: [
      'Field work in high-need communities takes a toll. Vicarious trauma is real.',
      'Invest in staff wellbeing so your mission stays sustainable.',
    ],
    href: '/corporate?from=ngos',
    accent: 'rose',     // care / warmth
  },
]

// Tailwind can't derive class names dynamically, so a fixed map keeps the JIT happy.
const ACCENT: Record<string, { bg: string; icon: string; tag: string; link: string; hoverBorder: string }> = {
  orange: { bg: 'bg-orange-100', icon: 'text-orange-600', tag: 'text-orange-700', link: 'text-orange-700 hover:text-orange-800', hoverBorder: 'hover:border-orange-300' },
  violet: { bg: 'bg-violet-100', icon: 'text-violet-600', tag: 'text-violet-700', link: 'text-violet-700 hover:text-violet-800', hoverBorder: 'hover:border-violet-300' },
  rose:   { bg: 'bg-rose-100',   icon: 'text-rose-600',   tag: 'text-rose-700',   link: 'text-rose-700 hover:text-rose-800',     hoverBorder: 'hover:border-rose-300'   },
}

const HOW_IT_WORKS = [
  { n: 1, title: 'Your HR signs up',           blurb: 'Pick a tier (Small / Medium / Large), enter your team size, and we generate a confidential invite link for your staff.' },
  { n: 2, title: 'Post the link privately',    blurb: 'Share on your intranet, BCC in an all-staff email, or pin in Slack/Teams. No one gets a personal invite.' },
  { n: 3, title: 'Staff sign up anonymously',  blurb: "Each employee gets a code (EMP-XXXXX). Their name, email, and sessions stay private — HR can't link them back." },
  { n: 4, title: 'They book real sessions',    blurb: 'KMPDC- & CPB-verified therapists. 24/7 tele-therapy plus up to 4 in-person sessions per employee per month.' },
  { n: 5, title: 'HR sees aggregate reports',  blurb: 'Utilisation percentage, session counts, and cost — never names, never session content. GDPR / KDPA-compliant.' },
]

const PRIVACY = [
  { icon: EyeOff,    label: 'No employee identities',        detail: 'HR only sees anonymous codes and aggregate counts.' },
  { icon: Shield,    label: 'Kenya DPA 2019 compliant',      detail: 'Data-protection-by-design across the whole platform.' },
  { icon: FileCheck, label: 'MoH Tele-mental Health guide',  detail: 'Aligned with the January 2021 Ministry of Health guidelines.' },
  { icon: Award,     label: 'KMPDC & CPB verified',          detail: "Every therapist's licence is checked against the public registry." },
]

const PRICING = [
  { name: 'Small',  band: 'Up to 50 employees', price: '25,000', unit: 'flat / month',          highlight: false, note: 'Same monthly bill from 1 up to 50 people' },
  { name: 'Medium', band: '51–200 employees',   price: '1,000',  unit: 'per employee / month',  highlight: true,  note: '' },
  { name: 'Large',  band: '200+ employees',     price: 'Custom', unit: 'tailored to your org',  highlight: false, note: '' },
]

const WHAT_WE_COVER = [
  { icon: Brain,     accent: 'from-indigo-500 to-violet-500',   title: 'Depression',          blurb: 'PHQ-9 screening, therapy & medication support.' },
  { icon: Wind,      accent: 'from-sky-500 to-cyan-500',        title: 'Anxiety & panic',     blurb: 'GAD-7 screening, CBT and skills training.' },
  { icon: Flame,     accent: 'from-orange-500 to-rose-500',     title: 'Burnout',             blurb: 'Recovery from workplace overload and cynicism.' },
  { icon: Wine,      accent: 'from-amber-500 to-red-500',       title: 'Alcohol use',         blurb: 'AUDIT screening, motivational and recovery care.' },
  { icon: Pill,      accent: 'from-fuchsia-500 to-pink-500',    title: 'Substance use',       blurb: 'Confidential support for use of cannabis, khat, opioids and more.' },
  { icon: Dice5,     accent: 'from-emerald-500 to-teal-500',    title: 'Betting & gambling',  blurb: 'PGSI screening, harm-reduction and recovery.' },
  { icon: Moon,      accent: 'from-blue-500 to-indigo-500',     title: 'Insomnia',            blurb: 'Sleep hygiene, CBT-I and stress management.' },
  { icon: HeartCrack,accent: 'from-rose-500 to-pink-500',       title: 'Grief & relationships', blurb: 'Loss, family conflict, and life transitions.' },
]

const FAQ = [
  {
    q: 'Can our HR see who used the service?',
    a: 'No. Employees sign up with an anonymous code. HR only ever sees aggregate metrics (e.g. "X employees active this month, Y sessions delivered") — never who, what, or when specifically.',
  },
  {
    q: 'Are the therapists licensed in Kenya?',
    a: 'Yes. Every therapist on the platform is verified against the KMPDC (Kenya Medical Practitioners & Dentists Council) or CPB (Counsellors & Psychologists Board) public registries before they can accept sessions.',
  },
  {
    q: 'How many sessions does each employee get?',
    a: 'Up to 4 in-person or video sessions per employee per month, plus unlimited access to the 24/7 crisis helpline. No hidden per-session fees on top of the monthly subscription.',
  },
  {
    q: 'What happens if a member of staff is in crisis?',
    a: 'The 24/7 helpline routes to a KMPDC-verified therapist immediately. High-risk cases follow a documented safety-plan protocol aligned with the MoH tele-mental-health guidelines.',
  },
  {
    q: 'Can we integrate with our SSO or HRIS?',
    a: 'For Medium and Large tiers, yes — we support SSO (SAML/OIDC) and can accept an employee-roster CSV or feed from your HRIS. Contact us for details.',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen font-sans bg-white">

      {/* ── NAV ── */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-5 py-3.5 max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'linear-gradient(135deg,#0d9488,#0f766e)'}}>
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <span className="text-base font-bold text-gray-900">Afya Yako <span className="text-primary-700">for Work</span></span>
          </div>
          <div className="flex gap-1 items-center">
            <a href="#segments"   className="hidden md:block px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-700">Who it's for</a>
            <a href="#how"        className="hidden md:block px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-700">How it works</a>
            <a href="#pricing"    className="hidden md:block px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-700">Pricing</a>
            <a href="#faq"        className="hidden md:block px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-700">FAQ</a>
            <Link to="/apply"     className="hidden md:block px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-700">For therapists</Link>
            <Link to="/login"     className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Login</Link>
            <Link to="/corporate" className="ml-1 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 flex items-center gap-1.5">
              Get EAP <ArrowRight size={14}/>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        {/* vibrant multi-hue background */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 25%, #ede9fe 55%, #d1fae5 100%)' }} />
        <div className="absolute -top-32 -right-40 w-[600px] h-[600px] bg-orange-300/45 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-40 -left-24 w-[520px] h-[520px] bg-violet-300/45 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-1/4 left-1/2 w-[380px] h-[380px] bg-teal-300/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-rose-300/40 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-5 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur border border-primary-200 text-primary-800 text-xs px-3 py-1.5 rounded-full mb-6 font-semibold shadow-sm">
              <Sparkles size={13} className="text-orange-500"/> Built for Kenyan employers · MoH-aligned
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-[1.05] tracking-tight mb-5 text-gray-900">
              Mental-health support<br/>
              your whole team<br/>
              <span className="bg-gradient-to-r from-orange-500 via-rose-500 to-violet-600 bg-clip-text text-transparent">can actually use.</span>
            </h1>
            <p className="text-gray-700 text-base md:text-lg mb-8 leading-relaxed">
              A confidential Employee Assistance Programme for Kenyan
              <strong className="text-gray-900"> companies</strong>,
              <strong className="text-gray-900"> schools</strong>, and
              <strong className="text-gray-900"> NGOs</strong> — 24/7 tele-therapy plus in-person
              sessions with KMPDC- &amp; CPB-verified professionals. Staff sign up anonymously.
              HR never sees who.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                to="/corporate"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-orange-900/25 transition-transform hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)' }}
              >
                Get EAP pricing <ArrowRight size={18}/>
              </Link>
              <a href="mailto:sales@afyayako.co.ke?subject=Book%20an%20EAP%20demo" className="px-7 py-3.5 bg-white hover:bg-gray-50 border-2 border-primary-600 rounded-xl font-semibold text-primary-700 transition-colors">
                Book a demo
              </a>
            </div>
            <div className="mt-6 flex items-center gap-4 text-sm text-gray-600 flex-wrap">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-primary-600"/> Anonymous by design</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-primary-600"/> Predictable monthly cost</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-primary-600"/> No setup fee</span>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6">
              <div className="text-xs uppercase tracking-widest text-primary-700 font-semibold mb-3">HR Dashboard preview</div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div>
                    <div className="text-xs text-gray-500">Employees enrolled</div>
                    <div className="text-2xl font-bold text-gray-900">38 <span className="text-xs text-gray-400 font-normal">of 45</span></div>
                  </div>
                  <TrendingUp size={22} className="text-primary-600"/>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div>
                    <div className="text-xs text-gray-500">Sessions this month</div>
                    <div className="text-2xl font-bold text-gray-900">54</div>
                  </div>
                  <Video size={22} className="text-teal-600"/>
                </div>
                <div className="flex justify-between items-center py-3">
                  <div>
                    <div className="text-xs text-gray-500">Utilisation</div>
                    <div className="text-2xl font-bold text-gray-900">32%</div>
                  </div>
                  <Users size={22} className="text-emerald-600"/>
                </div>
              </div>
              <div className="mt-4 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500 flex items-center gap-1.5">
                <EyeOff size={12}/> No individual identities shown. All anonymised.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="bg-white border-y border-gray-100 py-6">
        <div className="max-w-6xl mx-auto px-5 flex flex-wrap justify-center md:justify-between items-center gap-x-8 gap-y-3 text-sm text-gray-500">
          <span className="flex items-center gap-2"><Award size={16} className="text-primary-600"/> KMPDC-verified therapists</span>
          <span className="flex items-center gap-2"><Award size={16} className="text-primary-600"/> CPB-verified counsellors</span>
          <span className="flex items-center gap-2"><Shield size={16} className="text-primary-600"/> Kenya Data Protection Act 2019</span>
          <span className="flex items-center gap-2"><FileCheck size={16} className="text-primary-600"/> MoH Tele-mental Health guidelines</span>
        </div>
      </section>

      {/* ── WHAT WE COVER (moved above the fold) ── */}
      <section id="cover" className="bg-white py-16 md:py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-200 text-orange-800 text-xs px-3 py-1.5 rounded-full mb-4 font-semibold uppercase tracking-wide">
              <Sparkles size={13}/> What we help with
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              Depression. Anxiety. <span className="bg-gradient-to-r from-amber-500 via-red-500 to-fuchsia-600 bg-clip-text text-transparent">Alcohol. Betting. Substance use.</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A single EAP that covers the whole spectrum — from workplace burnout to alcohol,
              substance-use, and betting/gambling recovery — with KMPDC- and CPB-verified therapists.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {WHAT_WE_COVER.map(({icon: Icon, accent, title, blurb}) => (
              <div key={title} className="relative bg-white border-2 border-gray-100 hover:border-transparent rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${accent}`} />
                <div className={`relative w-10 h-10 rounded-lg bg-gradient-to-br ${accent} flex items-center justify-center mb-3 shadow-sm`}>
                  <Icon size={20} className="text-white"/>
                </div>
                <div className="relative font-bold text-gray-900 group-hover:text-white transition-colors">{title}</div>
                <div className="relative text-xs text-gray-600 group-hover:text-white/90 leading-relaxed mt-1 transition-colors">{blurb}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEGMENTS ── */}
      <section id="segments" className="relative py-20 px-5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-rose-50 to-violet-50" />
        <div className="absolute -left-20 top-1/2 w-72 h-72 bg-orange-200/50 rounded-full blur-3xl" />
        <div className="absolute -right-20 top-0 w-80 h-80 bg-violet-200/50 rounded-full blur-3xl" />
        <div className="relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Built for organisations that care</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Whether you run a growing business, a school, or a mission-driven NGO — the people you rely on are carrying more than they can say out loud.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SEGMENTS.map(({icon: Icon, title, tagline, lines, href, accent}) => {
              const a = ACCENT[accent]
              return (
                <div key={title} className={`bg-white rounded-2xl p-8 border-2 border-transparent ${a.hoverBorder} shadow-sm hover:shadow-xl transition-all flex flex-col`}>
                  <div className={`w-12 h-12 rounded-xl ${a.bg} flex items-center justify-center mb-5`}>
                    <Icon size={24} className={a.icon}/>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                  <div className={`text-xs font-semibold uppercase tracking-wide mb-3 ${a.tag}`}>{tagline}</div>
                  {lines.map((l,i)=>(<p key={i} className="text-gray-600 text-sm mb-2 leading-relaxed">{l}</p>))}
                  <Link to={href} className={`mt-4 font-semibold text-sm hover:underline inline-flex items-center gap-1 ${a.link}`}>
                    See the plan for {title.toLowerCase()} <ArrowRight size={14}/>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="bg-gradient-to-b from-white to-primary-50/40 py-20 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">How it works</h2>
            <p className="text-gray-600">Five steps from signup to first session. No sales calls required.</p>
          </div>
          <ol className="space-y-6">
            {HOW_IT_WORKS.map(({n,title,blurb}) => (
              <li key={n} className="flex gap-5 items-start">
                <div
                  className="flex-shrink-0 w-11 h-11 rounded-full text-white font-bold flex items-center justify-center text-lg shadow-md"
                  style={{ background: 'linear-gradient(135deg, #0d9488 0%, #f97316 100%)' }}
                >{n}</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{blurb}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── PRIVACY ── */}
      <section className="bg-primary-900 text-white py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-3">Privacy is the whole product.</h2>
            <p className="text-primary-100 max-w-2xl mx-auto">
              An EAP only works if staff trust it. Everything about ours is designed so HR literally <em>cannot</em> identify a user of the service.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PRIVACY.map(({icon: Icon, label, detail}) => (
              <div key={label} className="bg-primary-800/50 border border-primary-700 rounded-2xl p-6">
                <Icon size={26} className="text-primary-200 mb-3"/>
                <h3 className="font-bold text-white mb-1">{label}</h3>
                <p className="text-primary-200 text-sm leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING PREVIEW ── */}
      <section id="pricing" className="bg-white py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Predictable Kenya-market pricing</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Pay a flat monthly rate per employee. Includes 24/7 tele-therapy and up to 4 in-person sessions per employee per month.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PRICING.map(({name,band,price,unit,highlight,note}) => (
              <div
                key={name}
                className={`rounded-2xl p-7 border-2 ${highlight ? 'border-orange-500 shadow-xl relative bg-gradient-to-br from-orange-50 via-white to-primary-50' : 'border-gray-200 bg-white hover:border-primary-300 transition-colors'}`}
              >
                {highlight && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-3 py-1 rounded-full shadow"
                    style={{ background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)' }}
                  >
                    ⭐ Most popular
                  </div>
                )}
                <div className="font-bold text-gray-900 text-xl mb-1">{name}</div>
                <div className="text-xs text-gray-500 mb-4">{band}</div>
                <div className="mb-5">
                  {price === 'Custom' ? (
                    <div className="text-3xl font-black text-primary-700">Let's talk</div>
                  ) : (
                    <div>
                      <span className="text-3xl font-black text-gray-900">KSh {price}</span>
                      <span className="text-sm text-gray-500"> {unit}</span>
                      {note && <div className="text-xs text-primary-700 font-medium mt-1">{note}</div>}
                    </div>
                  )}
                </div>
                <Link
                  to="/corporate"
                  className={`block text-center px-4 py-2.5 rounded-lg font-semibold text-sm text-white transition-transform hover:scale-[1.02] ${highlight ? '' : 'bg-primary-600 hover:bg-primary-700'}`}
                  style={highlight ? { background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)' } : undefined}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-500 mt-6">
            All plans include KMPDC- &amp; CPB-verified therapists, 24/7 crisis helpline, anonymous employee signup, and monthly usage reports.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-gray-50 py-20 px-5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 text-center mb-12">Frequently asked</h2>
          <div className="space-y-4">
            {FAQ.map(({q,a}, i) => (
              <details key={i} className="bg-white rounded-xl border border-gray-200 group">
                <summary className="cursor-pointer p-5 font-semibold text-gray-900 flex items-center justify-between">
                  {q}
                  <span className="text-primary-700 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to give your team a real safety net?</h2>
          <p className="text-primary-100 mb-8 text-lg">Sign up in under 5 minutes. Cancel any time.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/corporate" className="px-8 py-4 bg-white text-primary-700 hover:bg-primary-50 rounded-xl font-bold transition-colors">
              Get EAP pricing
            </Link>
            <a href="mailto:sales@afyayako.co.ke?subject=Book%20an%20EAP%20demo" className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl font-semibold text-white transition-colors">
              Talk to sales
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-white py-12 px-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <span className="text-base font-bold">Afya Yako Siri Yako</span>
            </div>
            <p className="text-slate-400 text-xs">Confidential mental-health support for Kenyan employers.</p>
          </div>
          <div className="flex gap-8 text-sm">
            <div>
              <div className="font-semibold text-white mb-2">For organisations</div>
              <Link to="/corporate" className="block text-slate-400 hover:text-white py-0.5">Get EAP pricing</Link>
              <a    href="#how"     className="block text-slate-400 hover:text-white py-0.5">How it works</a>
              <a    href="#pricing" className="block text-slate-400 hover:text-white py-0.5">Pricing</a>
              <a    href="#faq"     className="block text-slate-400 hover:text-white py-0.5">FAQ</a>
            </div>
            <div>
              <div className="font-semibold text-white mb-2">For therapists</div>
              <Link to="/apply"     className="block text-slate-400 hover:text-white py-0.5">Join the network</Link>
              <Link to="/login"     className="block text-slate-400 hover:text-white py-0.5">Login</Link>
            </div>
            <div>
              <div className="font-semibold text-white mb-2">Legal</div>
              <Link to="/privacy"   className="block text-slate-400 hover:text-white py-0.5">Privacy</Link>
              <Link to="/terms"     className="block text-slate-400 hover:text-white py-0.5">Terms</Link>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-slate-800 text-slate-500 text-xs text-center">
          © {new Date().getFullYear()} Afya Yako Siri Yako · Nairobi, Kenya
        </div>
      </footer>

      {/* Launch offer popup — 22s time trigger OR 50% scroll, dismissable */}
      <LaunchOfferPopup />
    </div>
  )
}
