import { useState } from 'react'
import { X, CheckCircle } from 'lucide-react'

interface ConsentFormProps {
  isOpen: boolean
  onClose: () => void
  onConsent: (consented: boolean) => void
  title: string
  description: string
  type: 'virtual' | 'physical' | 'general'
}

export default function ConsentForm({
  isOpen,
  onClose,
  onConsent,
  title,
  description,
  type,
}: ConsentFormProps) {
  const [agreed, setAgreed] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>

          <div className="space-y-6 mb-8 bg-gray-50 rounded-xl p-6">
            {type === 'virtual' && (
              <>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Virtual Session Details</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>✓ Encrypted video call via Jitsi</li>
                    <li>✓ Private room • No recording without permission</li>
                    <li>✓ Session feedback available after</li>
                    <li>✓ Therapist is KMPDC & CPB verified</li>
                  </ul>
                </div>
              </>
            )}

            {type === 'physical' && (
              <>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">In-Person Session Details</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>✓ Meeting location will be confirmed</li>
                    <li>✓ Professional is verified and licensed</li>
                    <li>✓ Confidentiality agreement applies</li>
                    <li>✓ Emergency contacts will be established</li>
                  </ul>
                </div>
              </>
            )}

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Privacy & Data</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Your identity remains confidential</li>
                <li>✓ Session notes are encrypted</li>
                <li>✓ No third-party sharing without consent</li>
                <li>✓ GDPR & local data protection compliant</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Your Rights</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ You can pause or end session at any time</li>
                <li>✓ You can request a different therapist</li>
                <li>✓ You have access to your own records</li>
                <li>✓ You can withdraw consent anytime</li>
              </ul>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="bg-teal-50 border border-teal-100 rounded-lg p-4 mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-teal-600 mt-0.5 cursor-pointer"
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                I have read and understand the session details, privacy policies, and my rights. I consent to proceed with this {type} session.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConsent(agreed)
                onClose()
              }}
              disabled={!agreed}
              className="flex-1 px-4 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {agreed && <CheckCircle size={18} />}
              I Consent & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
