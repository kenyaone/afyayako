import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { ChevronRight, CheckCircle, Loader2, Lock, Calendar, ArrowLeft, Zap, Award, TrendingUp, Heart } from 'lucide-react'

interface Lesson {
  id: number
  title: string
  slug: string
  summary?: string
  category: string
  level: string
  duration_minutes: number
  thumbnail_emoji?: string
  user_progress?: { completed: boolean; progress_pct: number }
}

const CATEGORIES = [
  {
    key: 'stress',
    label: 'Stress Management',
    emoji: '🧠',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    description: 'Learn evidence-based techniques to manage daily stress and find calm',
    benefits: ['Reduce anxiety', 'Better sleep', 'Clear thinking'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    key: 'gambling',
    label: 'Gambling Recovery',
    emoji: '🎯',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-900',
    description: 'Overcome gambling urges with proven strategies and support',
    benefits: ['Break the cycle', 'Financial recovery', 'Rebuild trust'],
    color: 'from-purple-500 to-pink-500'
  },
  {
    key: 'substance',
    label: 'Addiction Recovery',
    emoji: '🌱',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-900',
    description: 'Build lasting recovery from alcohol and drug dependence',
    benefits: ['Stay sober', 'Restore health', 'Reclaim life'],
    color: 'from-teal-500 to-emerald-500'
  },
]

function cleanTitle(title: string) {
  return title
    .replace(/^Scenario:\s*/i, '')
    .replace(/^Branching in Practice:\s*/i, '')
    .replace(/^Branching After a Relapse:\s*/i, 'After a Relapse: ')
}

export default function RecoveryLibrary() {
  const [lessons, setLessons]   = useState<Lesson[]>([])
  const [loading, setLoading]   = useState(true)
  const [locked, setLocked]     = useState(false)
  const [activeCat, setActiveCat] = useState<string | null>(null)

  useEffect(() => {
    api.get('/lessons')
      .then(r => {
        const raw = r.data.data ?? r.data.results ?? r.data
        setLessons(Array.isArray(raw) ? raw : [])
      })
      .catch(e => {
        if (e.response?.status === 403) setLocked(true)
        setLessons([])
      })
      .finally(() => setLoading(false))
  }, [])

  const activeCfg = CATEGORIES.find(c => c.key === activeCat)
  const catLessons = activeCat ? lessons.filter(l => l.category === activeCat) : []

  const totalLessons = lessons.length
  const completedLessons = lessons.filter(l => l.user_progress?.completed).length
  const completionPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <div className="max-w-4xl space-y-6">

      {/* Header with Progress */}
      <div>
        {activeCat && (
          <button onClick={() => setActiveCat(null)} className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-4">
            <ArrowLeft size={18} /> Back
          </button>
        )}
        <h1 className="text-3xl font-black text-gray-900 mb-1">
          {activeCfg ? `${activeCfg.emoji} ${activeCfg.label}` : '🌟 Recovery Library'}
        </h1>
        {!activeCat && (
          <>
            <p className="text-gray-600 mb-4">Your journey to lasting recovery, one lesson at a time</p>
            {!loading && !locked && totalLessons > 0 && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-4 border border-primary-100">
                <TrendingUp size={20} className="text-primary-600" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{completedLessons} of {totalLessons} lessons completed</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary-500 to-blue-500 h-full transition-all" style={{ width: `${completionPct}%` }} />
                  </div>
                </div>
                <span className="text-lg font-bold text-primary-600">{completionPct}%</span>
              </div>
            )}
          </>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 size={32} className="animate-spin text-primary-500" />
          <p className="text-gray-500">Loading your recovery resources...</p>
        </div>
      ) : locked ? (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-8 text-center">
          <Lock size={48} className="text-amber-500 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-amber-900 mb-2">Unlock Your Recovery Journey</h2>
          <p className="text-amber-700 mb-6 max-w-md mx-auto">
            Connect with a verified therapist to unlock personalized lessons tailored to your recovery path
          </p>
          <Link to="/professionals" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all">
            <Calendar size={18} /> Book Your First Session
          </Link>
          <p className="text-xs text-amber-600 mt-4">First session, full access to this library</p>
        </div>
      ) : !activeCat ? (

        /* ── Inspiring Category Grid ── */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CATEGORIES.filter(c => lessons.some(l => l.category === c.key)).map(cat => {
            const total = lessons.filter(l => l.category === cat.key).length
            const done  = lessons.filter(l => l.category === cat.key && l.user_progress?.completed).length
            const catPct = total > 0 ? Math.round((done / total) * 100) : 0
            return (
              <button key={cat.key} onClick={() => setActiveCat(cat.key)}
                className={`${cat.bg} ${cat.border} border-2 rounded-2xl p-6 text-left hover:shadow-lg transition-all group hover:border-opacity-100 border-opacity-60`}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-4xl">{cat.emoji}</span>
                  {done > 0 && <Award size={18} className="text-amber-500" />}
                </div>
                <p className={`font-bold text-lg ${cat.text} mb-1`}>{cat.label}</p>
                <p className="text-sm text-gray-600 mb-4">{cat.description}</p>
                <div className="space-y-2 mb-4">
                  {cat.benefits.map(b => (
                    <div key={b} className="flex items-center gap-2 text-xs text-gray-700">
                      <Zap size={12} className="text-amber-500 flex-shrink-0" />
                      {b}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-xs font-semibold text-gray-600">{done}/{total} completed</span>
                  <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div className={`bg-gradient-to-r ${cat.color} h-full transition-all`} style={{ width: `${catPct}%` }} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>

      ) : (

        /* ── Lesson list ── */
        <div>
          {activeCfg && (
            <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 mb-4 border border-gray-200">
              <p className="text-sm text-gray-700">{activeCfg.description}</p>
            </div>
          )}
          <div className="space-y-2">
            {catLessons.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Heart size={32} className="mx-auto mb-2 opacity-50" />
                <p>No lessons in this category yet</p>
              </div>
            ) : (
              catLessons.map((l, i) => <LessonCard key={l.id} lesson={l} index={i + 1} />)
            )}
          </div>
        </div>

      )}
    </div>
  )
}

function LessonCard({ lesson, index }: { lesson: Lesson; index: number }) {
  const done = lesson.user_progress?.completed
  const levelColor = lesson.level === 'beginner' ? 'green' : lesson.level === 'intermediate' ? 'yellow' : 'orange'
  const levelLabel = lesson.level === 'beginner' ? '✓ Beginner' : lesson.level === 'intermediate' ? '⚡ Intermediate' : '🔥 Advanced'

  return (
    <Link to={`/lessons/${lesson.slug}`}
      className={`flex items-start gap-4 rounded-xl border-2 px-4 py-4 transition-all hover:shadow-md group ${
        done
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
          : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-gray-50'
      }`}>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 text-lg font-bold ${
        done ? 'bg-green-200 text-green-700' : 'bg-primary-100 text-primary-700'
      }`}>
        {done
          ? <CheckCircle size={20} className="text-green-600" />
          : lesson.thumbnail_emoji
            ? <span className="leading-none">{lesson.thumbnail_emoji}</span>
            : <span>{index}</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm leading-snug mb-1 ${done ? 'text-green-800' : 'text-gray-900'}`}>
          {cleanTitle(lesson.title)}
        </p>
        {lesson.summary && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{lesson.summary}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            levelColor === 'green' ? 'bg-green-100 text-green-700' : levelColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'
          }`}>
            {levelLabel}
          </span>
          {lesson.duration_minutes && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              ⏱ {lesson.duration_minutes} min
            </span>
          )}
          {done && (
            <span className="text-xs font-bold text-green-600">✓ Completed</span>
          )}
        </div>
      </div>
      <ChevronRight size={18} className={`flex-shrink-0 transition-colors ${done ? 'text-green-400' : 'text-gray-300 group-hover:text-primary-400'}`} />
    </Link>
  )
}
