/**
 * @module member-categories
 * @description
 * Hook untuk mengelola data kategori member (tingkat keanggotaan).
 * Digunakan di halaman manajemen kategori member, misalnya untuk dropdown
 * pilihan kategori saat registrasi member atau filter di tabel kategori.
 *
 * @see useMembers - hook terkait untuk data member
 * @see useAuth - dependency untuk auth token
 */
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/auth-context';
import { fetchMemberCategories } from '../api/member-categories-api';
import type { MemberCategory } from '../types/member-categories';

/**
 * Hook untuk mengambil dan mengelola daftar kategori member (misal: Gold, Silver, Bronze).
 *
 * Setiap kategori member punya `pointsConversionRate` yang menentukan berapa poin
 * yang didapat member saat transaksi. Misalnya: Rp 10.000 = 1 poin.
 *
 * **Contoh penggunaan di komponen:**
 * ```tsx
 * function MemberCategoryList() {
 *   const { categories, isLoading, loadMemberCategories } = useMemberCategories();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <ul>
 *       {categories.map(cat => (
 *         <li key={cat.id}>{cat.nama} — {cat.pointsConversionRate} poin per Rp 10rb</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 *
 * **Auto-load:** Hook langsung memuat data halaman 1 saat `activeToken` tersedia.
 * Panggil `loadMemberCategories()` ulang jika butuh refresh atau load dengan parameter lain.
 *
 * @returns Objek berisi state dan fungsi untuk mengelola kategori member
 */
export function useMemberCategories() {
  const { activeToken } = useAuth();
  const [categories, setCategories] = useState<MemberCategory[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(7);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  /**
   * Menormalkan data kategori member dari berbagai bentuk respons API.
   * Backend yang berbeda bisa pakai nama field berbeda (camelCase, snake_case, PascalCase).
   * Fungsi ini berusaha拿到 data dari semua kemungkinan nama field.
   *
   * @param item - Data mentah dari API (bisa berbagai format)
   * @returns Objek `MemberCategory` yang sudah distandarisasi
   *
   * @example
   * // Semua ini akan menghasilkan data yang sama:
   * normalizeMemberCategory({ id: 1, nama: 'Gold' })
   * normalizeMemberCategory({ Id: 1, name: 'Gold' })
   * normalizeMemberCategory({ member_category_id: 1, member_category_name: 'Gold' })
   */
  const normalizeMemberCategory = useCallback((item: any): MemberCategory => ({
    id: item?.id ?? item?.Id ?? item?.member_category_id ?? item?.memberCategoryId ?? 0,
    nama: item?.nama ?? item?.name ?? item?.member_category_name ?? '',
    pointsConversionRate: Number(item?.points_conversion_rate ?? item?.pointsConversionRate ?? 0),
    branchId: item?.branch_id ?? item?.branchId ?? '',
  }), []);

  /**
   * Memuat daftar kategori member dari API.
   *
   * @param requestedPage - Nomor halaman yang diminta (default: 1)
   * @param search - Kata kunci pencarian (default: '')
   * @returns Promise — data di-set ke state secara internal
   *
   * @remarks
   * - Jika `activeToken` kosong, state di-reset dan tidak ada request.
   * - Error ditampilkan via `apiError` state, bukan dilempar.
   * - Fungsi ini "defensive": gagal parse tidak throw, tapi set array kosong.
   *
   * @example
   * // Load halaman 2
   * loadMemberCategories(2);
   *
   * // Search kategori "Platinum"
   * loadMemberCategories(1, 'Platinum');
   */
  const loadMemberCategories = useCallback(async (requestedPage = 1, search = '') => {
    if (!activeToken) {
      setCategories([]);
      setTotal(0);
      setPage(1);
      setPerPage(7);
      setApiError(null);
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fetchMemberCategories(activeToken, { page: requestedPage, search });
      const payload = response as any;
      const rawData = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.data?.data)
          ? payload.data.data
          : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(payload?.rows)
              ? payload.rows
              : Array.isArray(payload)
                ? payload
                : [];

      const normalizedCategories = rawData.map(normalizeMemberCategory);
      const totalItems = payload?.total_items ?? payload?.pagination?.total ?? payload?.total ?? payload?.meta?.total ?? payload?.data?.total ?? normalizedCategories.length;
      const currentPage = payload?.current_page ?? payload?.pagination?.page ?? payload?.page ?? payload?.meta?.current_page ?? requestedPage;
      const nextPerPage = payload?.per_page ?? payload?.pagination?.per_page ?? payload?.meta?.per_page ?? 7;

      setCategories(normalizedCategories);
      setTotal(Number(totalItems ?? normalizedCategories.length));
      setPage(Number(currentPage ?? requestedPage));
      setPerPage(Number(nextPerPage ?? 7));
    } catch (error) {
      console.error(error);
      setCategories([]);
      setTotal(0);
      setApiError(error instanceof Error ? error.message : 'Gagal memuat kategori member.');
    } finally {
      setIsLoading(false);
    }
  }, [activeToken, normalizeMemberCategory]);

  useEffect(() => {
    if (!activeToken) return;
    void loadMemberCategories(1, '');
  }, [activeToken, loadMemberCategories]);

  return {
    /** Array kategori member hasil fetch. Kosong saat initial load atau error. */
    categories,
    /** Halaman aktif saat ini (1-based). */
    page,
    /** Fungsi untuk ganti halaman. */
    setPage,
    /** Jumlah item per halaman (default 7). */
    perPage,
    /** Total semua kategori member (dari pagination metadata). */
    total,
    /** True saat sedang memuat data dari API. */
    isLoading,
    /** Pesan error dari API, atau null jika tidak ada error. */
    apiError,
    /** Fungsi untuk memuat ulang data. Ambil signature: (page, search) */
    loadMemberCategories,
  };
}
