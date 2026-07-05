import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { DollarSign, Download, TrendingUp, Clock } from 'lucide-react'

interface Payout {
  id: number
  amount: number
  status: 'pending' | 'paid'
  created_at: string
  consultation?: { consultation_id: string; scheduled_at: string }
}

export default function Payouts() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [totalEarned, setTotalEarned] = useState(0)
  const [totalPending, setTotalPending] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/professional/payouts').then(r => {
      setPayouts(r.data.payouts ?? [])
      setTotalEarned(r.data.total_earned ?? 0)
      setTotalPending(r.data.total_pending ?? 0)
    }).finally(() => setLoading(false))
  }, [])

  const download = () => {
    const rows = [
      ['Date', 'Session ID', 'Amount (KES)', 'Status'],
      ...payouts.map(p => [
        new Date(p.created_at).toLocaleDateString('en-KE'),
        p.consultation?.consultation_id ?? '-',
        p.amount.toString(),
        p.status,
      ])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = 'payouts.csv'; a.click()
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading payouts…</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign size={22} className="text-green-600" /> Payout Statement
          </h1>
          <p className="text-sm text-gray-500 mt-1">Platform commission: 35%. You keep 65% of each session fee.</p>
        </div>
        <button onClick={download} className="btn-secondary flex items-center gap-2 text-sm">
          <Download size={14} /> CSV
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center gap-2 text-green-700 mb-1">
            <TrendingUp size={16} /> <span className="text-sm font-medium">Total Earned</span>
          </div>
          <p className="text-2xl font-bold text-green-800">KES {totalEarned.toLocaleString()}</p>
        </div>
        <div className="card bg-amber-50 border-amber-200">
          <div className="flex items-center gap-2 text-amber-700 mb-1">
            <Clock size={16} /> <span className="text-sm font-medium">Pending</span>
          </div>
          <p className="text-2xl font-bold text-amber-800">KES {totalPending.toLocaleString()}</p>
        </div>
      </div>

      {payouts.length === 0 && (
        <div className="card text-center py-12 text-gray-400">
          <DollarSign size={40} className="mx-auto mb-3 opacity-20" />
          <p>No payouts yet.</p>
        </div>
      )}

      {payouts.length > 0 && (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Session</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Amount</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payouts.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(p.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                    {p.consultation?.consultation_id ?? '—'}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900 text-right">
                    KES {p.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>Payout schedule:</strong> Earnings from completed sessions are processed every Friday. Ensure your M-Pesa number is updated in your profile to receive payments.
      </div>
    </div>
  )
}
