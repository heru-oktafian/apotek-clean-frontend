/**
 * @module daily-assets/hooks
 * @description Custom hook untuk mengelola state data Laporan Asset
 */
import { useState, useEffect, useCallback } from 'react';
import { fetchDailyAssets, type FetchDailyAssetsParams, type PaginatedResponse } from '../api/daily-assets-api';
import type { DailyAsset } from '../types/daily-assets';

interface UseDailyAssetsReturn {
  /** Daftar asset yang akan ditampilkan di tabel */
  assets: DailyAsset[];
  /** Total semua asset (untuk pagination) */
  total: number;
  /** Halaman saat ini */
  page: number;
  /** Jumlah item per halaman */
  perPage: number;
  /** Sedang memuat data? */
  isLoading: boolean;
  /** Pesan error jika ada */
  error: string | null;
  /** Fungsi untuk load ulang data */
  loadAssets: (page?: number, search?: string) => Promise<void>;
}

export function useDailyAssets(token: string): UseDailyAssetsReturn {
  const [assets, setAssets] = useState<DailyAsset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Fungsi untuk fetch data asset */
  const loadAssets = useCallback(async (pageNum = 1, search = '') => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const params: FetchDailyAssetsParams = { page: pageNum, perPage, search };
      const result: PaginatedResponse<DailyAsset> = await fetchDailyAssets(token, params) as PaginatedResponse<DailyAsset>;

      setAssets(result.data);
      setTotal(result.total);
      setPage(result.page);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat data asset.';
      setError(message);
      setAssets([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, perPage]);

  /** Load data saat token berubah */
  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  return { assets, total, page, perPage, isLoading, error, loadAssets };
}
