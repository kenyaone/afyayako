import { useState } from 'react'
import { Copy, RefreshCw, Trash2, Plus, Eye, EyeOff, Check } from 'lucide-react'
import api from '../../api/axios'

interface TestAccount {
  id: number
  username: string
  display_name: string
  email: string
  role: string
  created_at: string
  is_active: boolean
}

export default function TestAccountManager() {
  const [accounts, setAccounts] = useState<TestAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({})
  const [copied, setCopied] = useState<Record<number, boolean>>({})

  const [formData, setFormData] = useState({
    display_name: '',
    role: 'professional',
    email: '',
  })

  const [createdAccount, setCreatedAccount] = useState<{
    username: string
    password: string
    email: string
    role: string
  } | null>(null)

  const generateSecurePassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let pass = ''
    for (let i = 0; i < 16; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return pass
  }

  const createTestAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const password = generateSecurePassword()
      const username = formData.display_name.toLowerCase().replace(/\s+/g, '_') + '_' + Math.random().toString(36).substr(2, 5)

      const response = await api.post('/admin/test-accounts', {
        username,
        password,
        display_name: formData.display_name,
        email: formData.email || `${username}@test.local`,
        role: formData.role,
      })

      setCreatedAccount({
        username,
        password,
        email: formData.email || `${username}@test.local`,
        role: formData.role,
      })

      setFormData({ display_name: '', role: 'professional', email: '' })
      setShowForm(false)

      // Refresh list
      fetchAccounts()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create test account')
    } finally {
      setLoading(false)
    }
  }

  const fetchAccounts = async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/test-accounts')
      setAccounts(response.data.accounts || [])
    } catch (error) {
      console.error('Failed to fetch test accounts')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (accountId: number) => {
    if (!confirm('Reset password for this account?')) return
    try {
      const password = generateSecurePassword()
      const response = await api.post(`/admin/test-accounts/${accountId}/reset-password`, { password })

      setCreatedAccount({
        username: response.data.username,
        password,
        email: response.data.email,
        role: response.data.role,
      })
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to reset password')
    }
  }

  const deleteAccount = async (accountId: number) => {
    if (!confirm('Delete this test account? This cannot be undone.')) return
    try {
      await api.delete(`/admin/test-accounts/${accountId}`)
      fetchAccounts()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete account')
    }
  }

  const copyToClipboard = (text: string, key: number) => {
    navigator.clipboard.writeText(text)
    setCopied({ ...copied, [key]: true })
    setTimeout(() => setCopied({ ...copied, [key]: false }), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Created Account Display */}
      {createdAccount && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-green-900 mb-4">✅ Test Account Created</h3>
          <div className="space-y-3 mb-4">
            <div className="bg-white rounded-lg p-3 border border-green-100">
              <label className="text-xs text-gray-500 font-medium">Username</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 bg-gray-50 px-3 py-2 rounded font-mono text-sm text-gray-900 break-all">
                  {createdAccount.username}
                </code>
                <button
                  onClick={() => copyToClipboard(createdAccount.username, 1)}
                  className="p-2 hover:bg-green-100 rounded transition-colors"
                  title="Copy username"
                >
                  {copied[1] ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-gray-600" />}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-green-100">
              <label className="text-xs text-gray-500 font-medium">Password (Save securely!)</label>
              <div className="flex items-center gap-2 mt-1">
                <code className={`flex-1 px-3 py-2 rounded font-mono text-sm break-all ${
                  showPassword[0] ? 'bg-gray-50 text-gray-900' : 'bg-gray-200 text-gray-400'
                }`}>
                  {showPassword[0] ? createdAccount.password : '••••••••••••••••'}
                </code>
                <button
                  onClick={() => setShowPassword({ ...showPassword, [0]: !showPassword[0] })}
                  className="p-2 hover:bg-green-100 rounded transition-colors"
                  title="Toggle visibility"
                >
                  {showPassword[0] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => copyToClipboard(createdAccount.password, 0)}
                  className="p-2 hover:bg-green-100 rounded transition-colors"
                  title="Copy password"
                >
                  {copied[0] ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-gray-600" />}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-green-100">
              <label className="text-xs text-gray-500 font-medium">Email</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 bg-gray-50 px-3 py-2 rounded font-mono text-sm text-gray-900 break-all">
                  {createdAccount.email}
                </code>
                <button
                  onClick={() => copyToClipboard(createdAccount.email, 2)}
                  className="p-2 hover:bg-green-100 rounded transition-colors"
                  title="Copy email"
                >
                  {copied[2] ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-gray-600" />}
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => setCreatedAccount(null)}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </div>
      )}

      {/* Create New Account Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Create Test Account</h3>
          <form onSubmit={createTestAccount} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Test Thompson"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
              <input
                type="email"
                placeholder="test@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="professional">Professional/Doctor</option>
                <option value="patient">Patient</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Header & Create Button */}
      {!showForm && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Test Accounts</h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            New Test Account
          </button>
        </div>
      )}

      {/* Accounts List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading && !accounts.length ? (
          <div className="p-8 text-center text-gray-500">Loading test accounts...</div>
        ) : accounts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No test accounts yet. Create one to get started.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Username</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Created</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{account.display_name}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">{account.username}</code>
                    </td>
                    <td className="px-6 py-4 text-gray-600 capitalize">{account.role}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(account.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => resetPassword(account.id)}
                        title="Reset password"
                        className="p-2 hover:bg-yellow-100 text-yellow-600 rounded transition-colors"
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button
                        onClick={() => deleteAccount(account.id)}
                        title="Delete account"
                        className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800 font-medium">🔐 Security Notice:</p>
        <ul className="text-xs text-amber-700 mt-2 space-y-1 ml-4 list-disc">
          <li>Credentials are shown <strong>only once</strong> after creation</li>
          <li>Never share credentials via email or chat</li>
          <li>Passwords are randomly generated with 16 characters</li>
          <li>All account actions are logged for audit purposes</li>
          <li>Test accounts should be deleted when no longer needed</li>
        </ul>
      </div>
    </div>
  )
}
