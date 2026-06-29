import { useEffect, useState } from 'react'
import { useAuth } from '../auth-context'
import { apiRequest } from '../../../lib/api/client'
import type { ProfileData } from '../../../types/api'

/**
 * Hook untuk validasi token sebelum render protected pages
 *
 * Flow:
 * 1. Saat komponen mount, cek apakah activeToken ada
 * 2. Jika ada, lakukan API call ke /api/profile untuk validasi token
 * 3. Jika berhasil, set isValid = true
 * 4. Jika gagal (401, expired, etc), call logout() dan redirect ke /login
 * 5. Selama validasi pending, state loading = true
 *
 * Returns:
 * - isValid: boolean - token valid atau tidak
 * - isLoading: boolean - validasi sedang berlangsung
 * - error: string | null - pesan error jika ada
 */
export function useTokenValidation() {
  const { activeToken, logout, setProfile } = useAuth()
  const [isValid, setIsValid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!activeToken) {
      setIsValid(false)
      setIsLoading(false)
      return
    }

    let isMounted = true

    async function validateToken() {
      try {
        setIsLoading(true)
        setError(null)

        // Validasi token dengan call ke profile endpoint
        const profile = await apiRequest<ProfileData>('/api/profile', {
          token: activeToken,
        })

        if (isMounted) {
          // Token valid, simpan profile ke context
          setProfile(profile)
          setIsValid(true)
          setIsLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Token validation failed'
          console.warn('[useTokenValidation] Token invalid or expired:', errorMessage)

          // Token expired atau invalid, logout dan redirect ke login
          setError(errorMessage)
          setIsValid(false)
          setIsLoading(false)

          // Trigger logout untuk clear session
          logout()
        }
      }
    }

    validateToken()

    return () => {
      isMounted = false
    }
  }, [activeToken, logout, setProfile])

  return { isValid, isLoading, error }
}
