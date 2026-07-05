import { apiRequest } from '../../../lib/api/client';
import type { Unit, UnitsResponse, UnitsListParams } from '../types/units';

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

export const createUnit = async (token: string, body: { name: string }) => {
  const url = '/api/units';
  const res = await apiRequest<Unit>(url, { token, method: 'POST', body });
  return res;
};

export const updateUnit = async (token: string, id: string | number, body: { name: string }) => {
  const url = `/api/units/${id}`;
  const res = await apiRequest<Unit>(url, { token, method: 'PUT', body });
  return res;
};

export const deleteUnit = async (token: string, id: string | number) => {
  const url = `/api/units/${id}`;
  return apiRequest<void>(url, { token, method: 'DELETE' });
};
