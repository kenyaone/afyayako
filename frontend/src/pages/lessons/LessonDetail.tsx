import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { marked } from 'marked'
import api from '../../api/axios'
import { ChevronLeft, CheckCircle, Clock, BookOpen, Loader2, Lock } from 'lucide-react'

interface Lesson {
  id: number
  title: string
  slug: string
  description: string
  content: string
  category: string
  level: string
  duration_minutes: number
  user_progress?: { completed: boolean; progress_pct: number; completed_at?: string }
}

export default function LessonDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [locked, setLocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [done, setDone] = useState(false)

  // Activate interactive blocks after content renders
  useEffect(() => {
    if (!lesson) return
    const container = document.getElementById('lesson-content')
    if (!container) return

    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement

      const btn = target.closest<HTMLButtonElement>('.ifb-btn')
      if (btn && !btn.disabled) {
        const block = btn.closest('.ifb-choice')!
        const isOk = btn.dataset.ok === '1'
        const feedback = btn.dataset.fb ?? ''
        block.querySelectorAll<HTMLButtonElement>('.ifb-btn').forEach(b => {
          b.disabled = true
          if (b === btn) b.classList.add(isOk ? 'chosen-ok' : 'chosen-ng')
        })
        const out = block.querySelector<HTMLElement>('.ifb-out')!
        out.textContent = (isOk ? '✅ ' : '⚠️ ') + feedback
        out.className = `ifb-out show ${isOk ? 'ok' : 'ng'}`
        return
      }

      const save = target.closest<HTMLButtonElement>('.ifb-save')
      if (save && !save.disabled) {
        const block = save.closest('.ifb-reflect')!
        const ta = block.querySelector<HTMLTextAreaElement>('.ifb-ta')!
        if (ta.value.trim()) {
          save.textContent = 'Saved ✓'
          save.disabled = true
          ta.readOnly = true
        }
      }
    }

    container.addEventListener('click', handleClick)
    return () => container.removeEventListener('click', handleClick)
  }, [lesson])

  useEffect(() => {
    api.get(`/lessons/${slug}`)
      .then(r => {
        const l = r.data.lesson ?? r.data
        setLesson(l)
        setDone(l.user_progress?.completed ?? false)
      })
      .catch(e => {
        if (e.response?.status === 403) {
          setLocked(true)
        } else {
          navigate('/lessons')
        }
      })
      .finally(() => setLoading(false))
  }, [slug])

  const handleComplete = async () => {
    if (!lesson) return
    setCompleting(true)
    try {
      await api.post(`/lessons/${lesson.id}/progress`, { progress_pct: 100, completed: true })
      setDone(true)
      setLesson(prev => prev ? { ...prev, user_progress: { completed: true, progress_pct: 100 } } : prev)
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 size={32} className="animate-spin text-primary-600" />
      </div>
    )
  }

  if (locked) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center card py-12">
        <Lock size={40} className="text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Lesson Locked</h2>
        <p className="text-gray-500 mb-6 text-sm">Book your first session to unlock the full recovery library.</p>
        <Link to="/professionals" className="btn-primary">Book a Session</Link>
      </div>
    )
  }

  if (!lesson) return null

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <button onClick={() => navigate('/lessons')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ChevronLeft size={16} /> Back to Library
      </button>

      {/* Header */}
      <div className="card">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-100' : 'bg-primary-50'}`}>
            {done ? <CheckCircle size={24} className="text-green-600" /> : <BookOpen size={24} className="text-primary-600" />}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{lesson.title}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              {lesson.category && <span>{lesson.category}</span>}
              {lesson.level && <span className="capitalize">{lesson.level}</span>}
              {lesson.duration_minutes && (
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {lesson.duration_minutes} min
                </span>
              )}
            </div>
          </div>
        </div>
        {lesson.description && (
          <p className="text-gray-600 text-sm leading-relaxed">{lesson.description}</p>
        )}
      </div>

      {/* Lesson content */}
      <div id="lesson-content" className="card prose prose-sm max-w-none text-gray-700 leading-relaxed">
        {lesson.content ? (
          <div dangerouslySetInnerHTML={{ __html: marked.parse(lesson.content, { breaks: true }) as string }} />
        ) : (
          <p className="text-gray-400 italic">No content yet.</p>
        )}
      </div>

      {/* Complete button */}
      {done ? (
        <div className="card bg-green-50 border-green-200 flex items-center gap-3 py-4">
          <CheckCircle size={22} className="text-green-600" />
          <div>
            <div className="font-semibold text-green-800">Lesson Complete</div>
            {lesson.user_progress?.completed_at && (
              <div className="text-xs text-green-600 mt-0.5">
                Completed {new Date(lesson.user_progress.completed_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={handleComplete}
          disabled={completing}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2"
        >
          {completing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
          {completing ? 'Marking complete…' : 'Mark as Complete'}
        </button>
      )}

      <Link to="/lessons" className="btn-secondary w-full text-center block">
        Back to Library
      </Link>
    </div>
  )
}
