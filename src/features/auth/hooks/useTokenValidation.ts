/**
 * @module auth/useTokenValidation
 * @description
 * Hook untuk memvalidasi token autentikasi user.
 * Biasanya dipakai saat pertama kali aplikasi dimuat (app startup) untuk ngecek
 * apakah token yang tersimpan di localStorage/sessionStorage masih valid atau tidak.
 *
 * Fitur utama:
 * - Validasi token sebelum user dianggap "login"
 * - Update state autentikasi (useAuth) berdasarkan hasil validasi
 * - Handle redirect ke halaman login kalau token invalid/expired
 *
 * @example
 * ```tsx
 * function AppStartup() {
 *   const { isValid, isLoading } = useTokenValidation();
 *
 *   if (isLoading) return <SplashScreen />;
 *   if (!isValid) return <Navigate to="/login" />;
 *
 *   return <Dashboard />;
 * }
 * ```
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../auth-context';
import { authStorage } from '../../../lib/auth/storage';
interface UseTokenValidationReturn {
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook untuk memvalidasi token autentikasi user yang sedang aktif.
 *
 * Proses validasi biasanya melibatkan:
 * 1. Ambil token dari useAuth context
 * 2. Panggil API validasi token ke backend
 * 3. Update useAuth state berdasarkan hasil
 *
 * @returns { isValid, isLoading, error }
 * - `isValid`: true kalau token masih berlaku
 * - `isLoading`: true mentre validasi berlangsung
 * - `error`: pesan error kalau validasi gagal
 */
export function useTokenValidation(): UseTokenValidationReturn {
  const { activeToken, setActiveToken } = useAuth();
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validate = async () => {
      if (!activeToken) {
        setIsValid(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // TODO: Panggil endpoint validasi token ke backend
        // Contoh: const result = await validateToken(activeToken);
        // setIsValid(result.valid);
        // if (result.user) setToken(result.user, activeToken);

        // Untuk sekarang, token dianggap valid selama ada
        setIsValid(true);
      } catch (err) {
        setIsValid(false);
        setError(err instanceof Error ? err.message : 'Token validasi gagal');
        setActiveToken(null);
        authStorage.setActiveToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    void validate();
  }, [activeToken, setActiveToken]);

  return { isValid, isLoading, error };
}
