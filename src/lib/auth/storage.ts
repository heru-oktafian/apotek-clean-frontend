import type { BranchOption, ProfileData } from '../../types/api'

const PRE_BRANCH_TOKEN_KEY = 'apotek.preBranchToken'
const ACTIVE_TOKEN_KEY = 'apotek.activeToken'
const ACTIVE_BRANCH_KEY = 'apotek.activeBranch'
const PROFILE_KEY = 'apotek.profile'

function safeRead<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function safeWrite<T>(key: string, value: T | null) {
  if (value === null) {
    localStorage.removeItem(key)
    return
  }

  localStorage.setItem(key, JSON.stringify(value))
}

export const authStorage = {
  getPreBranchToken: () => localStorage.getItem(PRE_BRANCH_TOKEN_KEY),
  setPreBranchToken: (token: string | null) => {
    if (token) localStorage.setItem(PRE_BRANCH_TOKEN_KEY, token)
    else localStorage.removeItem(PRE_BRANCH_TOKEN_KEY)
  },
  getActiveToken: () => localStorage.getItem(ACTIVE_TOKEN_KEY),
  setActiveToken: (token: string | null) => {
    if (token) localStorage.setItem(ACTIVE_TOKEN_KEY, token)
    else localStorage.removeItem(ACTIVE_TOKEN_KEY)
  },
  getActiveBranch: () => safeRead<BranchOption>(ACTIVE_BRANCH_KEY),
  setActiveBranch: (branch: BranchOption | null) => safeWrite(ACTIVE_BRANCH_KEY, branch),
  getProfile: () => safeRead<ProfileData>(PROFILE_KEY),
  setProfile: (profile: ProfileData | null) => safeWrite(PROFILE_KEY, profile),
  clear: () => {
    localStorage.removeItem(PRE_BRANCH_TOKEN_KEY)
    localStorage.removeItem(ACTIVE_TOKEN_KEY)
    localStorage.removeItem(ACTIVE_BRANCH_KEY)
    localStorage.removeItem(PROFILE_KEY)
  },
}
