export interface User {
  id: number
  username: string
  display_name: string
  email?: string
  phone?: string
  role: 'user' | 'professional' | 'admin'
  is_anonymous_mode: boolean
  avatar?: string
  created_at: string
}

export interface Professional {
  id: number
  user: User
  display_name: string
  kmpdc_license: string
  verification_status: 'pending' | 'verified' | 'rejected'
  specializations: Specialization[]
  languages: Language[]
  rate_per_hour: string
  bio: string
  years_experience: number
  gender: string
  rating: string
  total_sessions: number
  total_reviews: number
  is_available_online: boolean
  is_accepting_new_patients: boolean
  profile_photo?: string
  availability: Availability[]
}

export interface Specialization {
  id: number
  name: string
  slug: string
}

export interface Language {
  id: number
  name: string
}

export interface Availability {
  id: number
  day_of_week: number
  day_name: string
  start_time: string
  end_time: string
  is_active: boolean
}

export interface Assessment {
  id: number
  assessment_type: string
  assessment_type_display: string
  score: number
  severity: string
  interpretation: string
  recommendations: string
  responses: Record<string, number>
  is_crisis_flag: boolean
  created_at: string
}

export interface Consultation {
  id: number
  consultation_id: string
  user_display_name: string
  professional_id?: number
  professional: number | Professional
  professional_detail?: Professional
  scheduled_at: string
  duration_minutes: number
  status: string
  amount: string
  jitsi_room: string
  jitsi_url?: string
  share_assessments: boolean
  share_mood_logs: boolean
  recording_enabled: boolean
  recording_url?: string
  recording_kept?: boolean
  recording_deleted?: boolean
  notes_requested_at?: string
  is_follow_up?: boolean
  parent_consultation_id?: number
  professional_notes?: string
  user_rating?: number
  user_review?: string
  actual_start?: string
  actual_end?: string
  created_at: string
}

export interface MoodLog {
  id: number
  mood: string
  mood_score: number
  energy_level: number
  sleep_quality: number
  triggers: string
  coping_strategy: string
  notes: string
  logged_at: string
  created_at: string
}

export interface CravingLog {
  id: number
  substance: string
  intensity: number
  duration_minutes?: number
  trigger: string
  coping_strategy: string
  resisted: boolean
  notes: string
  logged_at: string
}

export interface SobrietyTracker {
  id: number
  substance: string
  start_date: string
  current_streak: number
  longest_streak: number
  total_relapses: number
  is_active: boolean
}
