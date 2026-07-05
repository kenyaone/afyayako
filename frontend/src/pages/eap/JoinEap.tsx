import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import { Eye, EyeOff, CheckCircle2, AlertCircle, Lock } from 'lucide-react'

interface JoinForm {
  username: string
  display_name: string
  password: string
  password_confirm: string
  date_of_birth: string
  consent: boolean
}

export default function JoinEap() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<JoinForm>()

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [companyName, setCompanyName] = useState('')

  const password = watch('password')

  useEffect(() => {
    // In a real app, we could validate the token first
    // For now, we'll let the backend handle it
  }, [token])

  const onSubmit = async (data: JoinForm) => {
    if (!token) {
      setError('Invalid invite link')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await api.post(`/eap/join/${token}`, {
        username: data.username,
        display_name: data.display_name,
        password: data.password,
        password_confirm: data.password_confirm,
        date_of_birth: data.date_of_birth,
      })

      setCompanyName(res.data.company.name)
      setAuth(res.data.user, res.data.access, res.data.refresh)
      setSuccess(true)

      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 3000)
    } catch (err: any) {
      const errs = err.response?.data
      const messages = []
      if (errs?.username) messages.push(errs.username[0] || errs.username)
      if (errs?.password) messages.push(errs.password[0] || errs.password)
      if (errs?.display_name) messages.push(errs.display_name[0] || errs.display_name)
      if (errs?.date_of_birth) messages.push(errs.date_of_birth[0] || errs.date_of_birth)
      if (errs?.error) messages.push(errs.error)
      if (errs?.message) messages.push(errs.message)
      setError(messages.length > 0 ? messages.join(' ') : 'Failed to join EAP. Invalid or expired link.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to {companyName}!</h2>
          <p className="text-gray-600 mb-8">
            Your account has been created. You now have access to confidential mental health support through the Employee Assistance Program.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-900 font-semibold text-sm mb-2">🔒 Your Privacy is Protected</p>
            <ul className="text-blue-800 text-xs space-y-1 text-left">
              <li>✓ Your counseling is completely confidential</li>
              <li>✓ HR will never know you used the EAP</li>
              <li>✓ Your sessions are never shared with your employer</li>
              <li>✓ You maintain complete anonymity</li>
            </ul>
          </div>

          <p className="text-gray-600 text-sm">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
            <Lock size={24} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Your EAP</h1>
          <p className="text-gray-600">
            Create your confidential account to access mental health support through your organization's Employee Assistance Program
          </p>
        </div>

        {/* Privacy Guarantee */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-900 font-semibold text-sm mb-2">🔒 Complete Confidentiality Guaranteed</p>
          <p className="text-green-700 text-xs leading-relaxed mb-3">
            Your use of this program is completely private. HR and your employer will never know you accessed counseling services. All information is confidential.
          </p>
          <ul className="text-green-800 text-xs space-y-1">
            <li>✓ Anonymous account — no personal identifiers linked</li>
            <li>✓ Your sessions are private between you and your therapist</li>
            <li>✓ No usage reports to your employer</li>
            <li>✓ Your privacy is protected by law</li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm flex gap-2">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Username</label>
            <input
              {...register('username', {
                required: 'Username is required',
                minLength: { value: 5, message: 'At least 5 characters' }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="anonymous_patient"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Private username - only you know this</p>
            {errors.username && <p className="text-red-600 text-xs mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Display Name</label>
            <input
              {...register('display_name', { required: 'Display name is required' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Patient A, Anonymous, etc. (can be fake)"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Shown to your therapist - can be any name you choose</p>
            {errors.display_name && <p className="text-red-600 text-xs mt-1">{errors.display_name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Date of Birth</label>
            <input
              {...register('date_of_birth', { required: 'Date of birth is required' })}
              type="date"
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Required to verify your age</p>
            {errors.date_of_birth && <p className="text-red-600 text-xs mt-1">{errors.date_of_birth.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
            <div className="relative">
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'At least 8 characters' }
                })}
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm Password</label>
            <input
              {...register('password_confirm', {
                required: 'Please confirm password',
                validate: (val) => val === password || 'Passwords do not match'
              })}
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••••••"
              disabled={loading}
            />
            {errors.password_confirm && <p className="text-red-600 text-xs mt-1">{errors.password_confirm.message}</p>}
          </div>

          <label className="flex items-start gap-3 cursor-pointer p-3 border-2 border-gray-200 rounded-lg hover:border-green-500 transition">
            <input
              {...register('consent', { required: 'You must accept to continue' })}
              type="checkbox"
              className="mt-1 w-5 h-5 accent-green-600 flex-shrink-0"
              disabled={loading}
            />
            <span className="text-sm text-gray-700">
              I understand and accept the Terms of Service and confirm that I understand my counseling sessions are confidential and private
            </span>
          </label>
          {errors.consent && <p className="text-red-600 text-xs mt-1 ml-8">{errors.consent.message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Confidential Account'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          By joining, you agree to our Terms of Service and Privacy Policy. Your information is protected and confidential.
        </p>
      </div>
    </div>
  )
}
