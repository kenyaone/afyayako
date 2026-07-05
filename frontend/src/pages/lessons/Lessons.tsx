import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { BookOpen, Lock, CheckCircle, ChevronRight, Loader2, Calendar } from 'lucide-react'

interface Lesson {
  id: number
  title: string
  slug: string
  description: string
  category: string
  level: string
  duration_minutes: number
  order: number
  user_progress?: { completed: boolean; progress_pct: number }
}

const CATEGORY_COLORS: Record<string, string> = {
  'Mental Health': 'bg-teal-50 text-teal-700 border-teal-200',
  'Addiction': 'bg-orange-50 text-orange-700 border-orange-200',
  'Gambling': 'bg-purple-50 text-purple-700 border-purple-200',
  'Coping Skills': 'bg-blue-50 text-blue-700 border-blue-200',
  'Refusal Skills': 'bg-amber-50 text-amber-700 border-amber-200',
  'Mindfulness': 'bg-green-50 text-green-700 border-green-200',
}

const LEVEL_BADGE: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
}

export default function Lessons() {
  const navigate = useNavigate()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [locked, setLocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = category ? `?category=${encodeURIComponent(category)}` : ''
    api.get(`/lessons${params}`)
      .then(r => {
        const raw = r.data.data ?? r.data.results ?? r.data
        setLessons(Array.isArray(raw) ? raw : [])
        setLocked(false)
      })
      .catch(e => {
        if (e.response?.status === 403 && e.response?.data?.error === 'lessons_locked') {
          setLocked(true)
        }
        setLessons([])
      })
      .finally(() => setLoading(false))
  }, [category])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 size={32} className="animate-spin text-primary-600" />
      </div>
    )
  }

  if (locked) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center">
        <div className="card py-12 px-8">
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <Lock size={40} className="text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Recovery Library Locked</h1>
          <p className="text-gray-500 mb-2 leading-relaxed">
            The lessons library — including <strong>refusal skills</strong>, branching coping techniques, and relapse prevention guides — is unlocked after your first paid session.
          </p>
          <p className="text-gray-400 text-sm mb-8">
            This keeps the content exclusive to committed members and funds the platform's clinical quality.
          </p>
          <div className="space-y-3">
            <Link to="/professionals" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              <Calendar size={16} /> Book Your First Session
            </Link>
            <Link to="/dashboard" className="btn-secondary w-full py-3 flex items-center justify-center gap-2">
              Back to Dashboard
            </Link>
          </div>
          <div className="mt-6 bg-gray-50 rounded-xl p-4 text-left">
            <div className="text-xs font-semibold text-gray-700 mb-2">What's inside the library:</div>
            {['Refusal Skills for Alcohol & Drugs', 'Branching Coping Techniques', 'Relapse Prevention Strategies', 'Mindfulness & Breathing Exercises', 'Grief & Loss Processing', 'Gambling Triggers & Guardrails'].map(item => (
              <div key={item} className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <BookOpen size={11} className="text-primary-400 flex-shrink-0" /> {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const categories = [...new Set(lessons.map(l => l.category).filter(Boolean))]
  const completedCount = lessons.filter(l => l.user_progress?.completed).length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recovery Library</h1>
          <p className="text-gray-500 text-sm mt-1">Skills and strategies to support your recovery journey.</p>
        </div>
        {completedCount > 0 && (
          <div className="text-right">
            <div className="text-lg font-bold text-primary-700">{completedCount}/{lessons.length}</div>
            <div className="text-xs text-gray-500">completed</div>
          </div>
        )}
      </div>

      {/* Category filter */}
      {categories.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCategory('')}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${!category ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${category === cat ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {lessons.length === 0 ? (
        <div className="card text-center py-10 text-gray-400">
          <BookOpen size={36} className="mx-auto mb-2 text-gray-300" />
          No lessons available yet.
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map(lesson => {
            const done = lesson.user_progress?.completed
            const pct = lesson.user_progress?.progress_pct ?? 0
            return (
              <Link
                key={lesson.id}
                to={`/lessons/${lesson.slug}`}
                className={`card flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group ${done ? 'border-l-4 border-l-green-400' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-100' : 'bg-primary-50'}`}>
                  {done ? (
                    <CheckCircle size={20} className="text-green-600" />
                  ) : (
                    <BookOpen size={20} className="text-primary-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">{lesson.title}</div>
                  {lesson.description && (
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{lesson.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {lesson.category && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[lesson.category] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {lesson.category}
                      </span>
                    )}
                    {lesson.level && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${LEVEL_BADGE[lesson.level] ?? 'bg-gray-100 text-gray-600'} capitalize`}>
                        {lesson.level}
                      </span>
                    )}
                    {lesson.duration_minutes ? (
                      <span className="text-xs text-gray-400">{lesson.duration_minutes} min</span>
                    ) : null}
                  </div>
                  {pct > 0 && !done && (
                    <div className="mt-2 h-1 bg-gray-100 rounded-full w-32">
                      <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-400 flex-shrink-0 transition-colors" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
