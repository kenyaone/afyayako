import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import { Eye, EyeOff, ShieldCheck, Lock, ArrowRight, KeyRound } from 'lucide-react'

interface FormData {
  current_password: string
  new_password: string
  confirm: string
}

export default function ChangePassword() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, updateUser, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const firstLogin = (location.state as any)?.firstLogin ?? user?.must_change_password ?? false

  useEffect(() => {
    if (!user) navigate('/login', { replace: true })
  }, [user, navigate])

  const newPw = watch('new_password')

  const onSubmit = async (data: FormData) => {
    if (data.new_password !== data.confirm) {
      setError('New passwords do not match.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/change-password', {
        current_password: data.current_password,
        new_password: data.new_password,
      })
      if (res.data.user) updateUser(res.data.user)
      const dest = user?.role === 'corporate' ? '/eap-manage' : '/dashboard'
      navigate(dest, { replace: true })
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Failed to change password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const strength = (() => {
    if (!newPw) return { label: '', color: '', score: 0 }
    let score = 0
    if (newPw.length >= 8) score++
    if (newPw.length >= 12) score++
    if (/[A-Z]/.test(newPw)) score++
    if (/[0-9]/.test(newPw)) score++
    if (/[^A-Za-z0-9]/.test(newPw)) score++
    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', score }
    if (score <= 3) return { label: 'Fair', color: 'bg-yellow-500', score }
    if (score <= 4) return { label: 'Good', color: 'bg-lime-500', score }
    return { label: 'Strong', color: 'bg-emerald-600', score }
  })()

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-violet-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-violet-600 text-white mb-4 shadow-lg">
            <KeyRound size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {firstLogin ? 'Set your permanent password' : 'Change your password'}
          </h1>
          <p className="text-sm text-gray-600">
            {firstLogin
              ? 'Your temporary password was sent by email. Choose a new one to secure your account.'
              : 'Update the password on your account.'}
          </p>
        </div>

        {firstLogin && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <ShieldCheck size={20} className="text-amber-700 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900 leading-relaxed">
              For your security, you must change your temporary password before using the platform.
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {firstLogin ? 'Temporary password (from email)' : 'Current password'}
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                {...register('current_password', { required: 'Required' })}
                type={showCurrent ? 'text' : 'password'}
                className="w-full pl-10 pr-11 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Paste your temporary password"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.current_password && (
              <p className="text-red-600 text-xs mt-1.5">{errors.current_password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">New password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                {...register('new_password', {
                  required: 'Required',
                  minLength: { value: 8, message: 'At least 8 characters' },
                })}
                type={showNew ? 'text' : 'password'}
                className="w-full pl-10 pr-11 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="At least 8 characters"
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.new_password && (
              <p className="text-red-600 text-xs mt-1.5">{errors.new_password.message}</p>
            )}

            {newPw && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                  <div className={`h-full ${strength.color} transition-all`} style={{ width: `${(strength.score / 5) * 100}%` }} />
                </div>
                <span className="text-xs font-medium text-gray-600 min-w-[42px] text-right">{strength.label}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm new password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                {...register('confirm', { required: 'Required' })}
                type={showNew ? 'text' : 'password'}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Type it again"
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
            {errors.confirm && (
              <p className="text-red-600 text-xs mt-1.5">{errors.confirm.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-teal-600 to-violet-600 hover:from-teal-500 hover:to-violet-500 disabled:opacity-60 transition"
          >
            {loading ? 'Saving…' : (
              <>
                {firstLogin ? 'Save & continue' : 'Change password'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {firstLogin && (
          <button
            type="button"
            onClick={() => { logout(); navigate('/login', { replace: true }) }}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-4"
          >
            Sign out and start over
          </button>
        )}
      </div>
    </div>
  )
}
