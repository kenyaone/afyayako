import { useLanguage } from '../../hooks/useLanguage'
import { Globe, Bell, Lock, HelpCircle, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function Settings() {
  const { language, setLanguage, t } = useLanguage()
  const navigate = useNavigate()
  const logout = useAuthStore(s => s.logout)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Language Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Globe size={24} className="text-primary-600" />
          <div>
            <h2 className="font-bold text-gray-900">{t('language')}</h2>
            <p className="text-sm text-gray-500">Choose your preferred language</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="radio"
              name="language"
              value="en"
              checked={language === 'en'}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'sw')}
              className="w-4 h-4"
            />
            <div>
              <p className="font-medium text-gray-900">🇬🇧 English</p>
              <p className="text-sm text-gray-500">Use English interface</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="radio"
              name="language"
              value="sw"
              checked={language === 'sw'}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'sw')}
              className="w-4 h-4"
            />
            <div>
              <p className="font-medium text-gray-900">🇰🇪 Kiswahili</p>
              <p className="text-sm text-gray-500">Tumia kiolesura cha Kiswahili</p>
            </div>
          </label>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            ✓ Language preference saved automatically
          </p>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell size={24} className="text-primary-600" />
          <div>
            <h2 className="font-bold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-500">Manage notification preferences</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <div>
              <p className="font-medium text-gray-900">Session reminders</p>
              <p className="text-sm text-gray-500">Get notified before scheduled sessions</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <div>
              <p className="font-medium text-gray-900">Assessment reminders</p>
              <p className="text-sm text-gray-500">Get notified about pending assessments</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <div>
              <p className="font-medium text-gray-900">New resources</p>
              <p className="text-sm text-gray-500">Updates about new lessons and resources</p>
            </div>
          </label>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lock size={24} className="text-primary-600" />
          <div>
            <h2 className="font-bold text-gray-900">Privacy & Security</h2>
            <p className="text-sm text-gray-500">Manage your account security</p>
          </div>
        </div>

        <div className="space-y-3">
          <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <p className="font-medium text-gray-900">Change password</p>
            <p className="text-sm text-gray-500">Update your account password</p>
          </button>

          <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <p className="font-medium text-gray-900">Download my data</p>
            <p className="text-sm text-gray-500">Export your personal health data</p>
          </button>

          <button className="w-full px-4 py-3 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-left">
            <p className="font-medium text-red-900">Delete account</p>
            <p className="text-sm text-red-500">Permanently delete your account</p>
          </button>
        </div>
      </div>

      {/* Help & Support */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle size={24} className="text-primary-600" />
          <div>
            <h2 className="font-bold text-gray-900">Help & Support</h2>
            <p className="text-sm text-gray-500">Get help and contact support</p>
          </div>
        </div>

        <div className="space-y-3">
          <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <p className="font-medium text-gray-900">FAQ</p>
            <p className="text-sm text-gray-500">Frequently asked questions</p>
          </button>

          <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <p className="font-medium text-gray-900">Contact support</p>
            <p className="text-sm text-gray-500">Chat with our support team</p>
          </button>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-6 py-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
      >
        <LogOut size={20} className="text-red-600" />
        <span className="font-medium text-red-900">Logout</span>
      </button>

      <div className="text-center text-sm text-gray-500 py-4">
        <p>Version 1.0.0 | MOH Compliant</p>
      </div>
    </div>
  )
}
