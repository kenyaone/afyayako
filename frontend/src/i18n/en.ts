const en = {
  // Nav
  dashboard: 'Dashboard',
  assessments: 'Assessments',
  findTherapist: 'Find Therapist',
  mySessions: 'My Sessions',
  moodTracker: 'Mood Tracker',
  sobriety: 'Sobriety',
  recoveryLibrary: 'Recovery Library',
  sessionHistory: 'Session History',
  supportGroups: 'Support Groups',
  profile: 'Profile',
  upgradePlan: 'Upgrade Plan',
  logout: 'Logout',
  availability: 'My Availability',
  myApplication: 'My Application',

  // Common buttons
  book: 'Book Session',
  bookAgain: 'Book Again',
  joinSession: 'Join Session',
  startSession: 'Start Session',
  save: 'Save',
  cancel: 'Cancel',
  submit: 'Submit',
  back: 'Back',
  loading: 'Loading…',
  viewAll: 'View All',
  joinGroup: 'Join Group',
  leaveGroup: 'Leave Group',
  sendMessage: 'Send',
  online: 'Online',
  offline: 'Offline',
  away: 'Away',

  // Dashboard
  welcomeBack: 'Welcome back',
  howAreYou: 'How are you doing today?',
  myTherapist: 'My Therapist',
  sessionsTogether: 'sessions together',
  noTherapistYet: 'No therapist yet',
  findFirst: 'Find your first therapist',
  pendingSurvey: 'You have a follow-up survey waiting',
  takeSurvey: 'Take Survey',

  // Professionals
  allKmpdc: 'All professionals are KMPDC-verified.',
  bookNowOnline: 'Book Now (Online)',
  yearsExp: 'yrs exp',
  reviews: 'reviews',

  // Status
  confirmed: 'Confirmed',
  pending: 'Awaiting Payment',
  inProgress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  live: 'Live',

  // Session history
  sessionHistoryTitle: 'Session History',
  noSessions: 'No sessions yet',
  sessionWith: 'Session with',
  notes: 'Therapist Notes',
  rating: 'Rating',
  leaveFeedback: 'Leave Feedback',
  feedbackSubmitted: 'Feedback Submitted',

  // Feedback form
  feedbackTitle: 'How was your session?',
  overallRating: 'Overall experience',
  communicationRating: 'Therapist communication',
  feltHeard: 'I felt heard and understood',
  feltSafe: 'I felt safe during the session',
  wouldRecommend: 'I would recommend this therapist',
  comments: 'Comments (optional)',
  submitFeedback: 'Submit Feedback',

  // Groups
  supportGroupsTitle: 'Peer Support Groups',
  joinedGroups: 'My Groups',
  members: 'members',
  sendMsg: 'Write a message…',
  anonymous: 'Anonymous',

  // Surveys
  followUpSurveyTitle: 'Follow-up Check-in',
  howAreYouFeeling: 'How are you feeling since your last session?',
  wellbeingScore: 'Wellbeing score (0 = very bad, 10 = excellent)',

  // Availability
  availabilityTitle: 'Set My Availability',
  weeklySchedule: 'Weekly Schedule',
  maxClients: 'Max clients per week',
  addSlot: 'Add Time Slot',
  saveAvailability: 'Save Availability',
  days: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],

  // Offline
  offlineBanner: "You're offline. Showing cached data.",
  backOnline: "You're back online.",

  // Crisis
  crisisHelp: 'You are not alone. Help is available:',
}
export default en
export type TranslationKey = keyof typeof en
