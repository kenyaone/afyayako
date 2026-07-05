import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'

interface LoginForm {
  username: string
  password: string
}

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname || '/dashboard'

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', data)
      setAuth(res.data.user, res.data.access, res.data.refresh)
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition">
            <span className="text-3xl">🌿</span>
            <span className="text-xl font-bold text-gray-900">Afya Yako</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to your account</p>
          <p className="text-sm text-primary-700 font-semibold mt-2">Siri Yako — Your secret is safe</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Username</label>
            <input
              {...register('username', { required: 'Username is required' })}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              placeholder="Enter your username"
              disabled={loading}
            />
            {errors.username && (
              <p className="text-red-600 text-xs mt-1.5">{errors.username.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
            <div className="relative">
              <input
                {...register('password', { required: 'Password is required' })}
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition pr-12"
                placeholder="Enter your password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 text-xs mt-1.5">{errors.password.message}</p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-primary-700" />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-primary-700 hover:text-primary-600 font-medium">
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-primary-700 hover:bg-primary-600 disabled:bg-primary-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Signing in...' : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
          </div>
        </div>

        {/* Sign Up Link */}
        <Link
          to="/signup"
          className="w-full px-6 py-3 border-2 border-primary-700 text-primary-700 hover:bg-primary-50 font-semibold rounded-lg transition-colors text-center"
        >
          Create Account Free
        </Link>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By signing in, you agree to our{' '}
          <Link to="/terms" className="text-primary-700 hover:underline">
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-primary-700 hover:underline">
            Privacy Policy
          </Link>
        </p>

        <p className="text-center text-xs text-primary-600 font-semibold mt-4">
          🌿 Afya Yako Siri Yako — Your health, your secret
        </p>
      </div>
    </div>
  )
}
