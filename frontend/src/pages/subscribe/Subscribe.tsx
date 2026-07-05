import { useNavigate } from 'react-router-dom'
import { Clock, Mail, CheckCircle } from 'lucide-react'

export default function Subscribe() {
  const navigate = useNavigate()

  return (
    <div className="max-w-md mx-auto mt-12 text-center space-y-6">
      <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto">
        <Clock size={32} className="text-teal-600" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Premium Plans — Coming Soon</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          We're setting up secure payment processing. Premium plans will be available shortly.
        </p>
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 text-left space-y-3">
        <p className="text-sm font-semibold text-teal-800">What's included in Premium:</p>
        {[
          'Unlimited clinical assessments',
          'Full recovery skills library',
          'Priority therapist matching',
          'Session history & progress reports',
          'AI wellness companion — unlimited',
        ].map(f => (
          <div key={f} className="flex items-center gap-2 text-sm text-teal-700">
            <CheckCircle size={14} className="text-teal-500 flex-shrink-0" /> {f}
          </div>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center justify-center gap-2 text-gray-700 font-medium mb-2">
          <Mail size={16} className="text-teal-600" />
          Get notified when it launches
        </div>
        <p className="text-sm text-gray-500">
          Email us at{' '}
          <a href="mailto:support@mhapke.com" className="text-teal-600 font-medium hover:underline">
            support@mhapke.com
          </a>{' '}
          and we'll notify you as soon as payments go live.
        </p>
      </div>

      <button onClick={() => navigate('/dashboard')} className="btn-secondary w-full">
        Back to Dashboard
      </button>
    </div>
  )
}
