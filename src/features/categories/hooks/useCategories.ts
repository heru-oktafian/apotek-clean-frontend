/**
 * @module categories/useCategories
 * @description
 * Hook untuk mengelola data kategori produk (product categories).
 * Kategori produk digunakan untuk mengelompokkan produk obat-obatan berdasarkan
 * jenisnya, misalnya: "Obat Keras", "Obat Bebas", "Vitamin", "Alat Kesehatan", dll.
 *
 * @see useProducts - hook terkait untuk data produk
 * @see useAuth - dependency untuk auth token
 */
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/auth-context';
import { fetchCategories } from '../api/categories-api';
import type { Category } from '../types/categories';

/**
 * State yang disimpan di dalam hook ini.
 * Dipisah jadi interface supaya namanya jelas dan gampang dibaca.
 */
interface UseCategoriesState {
  /** Array kategori produk hasil fetch dari API */
  categories: Category[];
  /** Halaman aktif saat ini (1-based) */
  page: number;
  /** Jumlah item per halaman */
  perPage: number;
  /** Total semua kategori (untuk pagination) */
  total: number;
  /** True saat sedang memuat data dari API */
  isLoading: boolean;
  /** Pesan error kalau fetch gagal, null kalau tidak ada error */
  apiError: string | null;
}

/**
 * Hook untuk mengambil dan mengelola daftar kategori produk.
 *
 * **Auto-load:** Langsung memuat data halaman 1 begitu `activeToken` tersedia.
 * Panggil `loadCategories()` ulang kalau butuh refresh atau load halaman lain.
 *
 * **Contoh penggunaan:**
 * ```tsx
 * function CategoryDropdown() {
 *   const { categories, isLoading } = useCategories();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <select>
 *       {categories.map(cat => (
 *         <option key={cat.id} value={cat.id}>{cat.nama}</option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 *
 * @returns Objek berisi state dan fungsi untuk mengelola kategori produk
 */
export function useCategories() {
  const { activeToken } = useAuth();

  const [state, setState] = useState<UseCategoriesState>({
    categories: [],
    page: 1,
    perPage: 7,
    total: 0,
    isLoading: false,
    apiError: null,
  });

  /**
   * Memuat daftar kategori produk dari API.
   *
   * Fungsi ini "defensive" — gagal parse tidak throw error,
   * tapi set array kosong dan tampilkan error message lewat `apiError`.
   *
   * @param requestedPage - Nomor halaman yang diminta (default: 1)
   * @param search - Kata kunci pencarian (default: '')
   */
  const loadCategories = useCallback(
    async (requestedPage = 1, search = '') => {
      // Kalau nggak ada token, reset state
      if (!activeToken) {
        setState((prev) => ({
          ...prev,
          categories: [],
          total: 0,
          page: 1,
          perPage: 7,
          apiError: null,
        }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, apiError: null }));

      try {
        const response = await fetchCategories(activeToken, { page: requestedPage, search });
        const payload = response as unknown as Record<string, unknown>;

        // Tangani berbagai format respons API — map field API ke type Category
        const rawItems = Array.isArray(payload.data)
          ? (payload.data as Record<string, unknown>[])
          : Array.isArray((payload.data as Record<string, unknown>)?.data)
            ? ((payload.data as Record<string, unknown>)?.data as Record<string, unknown>[])
            : Array.isArray((payload.data as Record<string, unknown>)?.items)
              ? ((payload.data as Record<string, unknown>)?.items as Record<string, unknown>[])
              : Array.isArray((payload.data as Record<string, unknown>)?.rows)
                ? ((payload.data as Record<string, unknown>)?.rows as Record<string, unknown>[])
                : [];

        const rawData: Category[] = rawItems.map((item) => ({
          id: (item.product_category_id ?? item.id ?? item.category_id ?? 0) as number,
          nama: (item.product_category_name ?? item.nama ?? item.name ?? item.category_name ?? '') as string,
        }));

        // Parse pagination metadata — backend beda-beda formatnya
        const totalItems =
          (payload.total_items as number) ??
          ((payload.pagination as Record<string, number>)?.total) ??
          (payload.total as number) ??
          ((payload.meta as Record<string, number>)?.total) ??
          ((payload.data as Record<string, number>)?.total as number) ??
          rawData.length;

        const currentPage =
          (payload.current_page as number) ??
          ((payload.pagination as Record<string, number>)?.page) ??
          (payload.page as number) ??
          ((payload.meta as Record<string, number>)?.current_page) ??
          requestedPage;

        const perPage =
          (payload.per_page as number) ??
          ((payload.pagination as Record<string, number>)?.per_page) ??
          ((payload.meta as Record<string, number>)?.per_page) ??
          7;

        setState((prev) => ({
          ...prev,
          categories: rawData,
          total: Number(totalItems ?? rawData.length),
          page: Number(currentPage ?? requestedPage),
          perPage: Number(perPage ?? 7),
          isLoading: false,
        }));
      } catch (error) {
        console.error('[useCategories] Gagal memuat kategori:', error);
        setState((prev) => ({
          ...prev,
          categories: [],
          total: 0,
          isLoading: false,
          apiError: error instanceof Error ? error.message : 'Gagal memuat kategori produk.',
        }));
      }
    },
    [activeToken]
  );

  // Auto-load saat token berubah
  useEffect(() => {
    if (!activeToken) return;
    void loadCategories(1, '');
  }, [activeToken, loadCategories]);

  return {
    /** Array kategori produk hasil fetch */
    categories: state.categories,
    /** Halaman aktif (1-based) */
    page: state.page,
    /** Fungsi untuk navigasi halaman */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setPage: (_page: number) => {
      setState((prev) => ({ ...prev, page: _page }));
      void loadCategories(_page, '');
    },
    /** Jumlah item per halaman */
    perPage: state.perPage,
    /** Total semua kategori produk */
    total: state.total,
    /** True saat sedang fetch data */
    isLoading: state.isLoading,
    /** Pesan error, null kalau aman */
    apiError: state.apiError,
    /** Fungsi utama untuk memuat data — panggil ulang untuk refresh */
    loadCategories,
  };
}
