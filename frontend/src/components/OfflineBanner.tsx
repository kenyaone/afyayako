import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

export default function OfflineBanner() {
  const isOnline = useOnlineStatus()
  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-sm font-medium flex items-center justify-center gap-2 py-2 shadow-md">
      <WifiOff size={15} />
      You're offline — showing cached data. Some features require an internet connection.
    </div>
  )
}
