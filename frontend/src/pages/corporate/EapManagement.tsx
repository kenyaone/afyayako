import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'
import { Copy, Plus, Trash2, Clock, Users, CheckCircle2, AlertCircle } from 'lucide-react'

interface InviteLink {
  id: number
  token: string
  full_token: string
  email?: string
  created_at: string
  expires_at?: string
  max_uses?: number
  current_uses: number
  uses_remaining?: number
  employees_joined: number
  is_active: boolean
}

interface GenerateForm {
  max_uses?: number
  expires_in_days?: number
  email?: string
}

export default function EapManagement() {
  const { register, handleSubmit, reset } = useForm<GenerateForm>()
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copiedToken, setCopiedToken] = useState('')
  const [totalEmployees, setTotalEmployees] = useState(0)

  useEffect(() => {
    fetchInviteLinks()
    fetchEmployeeCount()
  }, [])

  const fetchInviteLinks = async () => {
    try {
      const res = await api.get('/eap/invite-links')
      setInviteLinks(res.data.invite_links)
    } catch (err: any) {
      setError('Failed to load invite links')
    }
  }

  const fetchEmployeeCount = async () => {
    try {
      const res = await api.get('/eap/employees')
      setTotalEmployees(res.data.total_employees)
    } catch (err) {
      // Silent fail
    }
  }

  const onSubmit = async (data: GenerateForm) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await api.post('/eap/generate-invite', {
        max_uses: data.max_uses,
        expires_in_days: data.expires_in_days,
        email: data.email,
      })

      setSuccess(`Invite link created! Use it to invite employees.`)
      reset()
      fetchInviteLinks()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate invite link')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (token: string) => {
    const inviteUrl = `${window.location.origin}/eap/join/${token}`
    navigator.clipboard.writeText(inviteUrl)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(''), 2000)
  }

  const deleteInviteLink = async (id: number) => {
    if (!window.confirm('Are you sure? This will invalidate the invite link.')) {
      return
    }

    try {
      await api.delete(`/eap/invite-links/${id}`)
      setSuccess('Invite link revoked')
      fetchInviteLinks()
    } catch (err: any) {
      setError('Failed to revoke invite link')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">EAP Management</h1>
        <p className="text-gray-600">Invite employees to your confidential Employee Assistance Program</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <Users size={24} className="text-blue-600 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
          <p className="text-sm text-gray-600">Employees Joined</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <CheckCircle2 size={24} className="text-green-600 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{inviteLinks.filter(l => l.is_active).length}</p>
          <p className="text-sm text-gray-600">Active Invite Links</p>
        </div>
      </div>

      {/* Privacy Info */}
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
        <p className="text-green-900 font-semibold text-sm mb-2">🔒 Employee Privacy Guaranteed</p>
        <p className="text-green-800 text-sm leading-relaxed">
          When employees join via your invite link, their counseling sessions remain completely confidential.
          You will never see who used the EAP or what they discussed with therapists.
          You only see aggregate usage statistics and can support employee wellness anonymously.
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 flex gap-2">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 flex gap-2">
          <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Generate New Link */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Plus size={20} />
          Generate New Invite Link
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Max Uses (Optional)</label>
              <input
                {...register('max_uses')}
                type="number"
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Leave empty for unlimited"
              />
              <p className="text-xs text-gray-500 mt-1">How many employees can use this link</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Expires In (Days)</label>
              <input
                {...register('expires_in_days')}
                type="number"
                min="1"
                max="365"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Leave empty for no expiry"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-expire the link after X days</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Pre-fill Email (Optional)</label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="employee@example.com"
            />
            <p className="text-xs text-gray-500 mt-1">Pre-populate employee email (still anonymous after signup)</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Invite Link'}
          </button>
        </form>
      </div>

      {/* Invite Links List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Active Invite Links</h2>
        </div>

        {inviteLinks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No invite links created yet. Generate one above to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {inviteLinks.map((link) => (
              <div key={link.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono text-gray-700">
                        {link.token}
                      </code>
                      <button
                        onClick={() => copyToClipboard(link.full_token)}
                        className="p-1 hover:bg-gray-200 rounded transition"
                        title="Copy full invite URL"
                      >
                        <Copy size={16} className="text-gray-600" />
                      </button>
                      {copiedToken === link.full_token && (
                        <span className="text-xs text-green-600 font-semibold">Copied!</span>
                      )}
                    </div>
                    {link.email && (
                      <p className="text-sm text-gray-600">Email: {link.email}</p>
                    )}
                  </div>

                  {link.is_active ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                      Expired/Used
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="font-semibold text-gray-900">{new Date(link.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    {link.expires_at ? (
                      <>
                        <p className="text-gray-600 flex items-center gap-1">
                          <Clock size={14} /> Expires
                        </p>
                        <p className="font-semibold text-gray-900">{new Date(link.expires_at).toLocaleDateString()}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-600">Expiration</p>
                        <p className="font-semibold text-gray-900">Never</p>
                      </>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-600">Uses</p>
                    <p className="font-semibold text-gray-900">
                      {link.max_uses ? `${link.current_uses}/${link.max_uses}` : `${link.current_uses} (∞)`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <p className="text-gray-600">
                    <Users size={14} className="inline mr-1" />
                    {link.employees_joined} employee{link.employees_joined !== 1 ? 's' : ''} joined
                  </p>
                  <button
                    onClick={() => deleteInviteLink(link.id)}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition text-sm flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">How to Invite Employees</h3>
        <ol className="space-y-2 text-sm text-blue-800">
          <li><strong>1.</strong> Generate an invite link above</li>
          <li><strong>2.</strong> Copy the link and share it with employees via email or internal communication</li>
          <li><strong>3.</strong> Employees click the link and create their confidential account</li>
          <li><strong>4.</strong> They gain immediate access to anonymous counseling services</li>
          <li><strong>5.</strong> You see aggregate usage stats but never know who used the EAP</li>
        </ol>
      </div>
    </div>
  )
}
