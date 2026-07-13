/**
 * @module unit-conversions/useUnitConversions
 * @description
 * Hook untuk mengelola data konversi satuan produk.
 * Konversi satuan dipakai saat produk bisa dijual dalam satuan yang berbeda.
 * Contoh: 1 box = 10 strip, 1 strip = 12 tablet.
 *
 * Konversi ini penting buat:
 * - POS: Konversi otomatis antara satuan beli dan satuan jual
 * - Stok: Tracking stok di berbagai satuan
 * - Laporan:统一 laporan dalam satuan yang konsisten
 *
 * @see useUnits - hook terkait untuk data satuan
 * @see useProducts - hook terkait untuk data produk
 * @see useAuth - dependency untuk auth token
 */
import { useState, useEffect, useCallback } from 'react';
import { fetchUnitConversions } from '../api/unit-conversions-api';
import type { UnitConversion } from '../types/unit-conversions';

/**
 * State yang disimpan di dalam hook ini.
 */
interface UseUnitConversionsState {
  /** Array konversi satuan hasil fetch */
  unitConversions: NormalizedUnitConversion[];
  /** Total semua konversi (untuk pagination) */
  total: number;
  /** Halaman aktif (1-based) */
  page: number;
  /** Jumlah item per halaman */
  perPage: number;
  /** True saat sedang fetch data */
  isLoading: boolean;
  /** Pesan error kalau fetch gagal */
  error: string | null;
}

/**
 * Versi normalisasi dari UnitConversion.
 * Backend suka pakai nama field berbeda-beda (camelCase, snake_case, PascalCase).
 * Hook ini menormalisasi semuanya jadi satu bentuk konsisten.
 */
export interface NormalizedUnitConversion {
  id: number | string | null;
  product_id: number | string | null;
  product_name: string | null;
  from_unit_id: number | string | null;
  from_unit_name: string | null;
  to_unit_id: number | string | null;
  to_unit_name: string | null;
  conversion_value: number | string | null;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Hook untuk mengambil dan mengelola daftar konversi satuan.
 *
 * **Auto-load:** Langsung memuat data halaman 1 begitu `activeToken` tersedia.
 *
 * **Normalisasi data:**
 * Backend bisa pakai nama field berbeda. Hook ini menormalisasi
 * semua kemungkinan ke satu format konsisten. Contoh:
 * - `product_name` atau `productName` atau `product.name`
 * - `from_unit_id` atau `init_id` atau `fromUnit.id`
 *
 * **Contoh penggunaan:**
 * ```tsx
 * function UnitConversionTable() {
 *   const { unitConversions, isLoading, loadUnitConversions } = useUnitConversions();
 *
 *   return (
 *     <Table
 *       data={unitConversions}
 *       columns={[
 *         { key: 'product_name', header: 'Produk' },
 *         { key: 'from_unit_name', header: 'Satuan Awal' },
 *         { key: 'to_unit_name', header: 'Satuan Konversi' },
 *         { key: 'conversion_value', header: 'Nilai' },
 *       ]}
 *     />
 *   );
 * }
 * ```
 *
 * @returns Objek berisi state dan fungsi untuk mengelola konversi satuan
 */
export function useUnitConversions(token: string) {
  const [state, setState] = useState<UseUnitConversionsState>({
    unitConversions: [],
    total: 0,
    page: 1,
    perPage: 10,
    isLoading: false,
    error: null,
  });

  /**
   * Menormalisasi satu item konversi dari berbagai format API.
   *
   * Backend suka pakai nama field beda-beda. Fungsi ini拿到 data
   * dari semua kemungkinan nama field dan return satu format konsisten.
   *
   * @param item - Data mentah dari API
   * @returns Objek konversi yang sudah normalisasi
   */
  const normalizeItem = useCallback((item: Record<string, unknown>): NormalizedUnitConversion => {
    // Nested objects — produk, from_unit, to_unit bisa ada di nested object atau flat
    const productObj = (item.product ?? item.product_info ?? null) as Record<string, unknown> | null;
    const fromUnitObj = (item.from_unit ?? item.init ?? null) as Record<string, unknown> | null;
    const toUnitObj = (item.to_unit ?? item.final ?? null) as Record<string, unknown> | null;

    return {
      id: (item.id ?? item._id ?? null) as NormalizedUnitConversion['id'],
      product_id: (item.product_id ?? productObj?.id ?? item.productCode ?? item.product_code ?? item.product ?? null) as NormalizedUnitConversion['product_id'],
      product_name: (item.product_name ?? productObj?.name ?? productObj?.nama ?? item.productName ?? null) as NormalizedUnitConversion['product_name'],
      from_unit_id: (item.from_unit_id ?? item.init_id ?? fromUnitObj?.id ?? fromUnitObj?.unit_id ?? null) as NormalizedUnitConversion['from_unit_id'],
      from_unit_name: (item.from_unit_name ?? fromUnitObj?.name ?? fromUnitObj?.nama ?? item.init_name ?? null) as NormalizedUnitConversion['from_unit_name'],
      to_unit_id: (item.to_unit_id ?? item.final_id ?? toUnitObj?.id ?? toUnitObj?.unit_id ?? null) as NormalizedUnitConversion['to_unit_id'],
      to_unit_name: (item.to_unit_name ?? toUnitObj?.name ?? toUnitObj?.nama ?? item.final_name ?? null) as NormalizedUnitConversion['to_unit_name'],
      conversion_value: (item.conversion_value ?? item.value_conv ?? item.valueConv ?? item.value ?? null) as NormalizedUnitConversion['conversion_value'],
      created_at: (item.created_at ?? item.createdAt ?? null) as NormalizedUnitConversion['created_at'],
      updated_at: (item.updated_at ?? item.updatedAt ?? null) as NormalizedUnitConversion['updated_at'],
    };
  }, []);

  /**
   * Memuat daftar konversi satuan dari API.
   *
   * @param requestedPage - Halaman yang diminta (default: 1)
   * @param search - Kata kunci pencarian (default: '')
   */
  const loadUnitConversions = useCallback(
    async (requestedPage = 1, search = '') => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetchUnitConversions(token, {
          page: requestedPage,
          per_page: state.perPage,
          search,
        });

        const payload = response as unknown as Record<string, unknown>;

        // Tangani berbagai format array: payload.data, payload.data.items, payload langsung
        const rawData: Record<string, unknown>[] = Array.isArray(payload.data)
          ? (payload.data as Record<string, unknown>[])
          : Array.isArray((payload.data as Record<string, unknown>)?.items)
            ? ((payload.data as Record<string, unknown>).items as Record<string, unknown>[])
            : Array.isArray(payload)
              ? (payload as Record<string, unknown>[])
              : [];

        // Parse pagination metadata
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
          state.perPage;

        // Normalisasi setiap item
        const normalizedData = (rawData as Record<string, unknown>[]).map((item) =>
          normalizeItem(item)
        );

        setState({
          unitConversions: normalizedData,
          total: totalItems,
          page: currentPage,
          perPage,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data konversi satuan';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
      }
    },
    [token, state.perPage, normalizeItem]
  );

  // Auto-load saat token berubah
  useEffect(() => {
    if (token) {
      void loadUnitConversions(1);
    }
  }, [token, loadUnitConversions]);

  return {
    /** Array konversi satuan yang sudah normalisasi */
    unitConversions: state.unitConversions,
    /** Total semua konversi */
    total: state.total,
    /** Halaman aktif (1-based) */
    page: state.page,
    /** Jumlah item per halaman */
    perPage: state.perPage,
    /** True saat sedang fetch data */
    isLoading: state.isLoading,
    /** Pesan error kalau fetch gagal */
    error: state.error,
    /** Fungsi untuk memuat data — panggil ulang untuk refresh/search */
    loadUnitConversions,
  };
}
