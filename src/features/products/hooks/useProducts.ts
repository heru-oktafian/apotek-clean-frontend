/**
 * @module products/useProducts
 * @description
 * Hook untuk mengelola data produk obat-obatan.
 * Produk adalah entitas utama di aplikasi apotek — semua transaksi (pembelian, penjualan, retur)
 * berputar di sekitar produk.
 *
 * Fitur utama:
 * - Fetch daftar produk dengan pagination + search
 * - Fetch combo (dropdown) untuk kategori produk dan satuan
 * - CRUD produk (create, update, delete) — lewat API functions langsung
 *
 * @see useCategories - hook terkait untuk data kategori produk
 * @see useUnits - hook terkait untuk data satuan
 * @see useAuth - dependency untuk auth token
 */
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/auth-context';
import { fetchProducts, fetchProductCategoriesCombo, fetchUnitsCombo } from '../api/products-api';
import type { Product, ProductCategory, Unit, ProductsListResponse } from '../types/products';

/**
 * State yang disimpan di dalam hook ini.
 */
interface UseProductsState {
  /** Array produk hasil fetch */
  products: Product[];
  /** Halaman aktif (1-based) */
  page: number;
  /** Jumlah item per halaman */
  perPage: number;
  /** Total semua produk (untuk pagination) */
  total: number;
  /** True saat sedang fetch data */
  isLoading: boolean;
  /** Pesan error kalau fetch gagal */
  apiError: string | null;
}

/**
 * State untuk data combo (dropdown).
 */
interface UseProductsComboState {
  /** Array kategori produk untuk dropdown */
  categories: ProductCategory[];
  /** Array satuan untuk dropdown */
  units: Unit[];
  /** True saat combo sedang dimuat */
  isComboLoading: boolean;
}

/**
 * Hook untuk mengambil dan mengelola daftar produk.
 *
 * **Auto-load:** Langsung memuat data halaman 1 begitu `activeToken` tersedia.
 * Data produk cukup "berat" (bisa ribuan item), makanya pakai pagination.
 *
 * **Contoh penggunaan:**
 * ```tsx
 * function ProductTable() {
 *   const { products, total, page, isLoading, loadProducts } = useProducts();
 *
 *   return (
 *     <>
 *       <Table data={products} />
 *       <Pagination
 *         page={page}
 *         total={total}
 *         onPageChange={(p) => loadProducts(p, searchTerm)}
 *       />
 *     </>
 *   );
 * }
 * ```
 *
 * **Contoh load dengan search:**
 * ```tsx
 * loadProducts(1, 'paracetamol'); // cari produk "paracetamol"
 * ```
 *
 * @returns Objek berisi state dan fungsi untuk mengelola produk
 */
export function useProducts() {
  const { activeToken } = useAuth();

  const [state, setState] = useState<UseProductsState>({
    products: [],
    page: 1,
    perPage: 20,
    total: 0,
    isLoading: false,
    apiError: null,
  });

  const [comboState, setComboState] = useState<UseProductsComboState>({
    categories: [],
    units: [],
    isComboLoading: false,
  });

  /**
   * Memuat daftar produk dari API.
   *
   * @param requestedPage - Halaman yang diminta (default: 1)
   * @param search - Kata kunci pencarian (default: '')
   */
  const loadProducts = useCallback(
    async (requestedPage = 1, search = '') => {
      if (!activeToken) {
        setState((prev) => ({
          ...prev,
          products: [],
          total: 0,
          page: 1,
          perPage: 20,
          apiError: null,
        }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, apiError: null }));

      try {
        const response = await fetchProducts(activeToken, requestedPage, search);
        const payload = response as unknown as ProductsListResponse;

        const rawData: Product[] = Array.isArray(payload.data)
          ? (payload.data as Product[])
          : Array.isArray((payload.data as Record<string, unknown>)?.data)
            ? ((payload.data as Record<string, unknown>).data as Product[])
            : [];

        setState({
          products: rawData,
          total: payload.total_items ?? rawData.length,
          page: payload.current_page ?? requestedPage,
          perPage: payload.per_page ?? 20,
          isLoading: false,
          apiError: null,
        });
      } catch (error) {
        console.error('[useProducts] Gagal memuat produk:', error);
        setState((prev) => ({
          ...prev,
          products: [],
          total: 0,
          isLoading: false,
          apiError: error instanceof Error ? error.message : 'Gagal memuat data produk.',
        }));
      }
    },
    [activeToken]
  );

  /**
   * Memuat data combo (kategori produk + satuan) untuk dropdown.
   * Combo ini biasanya dipakai di form produk (saat create/update).
   */
  const loadCombos = useCallback(async (search = '') => {
    if (!activeToken) return;

    setComboState((prev) => ({ ...prev, isComboLoading: true }));

    try {
      const [catRes, unitRes] = await Promise.all([
        fetchProductCategoriesCombo(activeToken, { search }),
        fetchUnitsCombo(activeToken, { search }),
      ]);

      setComboState({
        categories: (catRes as { data?: ProductCategory[] })?.data ?? [],
        units: (unitRes as { data?: Unit[] })?.data ?? [],
        isComboLoading: false,
      });
    } catch (error) {
      console.error('[useProducts] Gagal memuat combo:', error);
      setComboState((prev) => ({ ...prev, isComboLoading: false }));
    }
  }, [activeToken]);

  // Auto-load saat token tersedia
  useEffect(() => {
    if (!activeToken) return;
    void loadProducts(1, '');
    void loadCombos('');
  }, [activeToken, loadProducts, loadCombos]);

  return {
    /** Array produk hasil fetch */
    products: state.products,
    /** Halaman aktif (1-based) */
    page: state.page,
    /** Fungsi untuk navigasi halaman — panggil juga dengan search term */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setPage: (_page: number) => {
      setState((prev) => ({ ...prev, page: _page }));
      void loadProducts(_page, '');
    },
    /** Jumlah item per halaman */
    perPage: state.perPage,
    /** Total semua produk */
    total: state.total,
    /** True saat sedang fetch data produk */
    isLoading: state.isLoading,
    /** Pesan error kalau fetch gagal */
    apiError: state.apiError,
    /** Fungsi utama untuk memuat produk — panggil ulang untuk refresh/search */
    loadProducts,
    /** Array kategori produk untuk dropdown */
    categories: comboState.categories,
    /** Array satuan untuk dropdown */
    units: comboState.units,
    /** True saat sedang fetch data combo */
    isComboLoading: comboState.isComboLoading,
    /** Fungsi untuk memuat ulang combo */
    loadCombos,
  };
}
