import { useState, useEffect, useRef } from 'react'
import { Wind, Zap, Brain, Play, Pause, RotateCcw } from 'lucide-react'

type ExType = 'box' | '478' | 'grounding' | 'progressive'

interface Exercise {
  id: ExType
  name: string
  icon: React.ReactNode
  description: string
  color: string
}

const EXERCISES: Exercise[] = [
  { id: 'box',          name: 'Box Breathing',         icon: <Wind size={20} />,   description: '4-4-4-4 breath used by Navy SEALs to reduce stress instantly.',          color: 'teal' },
  { id: '478',          name: '4-7-8 Breathing',       icon: <Wind size={20} />,   description: 'Inhale for 4, hold for 7, exhale for 8. Calms the nervous system.',       color: 'blue' },
  { id: 'grounding',    name: '5-4-3-2-1 Grounding',   icon: <Zap size={20} />,    description: 'Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.', color: 'green' },
  { id: 'progressive',  name: 'Progressive Relaxation', icon: <Brain size={20} />, description: 'Tense and release each muscle group from feet to face.',                    color: 'purple' },
]

// Box breathing phases
const BOX_PHASES = [
  { label: 'Inhale',   duration: 4 },
  { label: 'Hold',     duration: 4 },
  { label: 'Exhale',   duration: 4 },
  { label: 'Hold',     duration: 4 },
]

const PHASES_478 = [
  { label: 'Inhale',   duration: 4 },
  { label: 'Hold',     duration: 7 },
  { label: 'Exhale',   duration: 8 },
]

const GROUNDING_STEPS = [
  { n: 5, sense: 'things you can SEE',  sub: 'Look around. Name them one by one.' },
  { n: 4, sense: 'things you can FEEL', sub: 'What is touching your body right now?' },
  { n: 3, sense: 'things you can HEAR', sub: 'Listen closely. Name the sounds.' },
  { n: 2, sense: 'things you can SMELL', sub: 'Notice any scents — even faint ones.' },
  { n: 1, sense: 'thing you can TASTE',  sub: 'What is in your mouth right now?' },
]

const PROGRESSIVE_STEPS = [
  'Feet & calves — tense for 5 seconds, then release.',
  'Thighs — tense for 5 seconds, then release.',
  'Stomach — tense for 5 seconds, then release.',
  'Hands & forearms — make fists, hold 5 seconds, release.',
  'Shoulders — shrug up to ears, hold 5 seconds, release.',
  'Face — scrunch everything, hold 5 seconds, release.',
  'Take 3 slow deep breaths. You are done.',
]

function BreathingTimer({ phases }: { phases: typeof BOX_PHASES }) {
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState(0)
  const [seconds, setSeconds] = useState(phases[0].duration)
  const [cycles, setCycles] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const reset = () => {
    if (timer.current) clearInterval(timer.current)
    setRunning(false); setPhase(0); setSeconds(phases[0].duration); setCycles(0)
  }

  useEffect(() => {
    if (!running) { if (timer.current) clearInterval(timer.current); return }
    timer.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          setPhase(p => {
            const next = (p + 1) % phases.length
            if (next === 0) setCycles(c => c + 1)
            setSeconds(phases[next].duration)
            return next
          })
          return phases[(phase + 1) % phases.length].duration
        }
        return s - 1
      })
    }, 1000)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [running, phase, phases])

  const cur = phases[phase]
  const progress = 1 - (seconds / cur.duration)
  const r = 54; const circ = 2 * Math.PI * r

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="relative w-36 h-36">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle cx="60" cy="60" r={r} fill="none" stroke="#0d9488" strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)}
            strokeLinecap="round" className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900">{seconds}</span>
          <span className="text-sm font-medium text-teal-600">{cur.label}</span>
        </div>
      </div>
      <p className="text-gray-500 text-sm">{cycles > 0 ? `${cycles} cycle${cycles > 1 ? 's' : ''} done` : 'Ready'}</p>
      <div className="flex gap-3">
        <button onClick={() => setRunning(r => !r)} className="btn-primary flex items-center gap-2 px-6">
          {running ? <><Pause size={16} /> Pause</> : <><Play size={16} /> {seconds === phases[0].duration && phase === 0 ? 'Start' : 'Resume'}</>}
        </button>
        <button onClick={reset} className="btn-secondary px-4"><RotateCcw size={14} /></button>
      </div>
    </div>
  )
}

function GroundingExercise() {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const cur = GROUNDING_STEPS[step]
  return (
    <div className="space-y-6 py-4">
      {done ? (
        <div className="text-center space-y-3">
          <div className="text-4xl">✨</div>
          <p className="text-lg font-semibold text-gray-800">Well done.</p>
          <p className="text-sm text-gray-500">You are here. You are safe. The present moment is solid.</p>
          <button onClick={() => { setStep(0); setDone(false) }} className="btn-secondary mt-2">Start again</button>
        </div>
      ) : (
        <>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl font-bold text-green-600 mx-auto mb-3">{cur.n}</div>
            <p className="text-lg font-semibold text-gray-900">{cur.sense}</p>
            <p className="text-sm text-gray-500 mt-1">{cur.sub}</p>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            {GROUNDING_STEPS.map((s, i) => (
              <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${i === step ? 'bg-green-500 text-white' : i < step ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>{s.n}</div>
            ))}
          </div>
          <button onClick={() => { if (step < GROUNDING_STEPS.length - 1) setStep(s => s + 1); else setDone(true) }}
            className="btn-primary w-full">
            {step < GROUNDING_STEPS.length - 1 ? 'Next →' : 'Finish'}
          </button>
        </>
      )}
    </div>
  )
}

function ProgressiveRelaxation() {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  return (
    <div className="space-y-5 py-4">
      {done ? (
        <div className="text-center space-y-3">
          <div className="text-4xl">🌿</div>
          <p className="text-lg font-semibold text-gray-800">Relaxation complete.</p>
          <p className="text-sm text-gray-500">Your muscles have released tension. Rest in this feeling for a moment.</p>
          <button onClick={() => { setStep(0); setDone(false) }} className="btn-secondary">Start again</button>
        </div>
      ) : (
        <>
          <div className="bg-purple-50 rounded-2xl p-6 text-center">
            <p className="text-sm text-purple-500 font-medium mb-2">Step {step + 1} of {PROGRESSIVE_STEPS.length}</p>
            <p className="text-base text-gray-800 leading-relaxed">{PROGRESSIVE_STEPS[step]}</p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="h-2 bg-purple-500 rounded-full transition-all" style={{ width: `${((step + 1) / PROGRESSIVE_STEPS.length) * 100}%` }} />
          </div>
          <button onClick={() => { if (step < PROGRESSIVE_STEPS.length - 1) setStep(s => s + 1); else setDone(true) }}
            className="btn-primary w-full">
            {step < PROGRESSIVE_STEPS.length - 1 ? 'Next →' : 'Finish'}
          </button>
        </>
      )}
    </div>
  )
}

export default function GuidedExercises() {
  const [active, setActive] = useState<ExType | null>(null)

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Guided Exercises</h1>
        <p className="text-sm text-gray-500 mt-1">Quick, evidence-based exercises for anxiety, stress, and grounding.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {EXERCISES.map(ex => (
          <button key={ex.id} onClick={() => setActive(active === ex.id ? null : ex.id)}
            className={`card text-left transition-all hover:shadow-md ${active === ex.id ? `border-${ex.color}-400 bg-${ex.color}-50` : ''}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${active === ex.id ? `bg-${ex.color}-100 text-${ex.color}-600` : 'bg-gray-100 text-gray-500'}`}>
              {ex.icon}
            </div>
            <p className="font-semibold text-gray-900 text-sm">{ex.name}</p>
            <p className="text-xs text-gray-400 mt-1 leading-snug">{ex.description}</p>
          </button>
        ))}
      </div>

      {active === 'box' && (
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-1">Box Breathing</h2>
          <p className="text-xs text-gray-400 mb-2">Inhale → Hold → Exhale → Hold, each for 4 seconds. Repeat 4+ times.</p>
          <BreathingTimer phases={BOX_PHASES} />
        </div>
      )}

      {active === '478' && (
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-1">4-7-8 Breathing</h2>
          <p className="text-xs text-gray-400 mb-2">Inhale 4s → Hold 7s → Exhale 8s. Especially effective before sleep.</p>
          <BreathingTimer phases={PHASES_478} />
        </div>
      )}

      {active === 'grounding' && (
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-1">5-4-3-2-1 Grounding</h2>
          <p className="text-xs text-gray-400 mb-2">Anchor yourself to the present moment using your five senses.</p>
          <GroundingExercise />
        </div>
      )}

      {active === 'progressive' && (
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-1">Progressive Muscle Relaxation</h2>
          <p className="text-xs text-gray-400 mb-2">Systematically tense and release each muscle group to release physical tension.</p>
          <ProgressiveRelaxation />
        </div>
      )}
    </div>
  )
}
