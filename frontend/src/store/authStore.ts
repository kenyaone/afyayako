import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  refresh: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string, refresh: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refresh: null,
      isAuthenticated: false,
      setAuth: (user, token, refresh) => set({ user, token, refresh, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, refresh: null, isAuthenticated: false }),
      updateUser: (updated) => set((state) => ({
        user: state.user ? { ...state.user, ...updated } : null,
      })),
    }),
    { name: 'mhap-auth' }
  )
)
