import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ClipboardList, Users, Calendar,
  Heart, TrendingUp, User, Leaf, ShieldCheck, Stethoscope,
  DollarSign, Tag, BookOpen, MessageCircle, History, Clock, BarChart2,
  Shield, Target, Pill, Wind, Gift, BookMarked, Award, FileText, Building2,
  HandHeart, CreditCard, AlertTriangle, Settings
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useT } from '../../contexts/I18nContext'

interface SidebarProps { onClose?: () => void }

export default function Sidebar({ onClose }: SidebarProps) {
  const user = useAuthStore(s => s.user)
  const { t } = useT()
  const isAdmin = user?.role === 'admin'
  const isProfessional = user?.role === 'professional'

  const userLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/assessments', icon: ClipboardList, label: t('assessments') },
    { to: '/professionals', icon: Users, label: t('findTherapist') },
    { to: '/consultations', icon: Calendar, label: t('mySessions') },
    { to: '/history', icon: History, label: t('sessionHistory') },
    { to: '/progress', icon: BarChart2, label: 'My Progress' },
    { to: '/mood', icon: Heart, label: t('moodTracker') },
    { to: '/sobriety', icon: TrendingUp, label: t('sobriety') },
    { to: '/safety-plan', icon: Shield, label: 'Safety Plan' },
    { to: '/goals', icon: Target, label: 'My Goals' },
    { to: '/medications', icon: Pill, label: 'Medications' },
    { to: '/groups', icon: MessageCircle, label: t('supportGroups') },
    { to: '/journal', icon: BookMarked, label: 'My Journal' },
    { to: '/my-compliance', icon: AlertTriangle, label: 'Report Issue' },
    { to: '/certificate', icon: Award, label: 'Certificate' },
    { to: '/referral', icon: Gift, label: 'Referral & Promo' },
    { to: '/peer-mentors', icon: HandHeart, label: 'Peer Mentors' },
    { to: '/my-claims', icon: CreditCard, label: 'Insurance Claims' },
    { to: '/profile', icon: User, label: t('profile') },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]

  const professionalLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/consultations', icon: Calendar, label: t('mySessions') },
    { to: '/caseload', icon: Users, label: 'My Patients' },
    { to: '/templates', icon: FileText, label: 'Note Templates' },
    { to: '/payouts', icon: DollarSign, label: 'Payouts' },
    { to: '/analytics', icon: BarChart2, label: 'Analytics' },
    { to: '/availability', icon: Clock, label: t('availability') },
    { to: '/profile', icon: User, label: t('profile') },
    { to: '/apply', icon: Stethoscope, label: t('myApplication') },
  ]

  const adminLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/admin', icon: ShieldCheck, label: 'Verify Professionals' },
    { to: '/admin/revenue', icon: DollarSign, label: 'Revenue' },
    { to: '/professionals', icon: Users, label: 'All Professionals' },
    { to: '/eap-dashboard', icon: Building2, label: 'EAP Dashboard' },
    { to: '/profile', icon: User, label: t('profile') },
  ]

  // Add Pricing link for regular users
  const userLinksWithPricing = [
    ...userLinks.slice(0, -1),
    { to: '/pricing', icon: Tag, label: t('upgradePlan') },
    userLinks[userLinks.length - 1],
  ]

  const links = isAdmin ? adminLinks : isProfessional ? professionalLinks : userLinksWithPricing

  return (
    <aside className="w-64 h-full flex flex-col" style={{ background: 'linear-gradient(180deg, #0a5e2a 0%, #0f4d48 60%, #0a3d38 100%)' }}>
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #22c55e, #14b8a6)' }}>
            <Leaf size={18} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-sm text-white leading-tight">Afya Yako Siri Yako</div>
            <div className="text-white/50 text-xs">Your Health, Your Secret</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                  isActive ? 'bg-teal-500 shadow-sm' : 'bg-white/10'
                }`}>
                  <Icon size={15} />
                </div>
                <span className="truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="text-xs text-white/40 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
          End-to-end encrypted
        </div>
      </div>
    </aside>
  )
}
