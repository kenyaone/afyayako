import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import {
  Video, Shield, ExternalLink, Star, FileText, Calendar,
  Download, Trash2, Share2, CheckCircle, Loader2, ClipboardList,
  AlertCircle, ChevronDown, ChevronUp, Clock, Sparkles,
  Mic, VideoOff, MicOff, Copy, PlayCircle, Wifi, WifiOff
} from 'lucide-react'

interface PresenceEntry {
  user_id: number
  display_name: string
  role: string
  is_typing: boolean
  last_seen_at: string
}

const PRESENCE_POLL_MS = 4_000

type SessionPhase = 'loading' | 'ready' | 'joined' | 'error'

interface SharedAssessment {
  assessment_type: string
  score: number
  severity: string
  interpretation: string
  is_crisis_flag: boolean
  created_at: string
}

interface SharedMood {
  mood_score: number
  note: string
  logged_at: string
}

interface SessionData {
  consultation: any
  jitsi_url: string
  room: string
  display_name: string
  is_professional: boolean
  shared_data: { assessments?: SharedAssessment[]; mood_logs?: SharedMood[] }
  session_info: { duration_minutes: number; scheduled_at: string; amount: number }
}

export default function JoinSession() {
  const { consultationId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const [session, setSession] = useState<SessionData | null>(null)
  const [phase, setPhase] = useState<SessionPhase>('loading')
  const [error, setError] = useState('')
  const [showPatientData, setShowPatientData] = useState(false)
  const [roomCopied, setRoomCopied] = useState(false)
  const [notesText, setNotesText] = useState('')
  const [notesSaved, setNotesSaved] = useState(false)
  const [rating, setRating] = useState(0)
  const [ratingSubmitted, setRatingSubmitted] = useState(false)
  const [notesRequested, setNotesRequested] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [soapNotes, setSoapNotes] = useState('')
  const [soapLoading, setSoapLoading] = useState(false)
  const [videoMode, setVideoMode] = useState<'video' | 'audio'>('video')
  const [cameraOff, setCameraOff] = useState(true)
  const [sessionPresence, setSessionPresence] = useState<PresenceEntry[]>([])
  const presenceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Poll session presence once the session is open in another tab
  useEffect(() => {
    if (phase !== 'joined' || !consultationId) return

    const poll = () => {
      api.get(`/presence/consultation/${consultationId}`)
        .then(r => setSessionPresence(r.data.present ?? []))
        .catch(() => {})
    }
    poll()
    presenceTimerRef.current = setInterval(poll, PRESENCE_POLL_MS)
    return () => { if (presenceTimerRef.current) clearInterval(presenceTimerRef.current) }
  }, [phase, consultationId])

  useEffect(() => {
    api.post(`/consultations/${consultationId}/join`)
      .then(r => {
        setSession(r.data)
        setPhase('ready')
        if (r.data.consultation?.professional_notes) {
          setNotesText(r.data.consultation.professional_notes)
        }
        // Auto-expand patient data for professionals
        if (r.data.is_professional) setShowPatientData(true)
      })
      .catch(e => {
        setError(e.response?.data?.error || 'Session not found or not ready.')
        setPhase('error')
      })
  }, [consultationId])

  const buildJitsiUrl = useCallback((room: string) => {
    const name = encodeURIComponent(user?.display_name || 'User')
    const cfg = [
      'config.prejoinPageEnabled=false',
      'config.lobbyModeEnabled=false',
      'config.disableLobby=true',
      'config.startWithoutUserConsent=true',
      'config.disableDeepLinking=true',
      'config.disableInviteFunctions=true',
      'config.requireDisplayName=false',
      cameraOff ? 'config.startWithVideoMuted=true' : '',
      videoMode === 'audio' ? 'config.startAudioOnly=true' : '',
      `userInfo.displayName=${name}`,
    ].filter(Boolean).join('&')
    return `https://meet.ffmuc.net/${room}#${cfg}`
  }, [user, cameraOff, videoMode])

  const handleJoin = useCallback(() => {
    if (!session) return
    const url = buildJitsiUrl(session.room)
    window.open(url, 'jitsi-session', 'noopener,noreferrer')
    setPhase('joined')
  }, [session, buildJitsiUrl])

  const handleEndSession = async () => {
    if (!session) return
    setActionLoading('end')
    try {
      await api.post(`/consultations/${session.consultation.id}/end`, {
        notes: notesText || undefined,
      })
      navigate('/consultations')
    } catch {
      alert('Failed to end session. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSaveNotes = async () => {
    if (!session || !notesText.trim()) return
    setActionLoading('notes')
    try {
      await api.put(`/consultations/${session.consultation.id}/notes`, { notes: notesText })
      setNotesSaved(true)
    } finally {
      setActionLoading(null)
    }
  }

  const handleGenerateSoap = async () => {
    if (!session || !notesText.trim()) return
    setSoapLoading(true)
    try {
      const r = await api.post('/ai/soap-notes', {
        notes: notesText,
        consultation_id: session.consultation.id,
      })
      setSoapNotes(r.data.soap_notes || '')
    } catch {
      setSoapNotes('Failed to generate SOAP notes. Please try again.')
    } finally {
      setSoapLoading(false)
    }
  }

  const handleRateSession = async () => {
    if (!session || !rating) return
    setActionLoading('rate')
    try {
      await api.post(`/consultations/${session.consultation.id}/rate`, { rating })
      setRatingSubmitted(true)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRequestNotes = async () => {
    if (!session) return
    setActionLoading('req-notes')
    try {
      await api.post(`/consultations/${session.consultation.id}/notes-request`)
      setNotesRequested(true)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteRecording = async () => {
    if (!session || !confirm('Delete this recording permanently?')) return
    setActionLoading('del-rec')
    try {
      await api.delete(`/consultations/${session.consultation.id}/recording`)
      setSession(s => s ? { ...s, consultation: { ...s.consultation, recording_url: null } } : s)
    } finally {
      setActionLoading(null)
    }
  }

  const handleShareRecording = async () => {
    if (!session) return
    setActionLoading('share-rec')
    try {
      const r = await api.get(`/consultations/${session.consultation.id}/recording/share`)
      navigator.clipboard.writeText(r.data.share_url)
      alert('Recording link copied to clipboard!')
    } catch {
      alert('No recording URL available.')
    } finally {
      setActionLoading(null)
    }
  }

  if (phase === 'loading') {
    return (
      <div className="max-w-lg mx-auto card text-center py-14">
        <Loader2 size={40} className="text-primary-600 mx-auto mb-4 animate-spin" />
        <p className="text-gray-500">Preparing your session…</p>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="max-w-lg mx-auto card text-center py-10">
        <AlertCircle size={40} className="text-red-500 mx-auto mb-3" />
        <div className="text-red-600 font-medium mb-2">{error}</div>
        <p className="text-gray-500 text-sm mb-5">
          Sessions are only joinable when status is <strong>Confirmed</strong> or <strong>In Progress</strong>.
        </p>
        <button onClick={() => navigate('/consultations')} className="btn-secondary">Back to Sessions</button>
      </div>
    )
  }

  const { consultation, jitsi_url, room, is_professional, shared_data, session_info } = session!
  const isCompleted = consultation.status === 'completed'

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {is_professional ? 'Session with Patient' : `Session with ${consultation.professional?.user?.display_name || 'Therapist'}`}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {session_info.duration_minutes} min · KES {Number(session_info.amount).toLocaleString()}
        </p>
      </div>

      {/* Privacy notice */}
      <div className="flex items-start gap-3 bg-primary-50 border border-primary-200 rounded-xl p-4 text-sm text-primary-800">
        <Shield size={16} className="flex-shrink-0 mt-0.5" />
        <span>
          Encrypted Jitsi video — NOT routed through WhatsApp or Meta.
          You appear only as <strong>"{user?.display_name}"</strong> to your {is_professional ? 'patient' : 'therapist'}.
        </span>
      </div>

      {/* Pre-join checklist + Join/Start button (while not joined and not completed) */}
      {!isCompleted && phase === 'ready' && (
        <div className="card space-y-4">
          <div className={`rounded-xl p-5 text-center ${is_professional ? 'bg-blue-50' : 'bg-gray-50'}`}>
            {is_professional ? (
              <PlayCircle size={44} className="text-blue-600 mx-auto mb-3" />
            ) : (
              <Video size={44} className="text-primary-600 mx-auto mb-3" />
            )}
            <h2 className="font-semibold text-gray-900 mb-1">
              {is_professional ? 'Start the Session' : 'Video Session Ready'}
            </h2>
            <p className="text-sm text-gray-500 mb-1">
              Room: <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">{room}</code>
            </p>
            <p className="text-xs text-gray-400">Encrypted · meet.jit.si</p>

            {/* Professional: shareable room URL */}
            {is_professional && (
              <div className="mt-3 flex items-center gap-2 bg-white border border-blue-200 rounded-lg px-3 py-2 text-left">
                <span className="text-xs text-gray-500 flex-1 truncate font-mono">{jitsi_url}</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(jitsi_url); setRoomCopied(true); setTimeout(() => setRoomCopied(false), 2000) }}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 flex-shrink-0 font-medium"
                >
                  {roomCopied ? <CheckCircle size={12} className="text-green-500" /> : <Copy size={12} />}
                  {roomCopied ? 'Copied!' : 'Copy link'}
                </button>
              </div>
            )}
          </div>

          {is_professional && shared_data.assessments && shared_data.assessments.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <ClipboardList size={13} /> Patient Assessment Notes
              </div>
              <div className="space-y-2">
                {shared_data.assessments.map((a, i) => (
                  <div key={i} className={`rounded-lg p-3 text-sm border ${a.is_crisis_flag ? 'bg-red-50 border-red-300' : 'bg-white border-amber-200'}`}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-gray-900 uppercase text-xs">{a.assessment_type}</span>
                      <span className={`font-bold text-sm ${a.is_crisis_flag ? 'text-red-700' : 'text-gray-900'}`}>Score: {a.score}</span>
                    </div>
                    <span className="text-primary-700 font-medium text-xs">{a.severity}</span>
                    {a.is_crisis_flag && (
                      <span className="ml-2 text-red-600 text-xs font-bold flex items-center gap-1 inline-flex">
                        <AlertCircle size={11} /> Crisis flag
                      </span>
                    )}
                    <p className="text-gray-600 text-xs mt-1">{a.interpretation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600 space-y-1.5">
            <div className="font-medium text-gray-900 mb-2">
              {is_professional ? 'Before you start:' : 'Before you join:'}
            </div>
            {(is_professional
              ? ['Ensure you are in a private, confidential space', 'Review patient notes above before starting', 'Test your camera and microphone', 'Use headphones for better audio quality']
              : ['Find a quiet, private space', 'Test your camera and microphone', 'Ensure stable internet connection', 'Use headphones for better audio']
            ).map(tip => (
              <div key={tip} className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                <span>{tip}</span>
              </div>
            ))}
          </div>

          {/* Audio / Video choice */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">How do you want to join?</div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setVideoMode('video')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  videoMode === 'video' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Video size={22} className={videoMode === 'video' ? 'text-primary-700' : 'text-gray-500'} />
                <span className={`text-sm font-medium ${videoMode === 'video' ? 'text-primary-700' : 'text-gray-600'}`}>
                  Video & Audio
                </span>
              </button>
              <button
                onClick={() => { setVideoMode('audio'); setCameraOff(false) }}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  videoMode === 'audio' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Mic size={22} className={videoMode === 'audio' ? 'text-primary-700' : 'text-gray-500'} />
                <span className={`text-sm font-medium ${videoMode === 'audio' ? 'text-primary-700' : 'text-gray-600'}`}>
                  Audio Only
                </span>
              </button>
            </div>

            {videoMode === 'video' && (
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => setCameraOff(o => !o)}
                  className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${cameraOff ? 'bg-amber-500' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${cameraOff ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <span className="text-sm text-gray-700 flex items-center gap-1">
                  <VideoOff size={14} className="text-gray-500" />
                  Start with camera off
                </span>
              </label>
            )}
          </div>

          <button
            onClick={handleJoin}
            className={`w-full py-3 text-base flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors ${
              is_professional
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'btn-primary'
            }`}
          >
            {is_professional ? (
              <><PlayCircle size={20} /> Start Session <ExternalLink size={16} /></>
            ) : (
              <>{videoMode === 'audio' ? <Mic size={20} /> : <Video size={20} />}
              {videoMode === 'audio' ? 'Join Audio Session' : 'Join Video Session'}
              <ExternalLink size={16} /></>
            )}
          </button>
        </div>
      )}

      {/* Session active — video running in separate tab */}
      {!isCompleted && phase === 'joined' && (
        <div className="card bg-green-50 border border-green-200 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
            <div>
              <div className="font-semibold text-green-900">Video session is open</div>
              <div className="text-xs text-green-700">Your video call is running in a separate tab</div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => window.open(buildJitsiUrl(session!.room), 'jitsi-session', 'noopener,noreferrer')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Video size={14} /> Return to Video Call
            </button>
            {/* Presence indicator */}
            {(() => {
              const otherRole = is_professional ? 'user' : 'professional'
              const otherLabel = is_professional ? 'Patient' : 'Therapist'
              const others = sessionPresence.filter(p => p.role === otherRole)
              const otherPresent = others.length > 0
              return (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${otherPresent ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`} />
                  {otherPresent
                    ? <><span className="font-medium text-green-700">{others[0].display_name || otherLabel}</span> is in the session <Wifi size={11} className="ml-1 text-green-400" /></>
                    : <><span>Waiting for {otherLabel} to join…</span> <WifiOff size={11} className="ml-1 text-gray-300" /></>
                  }
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* Professional: patient shared data panel */}
      {is_professional && (shared_data.assessments?.length || shared_data.mood_logs?.length) && (
        <div className="card">
          <button
            className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 mb-1"
            onClick={() => setShowPatientData(p => !p)}
          >
            <span className="flex items-center gap-2">
              <ClipboardList size={16} className="text-primary-600" />
              Patient Shared Data
            </span>
            {showPatientData ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showPatientData && (
            <div className="mt-3 space-y-4">
              {shared_data.assessments && shared_data.assessments.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Recent Assessments</div>
                  <div className="space-y-2">
                    {shared_data.assessments.map((a, i) => (
                      <div key={i} className={`rounded-lg p-3 text-sm border ${a.is_crisis_flag ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900 uppercase">{a.assessment_type}</span>
                          <span className="font-bold text-gray-900">Score: {a.score}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-primary-700 font-medium">{a.severity}</span>
                          {a.is_crisis_flag && <span className="text-red-600 font-bold flex items-center gap-1"><AlertCircle size={12} /> Crisis flag</span>}
                        </div>
                        <p className="text-gray-600 text-xs mt-1">{a.interpretation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {shared_data.mood_logs && shared_data.mood_logs.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Recent Mood Logs</div>
                  <div className="flex gap-2 flex-wrap">
                    {shared_data.mood_logs.map((m, i) => (
                      <div key={i} className="bg-white border border-gray-200 rounded-lg p-2 text-xs text-center min-w-[70px]">
                        <div className="text-2xl font-bold text-primary-700">{m.mood_score}</div>
                        <div className="text-gray-400">/10</div>
                        {m.note && <div className="text-gray-500 mt-1 text-xs truncate max-w-[80px]">{m.note}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Professional: session notes */}
      {is_professional && (
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <FileText size={16} className="text-primary-600" /> Session Notes
          </h2>
          <textarea
            value={notesText}
            onChange={e => { setNotesText(e.target.value); setNotesSaved(false) }}
            className="input-field resize-none"
            rows={4}
            placeholder="Document observations, action items, follow-up plan…"
          />
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleSaveNotes}
              disabled={!notesText.trim() || actionLoading === 'notes'}
              className="btn-primary text-sm py-2"
            >
              {actionLoading === 'notes' ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null}
              {notesSaved ? '✓ Saved' : 'Save Notes'}
            </button>
            <button
              onClick={handleGenerateSoap}
              disabled={!notesText.trim() || soapLoading}
              className="btn-secondary text-sm py-2 flex items-center gap-2"
              title="Generate structured SOAP notes using AI"
            >
              {soapLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {soapLoading ? 'Generating…' : 'AI SOAP Notes'}
            </button>
          </div>

          {soapNotes && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-800 mb-3">
                <Sparkles size={14} /> Structured SOAP Notes
              </div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed font-mono">
                {soapNotes}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(soapNotes)
                }}
                className="mt-3 text-xs text-blue-600 hover:underline"
              >
                Copy to clipboard
              </button>
            </div>
          )}
        </div>
      )}

      {/* Professional: end session */}
      {is_professional && !isCompleted && phase === 'joined' && (
        <div className="card bg-amber-50 border border-amber-200">
          <h2 className="font-semibold text-amber-900 mb-2">End Session</h2>
          <p className="text-amber-700 text-sm mb-3">
            Mark the session as complete. Save notes above first.
          </p>
          <button
            onClick={handleEndSession}
            disabled={actionLoading === 'end'}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            {actionLoading === 'end' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            End & Complete Session
          </button>
        </div>
      )}

      {/* Patient: post-session actions */}
      {!is_professional && phase === 'joined' && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">After Your Session</h2>

          {/* Rate */}
          {!ratingSubmitted && !consultation.user_rating ? (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Rate your session</div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setRating(n)}
                      className={`text-2xl transition-colors ${n <= rating ? 'text-amber-400' : 'text-gray-300'}`}
                    >★</button>
                  ))}
                </div>
                <button
                  onClick={handleRateSession}
                  disabled={!rating || actionLoading === 'rate'}
                  className="btn-primary text-sm py-1.5 px-4 disabled:opacity-50"
                >
                  {actionLoading === 'rate' ? <Loader2 size={13} className="animate-spin inline" /> : 'Submit Rating'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <Star size={14} fill="currentColor" /> Session rated
            </div>
          )}

          {/* Request notes */}
          <div>
            <button
              onClick={handleRequestNotes}
              disabled={notesRequested || actionLoading === 'req-notes'}
              className="btn-secondary text-sm py-2 flex items-center gap-2"
            >
              {actionLoading === 'req-notes' ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
              {notesRequested ? '✓ Notes Requested' : 'Request Session Notes'}
            </button>
            {notesRequested && (
              <p className="text-xs text-gray-400 mt-1">Your therapist will share notes within 24–48 hours.</p>
            )}
          </div>

          {/* Book follow-up */}
          <div>
            <Link
              to={`/book/${consultation.professional_id}`}
              state={{ is_follow_up: true, parent_id: consultation.id }}
              className="btn-secondary text-sm py-2 flex items-center gap-2 w-fit"
            >
              <Calendar size={14} />
              Book a Follow-up Session
            </Link>
          </div>
        </div>
      )}

      {/* Recording management — shown if recording exists */}
      {consultation.recording_url && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Video size={16} className="text-primary-600" /> Session Recording
          </h2>
          <div className="flex flex-wrap gap-2">
            <a
              href={consultation.recording_url}
              download
              className="btn-secondary text-sm py-2 flex items-center gap-2"
            >
              <Download size={14} /> Download
            </a>
            <button
              onClick={handleShareRecording}
              disabled={actionLoading === 'share-rec'}
              className="btn-secondary text-sm py-2 flex items-center gap-2"
            >
              <Share2 size={14} /> Copy Share Link
            </button>
            <button
              onClick={handleDeleteRecording}
              disabled={actionLoading === 'del-rec'}
              className="text-red-600 border border-red-200 hover:bg-red-50 text-sm py-2 px-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Trash2 size={14} /> Delete Recording
            </button>
          </div>
        </div>
      )}

      {/* Back link */}
      <div className="pb-6">
        <button onClick={() => navigate('/consultations')} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <Clock size={14} /> View all sessions
        </button>
      </div>

    </div>
  )
}
