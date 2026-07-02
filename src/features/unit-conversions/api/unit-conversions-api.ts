import { apiRequest } from '../../../lib/api/client';
import type {
  UnitConversion,
  UnitConversionsResponse,
  UnitConversionsListParams,
  ProductComboResponse,
  UnitComboResponse,
} from '../types/unit-conversions';

// ── List Unit Conversions ────────────────────────────────────────────────────
// GET /api/unit-conversions?page=1&search=...
export const fetchUnitConversions = async (token: string, params?: UnitConversionsListParams) => {
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
  const url = query ? `/api/unit-conversions?${query}` : '/api/unit-conversions';

  const res = await apiRequest<UnitConversionsResponse>(url, { token });
  return res;
};

// ── Create Unit Conversion ───────────────────────────────────────────────────
// POST /api/unit-conversions
export const createUnitConversion = async (
  token: string,
  body: {
    product_id: number | string;
    from_unit_id: number | string;
    to_unit_id: number | string;
    conversion_value: number | string;
  }
) => {
  const url = '/api/unit-conversions';
  const res = await apiRequest<UnitConversion>(url, { token, method: 'POST', body });
  return res;
};

// ── Update Unit Conversion ───────────────────────────────────────────────────
// PUT /api/unit-conversions/{id}
export const updateUnitConversion = async (
  token: string,
  id: string | number,
  body: {
    product_id: number | string;
    from_unit_id: number | string;
    to_unit_id: number | string;
    conversion_value: number | string;
  }
) => {
  const url = `/api/unit-conversions/${id}`;
  const res = await apiRequest<UnitConversion>(url, { token, method: 'PUT', body });
  return res;
};

// ── Delete Unit Conversion ───────────────────────────────────────────────────
// DELETE /api/unit-conversions/{id}
export const deleteUnitConversion = async (token: string, id: string | number) => {
  const url = `/api/unit-conversions/${id}`;
  return apiRequest<void>(url, { token, method: 'DELETE' });
};

// ── Fetch Products Combo ──────────────────────────────────────────────────────
// GET /api/conversion-products-combo?search=...
export const fetchProductsCombo = async (token: string, params?: { search?: string }) => {
  const queryParams = new URLSearchParams();

  if (params?.search) {
    queryParams.append('search', params.search);
  }

  const query = queryParams.toString();
  const url = query ? `/api/conversion-products-combo?${query}` : '/api/conversion-products-combo';

  const res = await apiRequest<ProductComboResponse>(url, { token });
  return res;
};

// ── Fetch Units Combo ─────────────────────────────────────────────────────────
// GET /api/units-combo?search=...
export const fetchUnitsCombo = async (token: string, params?: { search?: string }) => {
  const queryParams = new URLSearchParams();

  if (params?.search) {
    queryParams.append('search', params.search);
  }

  const query = queryParams.toString();
  const url = query ? `/api/units-combo?${query}` : '/api/units-combo';

  const res = await apiRequest<UnitComboResponse>(url, { token });
  return res;
};
