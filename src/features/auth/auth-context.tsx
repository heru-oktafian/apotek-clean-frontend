import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { BranchOption, ProfileData } from '../../types/api'
import { authStorage } from '../../lib/auth/storage'
import { clearMenuCache } from '../menu/hooks/useMenu'

// ═══════════════════════════════════════════════════════════════════════════
// Auth Context & Session Management
// ═══════════════════════════════════════════════════════════════════════════
// Manage: token, branch, profile, logout
//
// Saat logout:
// 1. Clear semua localStorage auth (token, branch, profile)
// 2. Clear semua menu cache (sessionStorage + Promise cache)
// 3. Reset state ke null → trigger redirect ke /login
//
// Alasan clear menu cache saat logout:
// - Token baru akan berbeda
// - Cache menu lama tidak relevan untuk user/branch baru
// - Privacy: data menu user A tidak tersisa untuk user B
// ═══════════════════════════════════════════════════════════════════════════

interface AuthContextValue {
  preBranchToken: string | null
  activeToken: string | null
  activeBranch: BranchOption | null
  profile: ProfileData | null
  setPreBranchToken: (token: string | null) => void
  setActiveToken: (token: string | null) => void
  setActiveBranch: (branch: BranchOption | null) => void
  setProfile: (profile: ProfileData | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [preBranchToken, setPreBranchTokenState] = useState<string | null>(() => authStorage.getPreBranchToken())
  const [activeToken, setActiveTokenState] = useState<string | null>(() => authStorage.getActiveToken())
  const [activeBranch, setActiveBranchState] = useState<BranchOption | null>(() => authStorage.getActiveBranch())
  const [profile, setProfileState] = useState<ProfileData | null>(() => authStorage.getProfile())

  const value = useMemo<AuthContextValue>(
    () => ({
      preBranchToken,
      activeToken,
      activeBranch,
      profile,
      setPreBranchToken: (token) => {
        authStorage.setPreBranchToken(token)
        setPreBranchTokenState(token)
      },
      setActiveToken: (token) => {
        authStorage.setActiveToken(token)
        setActiveTokenState(token)
      },
      setActiveBranch: (branch) => {
        authStorage.setActiveBranch(branch)
        setActiveBranchState(branch)
      },
      setProfile: (nextProfile) => {
        authStorage.setProfile(nextProfile)
        setProfileState(nextProfile)
      },
      logout: () => {
        authStorage.clear()
        clearMenuCache()
        setPreBranchTokenState(null)
        setActiveTokenState(null)
        setActiveBranchState(null)
        setProfileState(null)
      },
    }),
    [activeBranch, activeToken, preBranchToken, profile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
