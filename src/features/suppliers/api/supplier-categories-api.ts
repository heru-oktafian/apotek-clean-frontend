import { apiRequest } from '../../../lib/api/client';
import type { SupplierCategory } from '../types/supplier-categories';

// ── Create Supplier Category ─────────────────────────────────────────────────
// POST /api/supplier-categories
export const createSupplierCategory = async (
  token: string,
  body: { name: string }
) => {
  const res = await apiRequest<SupplierCategory>('/api/supplier-categories', {
    token,
    method: 'POST',
    body,
  });
  return res;
};

// ── Update Supplier Category ────────────────────────────────────────────────
// PUT /api/supplier-categories/{id}
export const updateSupplierCategory = async (
  token: string,
  id: number,
  body: { name: string }
) => {
  const res = await apiRequest<SupplierCategory>(`/api/supplier-categories/${id}`, {
    token,
    method: 'PUT',
    body,
  });
  return res;
};

// ── Delete Supplier Category ────────────────────────────────────────────────
// DELETE /api/supplier-categories/{id}
export const deleteSupplierCategory = async (token: string, id: number) => {
  const res = await apiRequest<{ status: string; message: string }>(
    `/api/supplier-categories/${id}`,
    { token, method: 'DELETE' }
  );
  return res;
};
