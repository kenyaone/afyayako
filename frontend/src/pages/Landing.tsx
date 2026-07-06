import { Link } from 'react-router-dom'
import {
  Building2, GraduationCap, HeartHandshake, Shield, Video, Users,
  CheckCircle2, ArrowRight, Award, EyeOff, TrendingUp, FileCheck,
} from 'lucide-react'

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
  },
]

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
  { name: 'Small',  band: '1–50 employees',    price: '490',    unit: 'per employee / month', highlight: false },
  { name: 'Medium', band: '51–200 employees',  price: '1,000',  unit: 'per employee / month', highlight: true  },
  { name: 'Large',  band: '200+ employees',    price: 'Custom', unit: 'tailored to your org', highlight: false },
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
      <section className="bg-gradient-to-br from-primary-50 via-white to-teal-50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary-100 border border-primary-200 text-primary-800 text-xs px-3 py-1.5 rounded-full mb-6 font-medium">
              🇰🇪 Built for Kenyan employers · MoH-aligned
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-5 text-gray-900">
              Mental-health support<br/>
              your whole team<br/>
              <span className="text-primary-700">can actually use.</span>
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
              <Link to="/corporate" className="flex items-center gap-2 px-7 py-3.5 bg-primary-600 hover:bg-primary-700 rounded-xl font-bold text-white transition-colors shadow-lg shadow-primary-900/20">
                Get EAP pricing <ArrowRight size={18}/>
              </Link>
              <a href="mailto:sales@afyayako.co.ke?subject=Book%20an%20EAP%20demo" className="px-7 py-3.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl font-semibold text-gray-800 transition-colors">
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

      {/* ── SEGMENTS ── */}
      <section id="segments" className="bg-gray-50 py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Built for organisations that care</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Whether you run a growing business, a school, or a mission-driven NGO — the people you rely on are carrying more than they can say out loud.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SEGMENTS.map(({icon: Icon, title, tagline, lines, href}) => (
              <div key={title} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mb-5">
                  <Icon size={24} className="text-primary-700"/>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                <div className="text-xs text-primary-700 font-semibold uppercase tracking-wide mb-3">{tagline}</div>
                {lines.map((l,i)=>(<p key={i} className="text-gray-600 text-sm mb-2 leading-relaxed">{l}</p>))}
                <Link to={href} className="mt-4 text-primary-700 font-semibold text-sm hover:underline inline-flex items-center gap-1">
                  See the plan for {title.toLowerCase()} <ArrowRight size={14}/>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="bg-white py-20 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">How it works</h2>
            <p className="text-gray-600">Five steps from signup to first session. No sales calls required.</p>
          </div>
          <ol className="space-y-6">
            {HOW_IT_WORKS.map(({n,title,blurb}) => (
              <li key={n} className="flex gap-5 items-start">
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-lg">{n}</div>
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
            {PRICING.map(({name,band,price,unit,highlight}) => (
              <div key={name} className={`rounded-2xl p-7 border-2 ${highlight ? 'border-primary-600 shadow-lg relative' : 'border-gray-200'}`}>
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Most popular</div>
                )}
                <div className="font-bold text-gray-900 text-xl mb-1">{name}</div>
                <div className="text-xs text-gray-500 mb-4">{band}</div>
                <div className="mb-5">
                  {price === 'Custom' ? (
                    <div className="text-3xl font-black text-primary-700">Let's talk</div>
                  ) : (
                    <>
                      <span className="text-3xl font-black text-gray-900">KSh {price}</span>
                      <span className="text-sm text-gray-500"> {unit}</span>
                    </>
                  )}
                </div>
                <Link to="/corporate" className="block text-center px-4 py-2.5 rounded-lg font-semibold text-sm bg-primary-600 hover:bg-primary-700 text-white transition-colors">
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
    </div>
  )
}
