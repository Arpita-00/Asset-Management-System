import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000 // 8 hours

/**
 * Authentication store — persisted to localStorage.
 * Holds user, token, auth state, and session expiry.
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      user:            null,
      accessToken:     null,
      refreshToken:    null,
      isAuthenticated: false,
      loginAt:         null,  // timestamp of last login (ms)

      // ─── Actions ────────────────────────────────────────────────────────────
      setAuth: (data) => set({
        user: {
          id:         data.userId,
          email:      data.email,
          firstName:  data.firstName,
          lastName:   data.lastName,
          roles:      data.roles || [],
          avatarUrl:  data.avatarUrl,
          department: data.department,
          loginCount: data.loginCount,
          lastLoginAt: data.lastLoginAt,
        },
        accessToken:     data.accessToken,
        refreshToken:    data.refreshToken,
        isAuthenticated: true,
        loginAt:         Date.now(),
      }),

      updateToken: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      updateUser: (userData) => set(state => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),

      logout: () => set({
        user:            null,
        accessToken:     null,
        refreshToken:    null,
        isAuthenticated: false,
        loginAt:         null,
      }),

      // ─── Session helpers ───────────────────────────────────────────────────
      /** Returns true if the stored session is within SESSION_DURATION_MS */
      isSessionValid: () => {
        const { isAuthenticated, loginAt } = get()
        if (!isAuthenticated || !loginAt) return false
        return (Date.now() - loginAt) < SESSION_DURATION_MS
      },

      /** Remaining session time in ms (0 if expired) */
      sessionRemainingMs: () => {
        const { loginAt } = get()
        if (!loginAt) return 0
        return Math.max(0, SESSION_DURATION_MS - (Date.now() - loginAt))
      },

      // ─── Role Helpers ────────────────────────────────────────────────────────
      isSuperAdmin: () => get().user?.roles?.includes('ROLE_SUPER_ADMIN') ?? false,
      isAdmin: () => {
        const roles = get().user?.roles ?? []
        return roles.includes('ROLE_ADMIN') || roles.includes('ROLE_SUPER_ADMIN')
      },
      isEmployee: () => get().user?.roles?.includes('ROLE_EMPLOYEE') ?? false,
      hasRole:    (role) => get().user?.roles?.includes(role) ?? false,
      getFullName: () => {
        const u = get().user
        return u ? `${u.firstName} ${u.lastName}` : ''
      },
    }),
    {
      name: 'ams-auth',
      partialize: (state) => ({
        user:            state.user,
        accessToken:     state.accessToken,
        refreshToken:    state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        loginAt:         state.loginAt,
      }),
    }
  )
)

export default useAuthStore
