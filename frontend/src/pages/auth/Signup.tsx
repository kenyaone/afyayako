import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import { Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'

type UserType = 'individual' | 'therapist' | 'corporate' | null
type AccountType = 'individual' | 'couples' | 'teen' | null
type Step = 'usertype' | 'type' | 'info' | 'parent' | 'professional' | 'corporate' | 'confirm' | 'success'

interface FormData {
  // Common fields
  username: string
  display_name: string
  password: string
  password_confirm: string
  email: string
  date_of_birth: string
  phone?: string

  // User account fields
  account_type?: AccountType
  parent_name?: string
  parent_email?: string
  parent_consent?: boolean

  // Professional fields
  full_name?: string
  professional_type?: 'therapist' | 'counselor' | 'psychologist' | 'psychiatrist'
  kmpdc_license?: string
  cpb_license?: string
  specializations?: string[]
  languages?: string[]
  years_experience?: number
  bio?: string
  qualification?: string
  rate_per_hour?: string

  // Corporate fields
  company_name?: string
  contact_name?: string
  contact_phone?: string
  industry?: string
  employee_count?: string
  company_address?: string

  consent: boolean
}

export default function Signup() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<FormData>({
    defaultValues: { account_type: null }
  })

  // Public /signup is now for THERAPISTS ONLY.
  // Employees join via /eap/join/:token (anonymous).
  // Companies sign up via /corporate (no login required).
  // Individuals/couples cannot self-signup — this is a B2B EAP.
  const [userType, setUserType] = useState<UserType>('therapist')
  const [step, setStep] = useState<Step>('professional')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<FormData>>({})

  useEffect(() => {
    // Kept for backwards compat — location.state may still push role
    const state = location.state as any
    if (state?.role === 'professional') {
      setUserType('therapist')
      setStep('professional')
    }
  }, [location.state])

  const accountType = watch('account_type') || formData.account_type
  const password = watch('password') || formData.password

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type)
    if (type === 'individual') {
      setStep('type')
    } else if (type === 'therapist') {
      setStep('professional')
    } else if (type === 'corporate') {
      setStep('corporate')
    }
  }

  const handleTypeSelect = (type: AccountType) => {
    setFormData(prev => ({ ...prev, account_type: type }))
    setStep('info')
  }

  const handleInfoSubmit = async (data: FormData) => {
    setFormData(prev => ({ ...prev, ...data }))

    if (accountType === 'teen') {
      setStep('parent')
    } else {
      setStep('confirm')
    }
  }

  const handleProfessionalSubmit = (data: FormData) => {
    setFormData(prev => ({ ...prev, ...data }))
    setStep('confirm')
  }

  const handleCorporateSubmit = (data: FormData) => {
    setFormData(prev => ({ ...prev, ...data }))
    setStep('confirm')
  }

  const handleParentInfoSubmit = (data: FormData) => {
    setFormData(prev => ({ ...prev, ...data }))
    setStep('confirm')
  }

  const handleConfirmSubmit = async (data: FormData) => {
    const finalData = { ...formData, ...data }
    await submitForm(finalData)
  }

  const submitForm = async (data: Partial<FormData>) => {
    setLoading(true)
    setError('')
    try {
      if (userType === 'therapist') {
        // Create professional user account
        const submitData = {
          username: data.username,
          display_name: data.display_name || data.full_name,
          password: data.password,
          email: data.email,
          phone: data.phone,
          date_of_birth: data.date_of_birth,
          role: 'professional',
        }

        const res = await api.post('/auth/signup', submitData)
        setAuth(res.data.user, res.data.access, res.data.refresh)

        // Store professional details in localStorage for profile completion later
        localStorage.setItem('professionalSignupData', JSON.stringify({
          full_name: data.full_name,
          professional_type: data.professional_type,
          kmpdc_license: data.kmpdc_license,
          cpb_license: data.cpb_license,
          specializations: data.specializations || [],
          languages: data.languages || [],
          years_experience: data.years_experience,
          bio: data.bio,
          qualification: data.qualification,
          rate_per_hour: data.rate_per_hour,
        }))

        setStep('success')
        setTimeout(() => {
          navigate('/professional-dashboard', { replace: true })
        }, 2000)
      } else if (userType === 'corporate') {
        // Create corporate user account
        const submitData = {
          username: data.username,
          display_name: data.display_name || data.company_name,
          password: data.password,
          email: data.email,
          phone: data.contact_phone,
          date_of_birth: data.date_of_birth,
          role: 'user',
        }

        const res = await api.post('/auth/signup', submitData)
        setAuth(res.data.user, res.data.access, res.data.refresh)

        // Store company details in localStorage for profile completion later
        localStorage.setItem('corporateSignupData', JSON.stringify({
          company_name: data.company_name,
          contact_name: data.contact_name,
          contact_phone: data.contact_phone,
          industry: data.industry,
          employee_count: data.employee_count,
          company_address: data.company_address,
        }))

        setStep('success')
        setTimeout(() => {
          navigate('/corporate', { replace: true })
        }, 2000)
      } else {
        // Regular user signup
        const submitData = {
          username: data.username,
          display_name: data.display_name,
          password: data.password,
          email: data.email || undefined,
          date_of_birth: data.date_of_birth,
          role: 'user',
          account_type: data.account_type,
          parent_name: data.parent_name,
          parent_email: data.parent_email,
          consent: data.consent
        }

        const res = await api.post('/auth/signup', submitData)
        setAuth(res.data.user, res.data.access, res.data.refresh)
        setStep('success')

        setTimeout(() => {
          const redirectTo = res.data.requires_parental_consent ? '/parental-consent?flow=signup' : '/dashboard'
          navigate(redirectTo, { replace: true })
        }, 2000)
      }
    } catch (err: any) {
      const errs = err.response?.data
      const messages = []
      if (errs?.username) messages.push(errs.username[0])
      if (errs?.password) messages.push(errs.password[0])
      if (errs?.email) messages.push(errs.email[0])
      if (errs?.display_name) messages.push(errs.display_name[0])
      if (errs?.date_of_birth) messages.push(errs.date_of_birth[0])
      if (errs?.error) messages.push(errs.error)
      if (errs?.message) messages.push(errs.message)
      setError(messages.length > 0 ? messages.join(' ') : 'Signup failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const getProgressSteps = () => {
    if (userType === 'therapist') {
      return ['Professional Info', 'Confirm']
    } else if (userType === 'corporate') {
      return ['Company Info', 'Confirm']
    } else if (accountType === 'teen') {
      return ['Account Type', 'Your Info', 'Parent Consent', 'Confirm']
    } else {
      return ['Account Type', 'Your Info', 'Confirm']
    }
  }

  const progressSteps = getProgressSteps()

  const getStepOrder = () => {
    if (userType === 'therapist') {
      return ['professional', 'confirm', 'success']
    } else if (userType === 'corporate') {
      return ['corporate', 'confirm', 'success']
    } else if (accountType === 'teen') {
      return ['type', 'info', 'parent', 'confirm', 'success']
    } else {
      return ['type', 'info', 'confirm', 'success']
    }
  }

  const currentStepIndex = getStepOrder().indexOf(step)

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition">
            <span className="text-3xl">🌿</span>
            <span className="text-xl font-bold text-gray-900">Afya Yako</span>
          </Link>
          {step !== 'success' && (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {userType === 'therapist' ? 'Join as a Therapist' : userType === 'corporate' ? 'Register Your Organization' : 'Create your account'}
              </h1>
              <p className="text-gray-600">
                {userType === 'therapist' ? 'Reach patients who need your expertise. Help Kenyans access mental health care.' : userType === 'corporate' ? 'Provide mental health care to your employees.' : 'No real name required. Stay anonymous.'}
              </p>
            </>
          )}
        </div>

        {/* Progress Bar */}
        {step !== 'success' && step !== 'type' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {progressSteps.map((stepName, idx) => (
                <div key={idx} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition ${
                      idx < currentStepIndex
                        ? 'bg-green-500 text-white'
                        : idx === currentStepIndex
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {idx < currentStepIndex ? '✓' : idx + 1}
                  </div>
                  {idx < progressSteps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition ${
                        idx < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 text-center">
              Step {currentStepIndex + 1} of {progressSteps.length}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* STEP 0: USER TYPE SELECTION */}
        {step === 'usertype' && (
          <div className="space-y-4">
            <p className="text-gray-700 font-semibold mb-6">Who are you signing up as?</p>

            <button
              onClick={() => handleUserTypeSelect('individual')}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition text-left"
            >
              <div className="text-2xl mb-2">👤</div>
              <h3 className="font-semibold text-gray-900">Individual</h3>
              <p className="text-sm text-gray-600 mt-1">Looking for mental health support</p>
            </button>

            <button
              onClick={() => handleUserTypeSelect('therapist')}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
            >
              <div className="text-2xl mb-2">🏥</div>
              <h3 className="font-semibold text-gray-900">Therapist / Professional</h3>
              <p className="text-sm text-gray-600 mt-1">Licensed mental health professional offering services</p>
            </button>

            <button
              onClick={() => handleUserTypeSelect('corporate')}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-left"
            >
              <div className="text-2xl mb-2">🏢</div>
              <h3 className="font-semibold text-gray-900">Organization / Corporate</h3>
              <p className="text-sm text-gray-600 mt-1">Set up employee wellness program (EAP)</p>
            </button>
          </div>
        )}

        {/* STEP 1: ACCOUNT TYPE */}
        {step === 'type' && (
          <div className="space-y-4">
            <p className="text-gray-700 font-semibold mb-6">What type of therapy are you looking for?</p>

            <button
              onClick={() => handleTypeSelect('individual')}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
            >
              <div className="text-2xl mb-2">👤</div>
              <h3 className="font-semibold text-gray-900">Individual</h3>
              <p className="text-sm text-gray-600 mt-1">Therapy for myself</p>
            </button>

            <button
              onClick={() => handleTypeSelect('couples')}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
            >
              <div className="text-2xl mb-2">👥</div>
              <h3 className="font-semibold text-gray-900">Couples</h3>
              <p className="text-sm text-gray-600 mt-1">Therapy for me and my partner</p>
            </button>

            <button
              onClick={() => handleTypeSelect('teen')}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
            >
              <div className="text-2xl mb-2">👨‍👧</div>
              <h3 className="font-semibold text-gray-900">Teen</h3>
              <p className="text-sm text-gray-600 mt-1">Support for my child (under 18)</p>
            </button>
          </div>
        )}

        {/* STEP 2: BASIC INFO */}
        {step === 'info' && (
          <form onSubmit={handleSubmit(handleInfoSubmit)} className="space-y-4">
            {accountType === 'teen' && !isProfessional && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-4">
                <p className="text-purple-900 font-semibold text-sm mb-2">👨‍👧 Parent Registration</p>
                <p className="text-purple-700 text-xs leading-relaxed">You're registering as a parent to find therapy for your teen. Your information helps us match the right therapist to your child's needs.</p>
              </div>
            )}
            {isProfessional && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-900 font-semibold text-sm mb-2">🏥 Professional Registration</p>
                <p className="text-blue-700 text-xs leading-relaxed">Create your professional account to reach patients and provide therapy through Afya Yako. You'll need KMPDC or CPB verification to accept patients.</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Username</label>
              <input
                {...register('username', {
                  required: 'Username is required',
                  minLength: { value: 5, message: 'At least 5 characters' }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="StrengthSeeker101"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Private, never shown to therapists</p>
              {errors.username && <p className="text-red-600 text-xs mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Display Name</label>
              <input
                {...register('display_name', { required: 'Display name is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John, Anonymous, or any name"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Shown to your therapist (can be fake)</p>
              {errors.display_name && <p className="text-red-600 text-xs mt-1">{errors.display_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email (Optional)</label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="For session reminders only"
                disabled={loading}
              />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Date of Birth</label>
              <input
                {...register('date_of_birth', { required: 'Date of birth is required' })}
                type="date"
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                disabled={loading}
              />
              {errors.password_confirm && <p className="text-red-600 text-xs mt-1">{errors.password_confirm.message}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep('type')}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                disabled={loading}
              >
                <ArrowLeft size={18} /> Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? 'Saving...' : (<>Next <ArrowRight size={18} /></>)}
              </button>
            </div>
          </form>
        )}

        {/* PROFESSIONAL SIGNUP FORM */}
        {step === 'professional' && (
          <form onSubmit={handleSubmit(handleProfessionalSubmit)} className="space-y-4">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-900 font-semibold text-sm mb-2">🏥 Professional Registration</p>
              <p className="text-blue-700 text-xs leading-relaxed">Create your professional account to reach patients and provide therapy through Afya Yako. You'll need KMPDC or CPB verification to start accepting patients.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
              <input
                {...register('full_name', { required: 'Full name is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Dr. Jane Smith"
                disabled={loading}
              />
              {errors.full_name && <p className="text-red-600 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Username</label>
              <input
                {...register('username', {
                  required: 'Username is required',
                  minLength: { value: 5, message: 'At least 5 characters' }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="drjanesmith"
                disabled={loading}
              />
              {errors.username && <p className="text-red-600 text-xs mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
              <input
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/, message: 'Invalid email' } })}
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="jane@example.com"
                disabled={loading}
              />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number</label>
              <input
                {...register('phone')}
                type="tel"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="+254712345678"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Date of Birth</label>
              <input
                {...register('date_of_birth', { required: 'Date of birth is required' })}
                type="date"
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              />
              {errors.date_of_birth && <p className="text-red-600 text-xs mt-1">{errors.date_of_birth.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Professional Type</label>
              <select
                {...register('professional_type')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">Select professional type</option>
                <option value="therapist">Therapist</option>
                <option value="counselor">Counselor</option>
                <option value="psychologist">Psychologist</option>
                <option value="psychiatrist">Psychiatrist</option>
              </select>
            </div>

            <p className="text-xs text-gray-500 -mt-1 mb-2">
              You'll enter your KMPDC or CPB license number in the verification step after signup.
            </p>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Years of Experience</label>
              <input
                {...register('years_experience', { pattern: { value: /^\d+$/, message: 'Enter a number' } })}
                type="number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="5"
                disabled={loading}
              />
              {errors.years_experience && <p className="text-red-600 text-xs mt-1">{errors.years_experience.message}</p>}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="••••••••"
                disabled={loading}
              />
              {errors.password_confirm && <p className="text-red-600 text-xs mt-1">{errors.password_confirm.message}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep('usertype')}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                disabled={loading}
              >
                <ArrowLeft size={18} /> Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? 'Saving...' : (<>Next <ArrowRight size={18} /></>)}
              </button>
            </div>
          </form>
        )}

        {/* CORPORATE SIGNUP FORM */}
        {step === 'corporate' && (
          <form onSubmit={handleSubmit(handleCorporateSubmit)} className="space-y-4">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-900 font-semibold text-sm mb-2">🏢 Corporate Registration</p>
              <p className="text-green-700 text-xs leading-relaxed mb-3">Set up an Employee Assistance Program (EAP) for your organization to provide mental health support to your employees.</p>
              <div className="bg-white rounded p-3 border-l-4 border-green-600">
                <p className="text-green-900 font-semibold text-xs mb-1">🔒 Employee Privacy Guaranteed</p>
                <p className="text-green-800 text-xs leading-relaxed">All employee counseling sessions are completely confidential. HR will never know who uses the EAP or what they discuss with therapists. Employees maintain full anonymity.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Company Name</label>
              <input
                {...register('company_name', { required: 'Company name is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Acme Corporation"
                disabled={loading}
              />
              {errors.company_name && <p className="text-red-600 text-xs mt-1">{errors.company_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Contact Person Name</label>
              <input
                {...register('contact_name', { required: 'Contact name is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="John Doe"
                disabled={loading}
              />
              {errors.contact_name && <p className="text-red-600 text-xs mt-1">{errors.contact_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
              <input
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/, message: 'Invalid email' } })}
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="john@acme.com"
                disabled={loading}
              />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Contact Phone</label>
              <input
                {...register('contact_phone')}
                type="tel"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="+254712345678"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Industry</label>
              <input
                {...register('industry')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Technology, Healthcare, Finance, etc."
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Employee Count</label>
              <input
                {...register('employee_count')}
                type="number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Company Address</label>
              <input
                {...register('company_address')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="123 Business Street, Nairobi"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Username</label>
              <input
                {...register('username', {
                  required: 'Username is required',
                  minLength: { value: 5, message: 'At least 5 characters' }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="company_admin"
                disabled={loading}
              />
              {errors.username && <p className="text-red-600 text-xs mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Date of Birth</label>
              <input
                {...register('date_of_birth', { required: 'Date of birth is required' })}
                type="date"
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="••••••••"
                disabled={loading}
              />
              {errors.password_confirm && <p className="text-red-600 text-xs mt-1">{errors.password_confirm.message}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep('usertype')}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                disabled={loading}
              >
                <ArrowLeft size={18} /> Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? 'Saving...' : (<>Next <ArrowRight size={18} /></>)}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: PARENT CONSENT (TEEN ONLY) */}
        {step === 'parent' && (
          <form onSubmit={handleSubmit(handleParentInfoSubmit)} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                Since you're under 18, we need your parent or guardian to give permission before you can start therapy.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Parent/Guardian Name</label>
              <input
                {...register('parent_name', { required: 'Parent name is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter full name"
                disabled={loading}
              />
              {errors.parent_name && <p className="text-red-600 text-xs mt-1">{errors.parent_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Parent/Guardian Email</label>
              <input
                {...register('parent_email', {
                  required: 'Parent email is required',
                  pattern: { value: /^\S+@\S+$/, message: 'Invalid email' }
                })}
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="parent@example.com"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">We'll send them a consent form to review and sign</p>
              {errors.parent_email && <p className="text-red-600 text-xs mt-1">{errors.parent_email.message}</p>}
            </div>

            <label className="flex items-start gap-3 cursor-pointer p-3 border-2 border-gray-200 rounded-lg">
              <input
                {...register('parent_consent', { required: 'You must confirm parent consent' })}
                type="checkbox"
                className="mt-1 w-5 h-5 accent-blue-600 flex-shrink-0"
                disabled={loading}
              />
              <span className="text-sm text-gray-700">
                I confirm that I am authorized to provide parental consent for this teen account
              </span>
            </label>
            {errors.parent_consent && <p className="text-red-600 text-xs mt-1 ml-8">{errors.parent_consent.message}</p>}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep('info')}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                disabled={loading}
              >
                <ArrowLeft size={18} /> Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? 'Saving...' : (<>Next <ArrowRight size={18} /></>)}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: CONFIRMATION */}
        {step === 'confirm' && (
          <form onSubmit={handleSubmit(handleConfirmSubmit)} className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              {userType === 'therapist' ? (
                <>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">FULL NAME</p>
                    <p className="text-gray-900 font-semibold">{formData.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">USERNAME</p>
                    <p className="text-gray-900 font-semibold">{formData.username}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">EMAIL</p>
                    <p className="text-gray-900 font-semibold">{formData.email}</p>
                  </div>
                  {formData.professional_type && (
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">PROFESSIONAL TYPE</p>
                      <p className="text-gray-900 font-semibold capitalize">{formData.professional_type}</p>
                    </div>
                  )}
                  {formData.years_experience && (
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">EXPERIENCE</p>
                      <p className="text-gray-900 font-semibold">{formData.years_experience} years</p>
                    </div>
                  )}
                </>
              ) : userType === 'corporate' ? (
                <>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">COMPANY NAME</p>
                    <p className="text-gray-900 font-semibold">{formData.company_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">CONTACT PERSON</p>
                    <p className="text-gray-900 font-semibold">{formData.contact_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">EMAIL</p>
                    <p className="text-gray-900 font-semibold">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">EMPLOYEES</p>
                    <p className="text-gray-900 font-semibold">{formData.employee_count || 'Not specified'}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">USERNAME</p>
                    <p className="text-gray-900 font-semibold">{formData.username}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">DISPLAY NAME</p>
                    <p className="text-gray-900 font-semibold">{formData.display_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">ACCOUNT TYPE</p>
                    <p className="text-gray-900 font-semibold capitalize">{formData.account_type}</p>
                  </div>
                  {formData.parent_name && (
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">PARENT/GUARDIAN</p>
                      <p className="text-gray-900 font-semibold">{formData.parent_name}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                {...register('consent', { required: 'You must agree to continue' })}
                type="checkbox"
                className="mt-1 w-5 h-5 accent-blue-600 flex-shrink-0"
                disabled={loading}
              />
              <span className="text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" target="_blank" className="text-blue-600 font-semibold hover:underline">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy" target="_blank" className="text-blue-600 font-semibold hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>
            {errors.consent && <p className="text-red-600 text-xs mt-1 ml-8">{errors.consent.message}</p>}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (userType === 'therapist') {
                    setStep('professional')
                  } else if (userType === 'corporate') {
                    setStep('corporate')
                  } else if (accountType === 'teen') {
                    setStep('parent')
                  } else {
                    setStep('info')
                  }
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                disabled={loading}
              >
                <ArrowLeft size={18} /> Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        {/* SUCCESS STATE */}
        {step === 'success' && (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
            <p className="text-gray-600 mb-6">Your account has been created successfully.</p>
            {accountType === 'teen' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-900">
                A consent form has been sent to your parent/guardian. They need to review and approve it before you can start therapy.
              </div>
            )}
            <p className="text-gray-600 text-sm">Redirecting you now...</p>
          </div>
        )}

        {/* Footer - Sign In Link */}
        {(step === 'type' || step === 'success') && (
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
