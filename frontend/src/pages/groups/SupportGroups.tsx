import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { Users, MessageCircle, ChevronRight, Loader2 } from 'lucide-react'
import { useT } from '../../contexts/I18nContext'

interface Group {
  id: number
  name: string
  slug: string
  description: string
  category: string
  icon: string
  member_count: number
  is_member: boolean
}

const CATEGORY_COLORS: Record<string, string> = {
  depression: 'bg-blue-100 text-blue-700',
  anxiety: 'bg-green-100 text-green-700',
  addiction: 'bg-orange-100 text-orange-700',
  gambling: 'bg-purple-100 text-purple-700',
  tobacco: 'bg-gray-100 text-gray-700',
  grief: 'bg-rose-100 text-rose-700',
  relationship: 'bg-pink-100 text-pink-700',
}

export default function SupportGroups() {
  const { t } = useT()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState<number | null>(null)

  useEffect(() => {
    api.get('/groups')
      .then(r => setGroups(r.data.groups ?? []))
      .finally(() => setLoading(false))
  }, [])

  const join = async (g: Group) => {
    setJoining(g.id)
    try {
      await api.post(`/groups/${g.id}/join`)
      setGroups(prev => prev.map(x => x.id === g.id ? { ...x, is_member: true, member_count: x.member_count + 1 } : x))
    } catch (e: any) {
      if (e.response?.status === 200) {
        setGroups(prev => prev.map(x => x.id === g.id ? { ...x, is_member: true } : x))
      }
    } finally { setJoining(null) }
  }

  const leave = async (g: Group) => {
    try {
      await api.delete(`/groups/${g.id}/leave`)
      setGroups(prev => prev.map(x => x.id === g.id ? { ...x, is_member: false, member_count: Math.max(0, x.member_count - 1) } : x))
    } catch {}
  }

  if (loading) return <div className="text-center py-10 text-gray-400">{t('loading')}</div>

  const myGroups = groups.filter(g => g.is_member)
  const allGroups = groups.filter(g => !g.is_member)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('supportGroupsTitle')}</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Anonymous peer support. Your identity is protected — you choose a random alias when joining.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Groups are created and moderated by our clinical team. New groups are added regularly.
        </p>
      </div>

      {myGroups.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">{t('joinedGroups')}</h2>
          <div className="space-y-3">
            {myGroups.map(g => (
              <div key={g.id} className="card border-l-4 border-primary-400 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl">{g.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm">{g.name}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Users size={11} /> {g.member_count} {t('members')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/groups/${g.id}`}
                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    <MessageCircle size={12} /> Open <ChevronRight size={12} />
                  </Link>
                  <button
                    onClick={() => leave(g)}
                    className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 py-1.5 px-3 rounded-lg transition-colors"
                  >
                    {t('leaveGroup')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">All Groups</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {allGroups.map(g => (
            <div key={g.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <span className="text-3xl mt-0.5">{g.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{g.name}</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[g.category] ?? 'bg-gray-100 text-gray-600'}`}>
                      {g.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{g.description}</p>
                  <div className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                    <Users size={11} /> {g.member_count} {t('members')}
                  </div>
                </div>
              </div>
              <button
                onClick={() => join(g)}
                disabled={joining === g.id}
                className="w-full mt-3 btn-primary text-sm py-2 flex items-center justify-center gap-1.5"
              >
                {joining === g.id ? <Loader2 size={14} className="animate-spin" /> : null}
                {t('joinGroup')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
