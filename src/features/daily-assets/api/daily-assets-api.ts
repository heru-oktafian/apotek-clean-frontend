/**
 * @module daily-assets/api
 * @description Fungsi-fungsi API untuk modul Laporan Asset (Daily Assets)
 */
import { apiRequest } from '../../../lib/api/client';
import type { DailyAsset } from '../types/daily-assets';

export interface FetchDailyAssetsParams {
  page?: number;
  perPage?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}

interface ApiListResponse {
  data?: DailyAsset[];
  total?: number;
  page?: number;
  per_page?: number;
}

/**
 * Ambil daftar asset dengan pagination
 * Endpoint: GET /api/daily-assets
 */
export async function fetchDailyAssets(
  token: string,
  params: FetchDailyAssetsParams = {}
): Promise<PaginatedResponse<DailyAsset>> {
  // Bangun query string manual
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', String(params.page));
  if (params.perPage) queryParams.append('per_page', String(params.perPage));
  if (params.search) queryParams.append('search', params.search);
  if (params.startDate) queryParams.append('start_date', params.startDate);
  if (params.endDate) queryParams.append('end_date', params.endDate);

  const query = queryParams.toString();
  const url = query ? `/api/daily-assets?${query}` : '/api/daily-assets';

  const raw = await apiRequest<ApiListResponse>(url, { token });

  return {
    data: raw.data ?? [],
    total: raw.total ?? 0,
    page: raw.page ?? 1,
    perPage: raw.per_page ?? 10,
  };
}
