/**
 * @module members/useMembers
 * @description
 * Hook untuk mengelola data member (pelanggan loyalty).
 * Member adalah customer yang terdaftar dalam program keanggotaan apotek.
 * Tiap member punya tingkat/ kategori (Gold, Silver, Bronze) yang
 * menentukan jumlah poin yang didapat dari setiap transaksi.
 *
 * Data member dipakai di:
 * - Halaman daftar member
 * - Form registrasi member baru
 * - POS saat input data pasien
 *
 * @see useMemberCategories - hook terkait untuk kategori/tingkat member
 * @see useAuth - dependency untuk auth token
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/auth-context';
import { fetchMembers } from '../api/members-api';
import type { Member } from '../types/members';

/**
 * State yang disimpan di dalam hook ini.
 */
interface UseMembersState {
  /** Array member hasil fetch */
  members: Member[];
  /** Total semua member (untuk pagination) */
  total: number;
  /** Halaman aktif (1-based) */
  page: number;
  /** Jumlah item per halaman (default: 10) */
  perPage: number;
  /** True saat sedang fetch data */
  isLoading: boolean;
  /** Pesan error kalau fetch gagal */
  error: string | null;
}

/**
 * Hook untuk mengambil dan mengelola daftar member.
 *
 * **Auto-load:** Langsung memuat data halaman 1 begitu `activeToken` tersedia.
 *
 * **Contoh penggunaan:**
 * ```tsx
 * function MemberTable() {
 *   const { members, total, isLoading, loadMembers } = useMembers();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <>
 *       <Table data={members} />
 *       <Pagination
 *         page={page}
 *         total={total}
 *         onPageChange={(p) => loadMembers(p, search)}
 *       />
 *     </>
 *   );
 * }
 * ```
 *
 * @returns Objek berisi state dan fungsi untuk mengelola member
 */
export function useMembers() {
  const { activeToken } = useAuth();

  const [state, setState] = useState<UseMembersState>({
    members: [],
    total: 0,
    page: 1,
    perPage: 10,
    isLoading: false,
    error: null,
  });

  /**
   * Memuat daftar member dari API.
   *
   * @param requestedPage - Halaman yang diminta (default: 1)
   * @param search - Kata kunci pencarian (default: '')
   */
  const loadMembers = useCallback(
    async (requestedPage = 1, search = '') => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      if (!activeToken) {
        setState((prev) => ({ ...prev, members: [], total: 0, isLoading: false, error: 'Token tidak tersedia.' }));
        return;
      }

      try {
        const response = await fetchMembers(activeToken, {
          page: requestedPage,
          search,
        });

        const payload = response as unknown as Record<string, unknown>;
        const rawData = Array.isArray(payload.data) ? payload.data : [];

        setState({
          members: rawData as Member[],
          total: (payload.total_items as number) ?? rawData.length,
          page: (payload.current_page as number) ?? requestedPage,
          perPage: (payload.per_page as number) ?? state.perPage,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data member';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
      }
    },
    [state.perPage]
  );

  // Auto-load saat pertama mount
  useEffect(() => {
    void loadMembers(1);
  }, [loadMembers]);

  return {
    /** Array member hasil fetch */
    members: state.members,
    /** Total semua member */
    total: state.total,
    /** Halaman aktif (1-based) */
    page: state.page,
    /** Fungsi navigasi halaman */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setPage: (_page: number) => {
      setState((prev) => ({ ...prev, page: _page }));
      void loadMembers(_page, '');
    },
    /** Jumlah item per halaman */
    perPage: state.perPage,
    /** True saat sedang fetch data */
    isLoading: state.isLoading,
    /** Pesan error kalau fetch gagal */
    error: state.error,
    /** Fungsi untuk memuat data — panggil ulang untuk refresh/search */
    loadMembers,
  };
}
