import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'
import { Leaf, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react'

interface ResetForm { password: string; confirm: string }

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''
  const email = params.get('email') ?? ''

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetForm>()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)

  const onSubmit = async (data: ResetForm) => {
    setLoading(true); setError('')
    try {
      await api.post('/auth/reset-password', { email, token, password: data.password })
      setDone(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Reset failed. The link may have expired.')
    } finally { setLoading(false) }
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 font-medium">Invalid reset link.</p>
          <Link to="/forgot-password" className="text-teal-600 hover:underline text-sm mt-2 block">Request a new one</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-800 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-2xl mb-4">
            <Leaf size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Set new password</h1>
          <p className="text-primary-200 mt-1 text-sm">Choose a strong password for your account.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {done ? (
            <div className="text-center space-y-3 py-4">
              <CheckCircle size={40} className="text-green-500 mx-auto" />
              <h2 className="font-bold text-gray-900">Password reset!</h2>
              <p className="text-sm text-gray-500">Your password has been updated. Redirecting to login…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}
              <div>
                <label className="label">New password</label>
                <div className="relative">
                  <input type={show ? 'text' : 'password'} className="input-field pr-10"
                    placeholder="Minimum 6 characters"
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })} />
                  <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-2.5 text-gray-400">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="label">Confirm password</label>
                <input type={show ? 'text' : 'password'} className="input-field"
                  placeholder="Repeat new password"
                  {...register('confirm', {
                    required: 'Please confirm your password',
                    validate: v => v === watch('password') || 'Passwords do not match',
                  })} />
                {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                Reset Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
