import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { LogOut, Moon, Sun, Menu } from 'lucide-react'
import NotificationBell from '../NotificationBell'
import { useT } from '../../contexts/I18nContext'
import { useTheme } from '../../contexts/ThemeContext'

interface NavbarProps { onMenuClick: () => void }

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuthStore()
  const { lang, setLang, t } = useT()
  const { theme, toggle: toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white dark:bg-gray-900 dark:border-gray-700 border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-3">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="text-sm text-gray-500 truncate flex-1 min-w-0">
        {t('welcomeBack')}, <span className="font-medium text-gray-900 dark:text-white">{user?.display_name}</span>
      </div>
      <div className="flex items-center gap-3">
        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === 'en' ? 'sw' : 'en')}
          className="text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 rounded-lg px-2.5 py-1.5 transition-colors"
          title="Switch language / Badilisha lugha"
        >
          {lang === 'en' ? '🇰🇪 SW' : '🇬🇧 EN'}
        </button>
        {/* Dark mode toggle */}
        <button onClick={toggleTheme}
          className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <NotificationBell />
        <div className="w-8 h-8 rounded-full bg-primary-700 text-white flex items-center justify-center text-sm font-bold">
          {user?.display_name?.charAt(0).toUpperCase()}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  )
}
