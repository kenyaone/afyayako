import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import { CheckCircle, Shield, Clock, Upload, X } from 'lucide-react'
import type { Specialization, Language } from '../../types'

interface ApplyForm {
  kmpdc_license: string
  cpb_license?: string
  qualification: string
  bio: string
  years_experience: number
  gender: string
  rate_per_hour: number
  mpesa_number: string
  specialization_ids: number[]
  language_ids: number[]
  professional_photo?: string
  signature_name: string
  sop_agreed: boolean
}

export default function ApplyAsProfessional() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const setAuth = useAuthStore(s => s.setAuth)
  const token = useAuthStore(s => s.token)
  const refresh = useAuthStore(s => s.refresh)
  const [specializations, setSpecializations] = useState<Specialization[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [selectedSpecs, setSelectedSpecs] = useState<number[]>([])
  const [selectedLangs, setSelectedLangs] = useState<number[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [locations, setLocations] = useState<Array<{ id: number; name: string; county: string; town: string; latitude: number | null; longitude: number | null }>>([])
  const [locationId, setLocationId] = useState('')
  const [customLocation, setCustomLocation] = useState('')
  const photoInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ApplyForm>({
    defaultValues: { years_experience: 3, rate_per_hour: 2000, gender: 'other', sop_agreed: false }
  })

  useEffect(() => {
    api.get('/professionals/specializations')
      .then(r => {
        const data = Array.isArray(r.data) ? r.data : r.data?.specializations || []
        setSpecializations(data)
      })
      .catch(err => console.error('Failed to load specializations:', err))

    api.get('/professionals/languages')
      .then(r => {
        const data = Array.isArray(r.data) ? r.data : r.data?.languages || []
        setLanguages(data)
      })
      .catch(err => console.error('Failed to load languages:', err))

    api.get('/locations')
      .then(r => setLocations(r.data?.locations || []))
      .catch(err => console.error('Failed to load locations:', err))
  }, [])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo must be less than 5MB')
        return
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Only JPEG, PNG, and WebP images are supported')
        return
      }
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setPhotoPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }


  const toggleSpec = (id: number) =>
    setSelectedSpecs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const toggleLang = (id: number) =>
    setSelectedLangs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const onSubmit = async (data: ApplyForm) => {
    if (selectedSpecs.length === 0) { setError('Select at least one specialization.'); return }
    if (selectedLangs.length === 0) { setError('Select at least one language.'); return }
    if (!data.sop_agreed) { setError('You must agree to the Professional Standards of Practice.'); return }
    if (!data.signature_name.trim()) { setError('Digital signature (name) is required.'); return }

    setSubmitting(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('kmpdc_license', data.kmpdc_license)
      formData.append('cpb_license', data.cpb_license || '')
      formData.append('qualification', data.qualification)
      formData.append('bio', data.bio)
      formData.append('years_experience', data.years_experience.toString())
      formData.append('gender', data.gender)
      formData.append('rate_per_hour', data.rate_per_hour.toString())
      formData.append('mpesa_number', data.mpesa_number)
      formData.append('signature_name', data.signature_name)
      formData.append('specialization_ids', JSON.stringify(selectedSpecs))
      formData.append('language_ids', JSON.stringify(selectedLangs))

      // Location: a curated location, or a custom one the applicant typed.
      const picked = locations.find(l => String(l.id) === locationId)
      if (picked) {
        formData.append('location_county', picked.county || picked.name)
        formData.append('location_city', picked.town || picked.name)
        if (picked.latitude != null) formData.append('latitude', String(picked.latitude))
        if (picked.longitude != null) formData.append('longitude', String(picked.longitude))
      } else if (customLocation.trim()) {
        formData.append('location_county', customLocation.trim())
        formData.append('location_city', customLocation.trim())
      }

      if (photoFile) {
        formData.append('professional_photo', photoFile)
      }

      const res = await api.post('/professionals/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (res.data.user && token) {
        setAuth(res.data.user, token, refresh ?? token)
      }
      setSubmitted(true)
    } catch (err: any) {
      const d = err.response?.data
      setError(d?.kmpdc_license?.[0] || d?.qualification?.[0] || d?.years_experience?.[0] || d?.error || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-16 card text-center py-12">
        <Clock size={56} className="text-accent-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted!</h2>
        <p className="text-gray-600 mb-2">
          Thank you, <strong>{user?.display_name}</strong>. Your application is approved!
        </p>
        <p className="text-gray-500 text-sm mb-6">
          Your application has been submitted for admin review. You'll be notified within 24-48 hours once your credentials are verified.
        </p>
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-sm text-primary-800 mb-6 text-left">
          <div className="font-medium mb-2">What's next:</div>
          <div className="space-y-1.5">
            <div>✅ Application submitted for admin review</div>
            <div>⏳ Admin team verifies your credentials (24-48 hours)</div>
            <div>📧 You'll receive email confirmation when approved</div>
            <div>🎯 Your profile goes live once verified</div>
          </div>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn-primary w-full">
          Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-sky-600 bg-clip-text text-transparent">
          Counselor Professional Onboarding
        </h1>
        <p className="text-gray-600 mt-2">Welcome to Afya Yako. Complete this form to join our network of verified mental health professionals. All information is securely stored.</p>
      </div>

      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex gap-3 text-sm text-sky-900">
        <Shield size={18} className="flex-shrink-0 mt-0.5" />
        <div>
          <strong>Professional Registration Verification.</strong> Our admin team will verify your credentials with KMPDC (Kenya Medical Practitioners and Dentists Council) and CPB (Counsellors and Psychologists Board) after you submit.
          <a href="https://www.kmpdc.or.ke" target="_blank" rel="noopener noreferrer" className="text-sky-700 underline ml-1">View KMPDC Registry</a>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Professional Photo */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Professional Photo <span className="text-red-500">*</span></h2>
          <p className="text-xs text-gray-600">Upload a clear professional headshot. This helps patients recognize you during sessions.</p>

          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="hidden"
          />

          <div className="border-2 border-dashed border-primary-300 rounded-lg p-6 text-center cursor-pointer hover:bg-primary-50 transition"
            onClick={() => photoInputRef.current?.click()}>
            {photoPreview ? (
              <div className="space-y-3">
                <img src={photoPreview} alt="Preview" className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-primary-200" />
                <p className="text-sm text-gray-600">Click to change photo</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload size={32} className="text-primary-400 mx-auto" />
                <p className="font-medium text-gray-700">Click to upload or drag photo here</p>
                <p className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB</p>
              </div>
            )}
          </div>
        </div>

        {/* License & Basic Info */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Professional Credentials</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              KMPDC License Number <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <input
              {...register('kmpdc_license')}
              className="input-field font-mono"
              placeholder="e.g. KP-2020-0012"
            />
            <p className="text-xs text-gray-400 mt-1">
              License verification will be completed by our admin team after submission.
              <a href="https://www.kmpdc.or.ke/search-professionals" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline ml-1">
                View KMPDC Registry →
              </a>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Counsellors &amp; Psychologists Board (CPB) License <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <input
              {...register('cpb_license')}
              className="input-field font-mono"
              placeholder="e.g. CPB-2021-0345"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Highest Qualification <span className="text-red-500">*</span>
            </label>
            <input
              {...register('qualification', { required: 'Qualification is required (minimum a diploma)' })}
              className="input-field"
              placeholder="e.g. Diploma in Counselling, MSc Clinical Psychology"
            />
            {errors.qualification && <p className="text-red-500 text-xs mt-1">{errors.qualification.message}</p>}
            <p className="text-xs text-gray-400 mt-1">A minimum of a diploma in the relevant profession is required.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credential Reference <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <input
              {...register('credential_document')}
              type="text"
              className="input-field"
              placeholder="e.g. Reference to your diploma, certificate, or license"
            />
            <p className="text-xs text-gray-400 mt-1">You can reference your credentials here. Admin will verify during review.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience <span className="text-red-500">*</span></label>
              <input
                {...register('years_experience', { required: true, min: { value: 3, message: 'At least 3 years required' }, max: 50, valueAsNumber: true })}
                type="number" min={3} max={50}
                className="input-field"
              />
              {errors.years_experience && <p className="text-red-500 text-xs mt-1">{errors.years_experience.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select {...register('gender')} className="input-field">
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location (for in-person sessions)</label>
            <select
              value={locationId}
              onChange={e => { setLocationId(e.target.value); if (e.target.value) setCustomLocation('') }}
              className="input-field"
            >
              <option value="">Select a location…</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name}{l.county && l.county !== l.name ? ` (${l.county})` : ''}</option>
              ))}
            </select>
            {!locationId && (
              <input
                type="text"
                value={customLocation}
                onChange={e => setCustomLocation(e.target.value)}
                className="input-field mt-2"
                placeholder="Not listed? Type your town / county"
              />
            )}
            <p className="text-xs text-gray-400 mt-1">Leave blank if you only see clients online.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Rate (KES/hr) <span className="text-red-500">*</span>
              </label>
              <input
                {...register('rate_per_hour', { required: true, min: 500, valueAsNumber: true })}
                type="number" min={500}
                className="input-field"
                placeholder="2000"
              />
              <p className="text-xs text-gray-400 mt-1">Platform takes 35%. You receive 65%.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                M-Pesa Number (for payouts) <span className="text-red-500">*</span>
              </label>
              <input
                {...register('mpesa_number', { required: 'M-Pesa number required for payouts' })}
                className="input-field"
                placeholder="0712345678"
              />
              {errors.mpesa_number && <p className="text-red-500 text-xs mt-1">{errors.mpesa_number.message}</p>}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-900">Professional Bio</h2>
          <p className="text-xs text-gray-500">This is what patients read when choosing a therapist. Be warm, honest, and specific.</p>
          <textarea
            {...register('bio', {
              required: 'Bio is required',
              minLength: { value: 80, message: 'Please write at least 80 characters' }
            })}
            rows={5}
            className="input-field resize-none"
            placeholder="Describe your background, approach, and what types of clients you help. E.g. 'I am a clinical psychologist with 7 years helping individuals overcome alcohol dependency and depression...'"
          />
          {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>}
        </div>

        {/* Specializations */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-900">
            Specializations <span className="text-red-500">*</span>
            <span className="text-gray-400 font-normal text-sm ml-2">(select all that apply)</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {specializations.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSpec(s.id)}
                className={`px-3 py-1.5 rounded-full text-sm border-2 transition-all ${
                  selectedSpecs.includes(s.id)
                    ? 'border-primary-600 bg-primary-50 text-primary-800 font-medium'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {selectedSpecs.includes(s.id) && '✓ '}{s.name}
              </button>
            ))}
          </div>
          {selectedSpecs.length === 0 && <p className="text-xs text-gray-400">Select at least one.</p>}
        </div>

        {/* Languages */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-900">
            Languages <span className="text-red-500">*</span>
            <span className="text-gray-400 font-normal text-sm ml-2">(languages you can conduct sessions in)</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {languages.map(l => (
              <button
                key={l.id}
                type="button"
                onClick={() => toggleLang(l.id)}
                className={`px-3 py-1.5 rounded-full text-sm border-2 transition-all ${
                  selectedLangs.includes(l.id)
                    ? 'border-primary-600 bg-primary-50 text-primary-800 font-medium'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {selectedLangs.includes(l.id) && '✓ '}{l.name}
              </button>
            ))}
          </div>
        </div>

        {/* Earnings preview */}
        <div className="card bg-sky-50 border-sky-200">
          <h2 className="font-semibold text-sky-900 mb-3">Earnings Estimate</h2>
          <div className="space-y-1 text-sm text-sky-800">
            <div className="flex justify-between">
              <span>10 sessions/week @ KES 2,000</span>
              <span className="font-medium">KES 16,000/week</span>
            </div>
            <div className="flex justify-between">
              <span>20 sessions/week @ KES 2,000</span>
              <span className="font-bold text-sky-900">KES 32,000/week</span>
            </div>
            <div className="text-xs text-sky-600 mt-2">Platform fee: 35% · Your share: 65% · Paid to M-Pesa within 24hrs</div>
          </div>
        </div>

        {/* Professional Standards of Practice */}
        <div className="card space-y-4 border-lavender-200 bg-lavender-50">
          <h2 className="font-semibold text-gray-900">Professional Standards of Practice (SOP)</h2>
          <div className="bg-white rounded-lg p-4 border border-lavender-200 max-h-48 overflow-y-auto text-sm text-gray-700 space-y-3">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Code of Ethics & Conduct</h3>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Maintain confidentiality and patient privacy at all times</li>
                <li>Provide culturally sensitive and non-discriminatory care</li>
                <li>Obtain informed consent before starting treatment</li>
                <li>Maintain professional boundaries with all clients</li>
                <li>Report any suspected abuse or child safety concerns to relevant authorities</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Professional Responsibilities</h3>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Maintain current professional licenses and certifications</li>
                <li>Respond to session requests within 24 hours</li>
                <li>Provide accurate professional information on your profile</li>
                <li>Adhere to session schedules and communicate cancellations promptly</li>
                <li>Decline sessions for clients outside your area of expertise</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Technology & Data Security</h3>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Use secure platforms for all patient communications</li>
                <li>Never share patient information with third parties</li>
                <li>Ensure all devices used for sessions are password protected</li>
                <li>Comply with Kenya Data Protection Act 2019</li>
              </ul>
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('sop_agreed', { required: 'You must agree to the SOP' })}
              className="mt-1 w-4 h-4 accent-primary-600 flex-shrink-0"
            />
            <span className="text-sm text-gray-700">
              I have read and agree to abide by the Professional Standards of Practice. I understand that violations may result in suspension or removal from the platform.
            </span>
          </label>
          {errors.sop_agreed && <p className="text-red-500 text-xs">{errors.sop_agreed.message}</p>}
        </div>

        {/* Digital Signature */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Digital Signature <span className="text-red-500">*</span></h2>
          <p className="text-xs text-gray-600">By signing below, you confirm that all information provided is accurate and you agree to our terms.</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sign with Your Full Name
            </label>
            <input
              {...register('signature_name', { required: 'Your full name is required for signature' })}
              className="input-field font-semibold text-lg border-b-2 border-gray-300 rounded-none focus:ring-0 focus:border-primary-600"
              placeholder="Type your full name here"
            />
            {errors.signature_name && <p className="text-red-500 text-xs mt-1">{errors.signature_name.message}</p>}
            <p className="text-xs text-gray-500 mt-2">By typing your name, you electronically sign this application.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 border border-gray-200">
            <strong>Declaration:</strong> I declare that the information provided in this application is true and accurate. I understand that providing false information may result in legal action and removal from the platform.
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-base">
          {submitting ? 'Submitting Application...' : 'Submit Professional Application'}
        </button>
      </form>
    </div>
  )
}
