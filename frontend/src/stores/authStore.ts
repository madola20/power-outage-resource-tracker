import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../types'
import { authService } from '../services/authService'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null })
        try {
          const response: AuthResponse = await authService.login(credentials)
          set({
            user: response.user,
            token: response.token,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          set({
            user: null,
            token: null,
            isLoading: false,
            error: error.message || 'Login failed',
          })
          throw error
        }
      },

      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null })
        try {
          const response: AuthResponse = await authService.register(userData)
          set({
            user: response.user,
            token: response.token,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          set({
            user: null,
            token: null,
            isLoading: false,
            error: error.message || 'Registration failed',
          })
          throw error
        }
      },

      logout: async () => {
        try {
          // Call backend logout endpoint to invalidate token
          await authService.logout()
        } catch (error) {
          // Even if backend logout fails, we still want to clear local state
          console.error('Logout error:', error)
        } finally {
          // Always clear local state and storage
          set({ user: null, token: null, error: null })
          localStorage.removeItem('auth-storage')
        }
      },

      checkAuth: async () => {
        const { token } = get()
        if (!token) return

        set({ isLoading: true })
        try {
          const user = await authService.getProfile()
          set({ user, isLoading: false })
        } catch (error) {
          set({ user: null, token: null, isLoading: false })
          localStorage.removeItem('auth-storage')
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)
