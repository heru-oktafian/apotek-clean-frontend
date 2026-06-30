import { apiRequest } from '../../../lib/api/client';
import type { UnitsResponse, UnitsListParams } from '../types/units';

// ── List Units ──────────────────────────────────────────────────────────────
// GET /api/units?page=1&per_page=7&search=...
export const fetchUnits = async (token: string, params?: UnitsListParams) => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) {
    queryParams.append('page', String(params.page));
  }
  
  if (params?.per_page) {
    queryParams.append('per_page', String(params.per_page));
  }
  
  if (params?.search) {
    queryParams.append('search', params.search);
  }

  const query = queryParams.toString();
  const url = query ? `/api/units?${query}` : '/api/units';

  const res = await apiRequest<UnitsResponse>(url, { token });
  return res;
};
