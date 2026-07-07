/**
 * Local triage snapshot: a small 3-question intake taken before the patient
 * browses therapists. Persisted in localStorage so it survives the walk from
 * /pre-booking → /professionals → /book/:id, then attached to the booking POST.
 *
 * The snapshot is intentionally not sent anywhere until the patient actually
 * books — it isn't a diagnostic record and shouldn't leak from the browser
 * until the person chooses a therapist.
 */

const KEY = 'ayk.triage.v1'
const TTL_HOURS = 24

export type Urgency = 'this_week' | 'a_few_weeks' | 'crisis'

export interface Triage {
  concerns: string[]                     // free selection of what they're seeking help for
  urgency: Urgency                       // how soon they want to be seen
  phq9_q9: 0 | 1 | 2 | 3                 // PHQ-9 item 9 (self-harm frequency) — validated single-item screen
  created_at: string                     // ISO
  version: 1
}

export const CONCERN_OPTIONS = [
  'Depression',
  'Anxiety',
  'Burnout & stress',
  'Grief or loss',
  'Relationships or family',
  'Trauma or PTSD',
  'Sleep',
  'Alcohol, substance or behavioural',
  'Work / life direction',
  'Something else',
]

export function saveTriage(t: Omit<Triage, 'created_at' | 'version'>): Triage {
  const snapshot: Triage = { ...t, created_at: new Date().toISOString(), version: 1 }
  try {
    localStorage.setItem(KEY, JSON.stringify(snapshot))
  } catch { /* private mode — silently ignore */ }
  return snapshot
}

export function loadTriage(): Triage | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const t = JSON.parse(raw) as Triage
    // Auto-expire so a stale snapshot from last week doesn't misroute today's booking.
    const ageHours = (Date.now() - new Date(t.created_at).getTime()) / 3_600_000
    if (ageHours > TTL_HOURS) {
      localStorage.removeItem(KEY)
      return null
    }
    return t
  } catch {
    return null
  }
}

export function clearTriage(): void {
  try { localStorage.removeItem(KEY) } catch {}
}

/**
 * A snapshot flags as clinically urgent if either the patient self-reported
 * crisis urgency, or PHQ-9 Q9 (self-harm frequency) scored above the "several
 * days" threshold — the pragmatic single-item screen used in primary care.
 */
export function isCrisisFlagged(t: Triage | null): boolean {
  if (!t) return false
  return t.urgency === 'crisis' || t.phq9_q9 >= 2
}
