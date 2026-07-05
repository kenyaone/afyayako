import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../api/axios'
import { useAuthStore } from '../store/authStore'

const HEARTBEAT_MS = 25_000

// Activated once per authenticated session from Layout.
// Sends a heartbeat every 25s and marks the user offline on unmount / logout.
export function usePresenceHeartbeat() {
  const user = useAuthStore(s => s.user)
  const location = useLocation()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const beat = (page: string) => {
    api.post('/presence/heartbeat', { page }).catch(() => {})
  }

  useEffect(() => {
    if (!user) return

    // Immediate first beat
    beat(location.pathname)

    intervalRef.current = setInterval(() => {
      beat(location.pathname)
    }, HEARTBEAT_MS)

    // On page unload, fire a beacon so the server knows the user left
    const handleUnload = () => {
      const token = localStorage.getItem('token')
      if (navigator.sendBeacon && token) {
        navigator.sendBeacon(
          `${import.meta.env.VITE_API_URL ?? '/api'}/presence/offline-beacon?token=${encodeURIComponent(token)}`
        )
      } else {
        api.post('/presence/offline').catch(() => {})
      }
    }
    window.addEventListener('beforeunload', handleUnload)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      window.removeEventListener('beforeunload', handleUnload)
      api.post('/presence/offline').catch(() => {})
    }
  }, [user?.id]) // restart only if user changes

  // Re-beat on every route change so current_page stays accurate
  useEffect(() => {
    if (user) beat(location.pathname)
  }, [location.pathname])
}
