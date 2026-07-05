import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'
import { Leaf, Mail, CheckCircle, Loader2 } from 'lucide-react'

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (data: { email: string }) => {
    setLoading(true); setError('')
    try {
      await api.post('/auth/forgot-password', data)
      setSent(true)
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Something went wrong.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-800 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-2xl mb-4">
            <Leaf size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Forgot password?</h1>
          <p className="text-primary-200 mt-1 text-sm">Enter your email and we'll send a reset link.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {sent ? (
            <div className="text-center space-y-3 py-4">
              <CheckCircle size={40} className="text-green-500 mx-auto" />
              <h2 className="font-bold text-gray-900">Check your email</h2>
              <p className="text-sm text-gray-500">
                If an account exists for that email, we've sent a password reset link. Check your inbox and spam folder.
              </p>
              <Link to="/login" className="block text-sm text-teal-600 hover:underline mt-4">Back to login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}
              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-3 text-gray-400" />
                  <input type="email" className="input-field pl-8"
                    placeholder="you@example.com"
                    {...register('email', { required: 'Email is required' })} />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                Send reset link
              </button>
              <p className="text-center text-sm text-gray-500">
                <Link to="/login" className="text-teal-600 hover:underline">Back to login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
