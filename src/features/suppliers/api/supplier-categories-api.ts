import { apiRequest } from '../../../lib/api/client';
import type { SupplierCategory } from '../types/supplier-categories';

/** Payload for creating a new supplier category. */
export interface CreateSupplierCategoryPayload {
  /** Name of the supplier category. */
  name: string;
}

/** Payload for updating an existing supplier category. */
export interface UpdateSupplierCategoryPayload extends CreateSupplierCategoryPayload {}

// ── Create Supplier Category ─────────────────────────────────────────────────
/**
 * Create a new supplier category.
 *
 * **HTTP:** `POST /api/supplier-categories`
 *
 * @param token - Auth bearer token.
 * @param body  - Supplier category creation payload.
 * @returns     The newly created supplier category object.
 */
export async function createSupplierCategory(
  token: string,
  body: CreateSupplierCategoryPayload
): Promise<SupplierCategory> {
  const res = await apiRequest<SupplierCategory>('/api/supplier-categories', {
    token,
    method: 'POST',
    body,
  });
  return res;
}

// ── Update Supplier Category ─────────────────────────────────────────────────
/**
 * Update an existing supplier category.
 *
 * **HTTP:** `PUT /api/supplier-categories/{id}`
 *
 * @param token - Auth bearer token.
 * @param id    - ID of the supplier category to update.
 * @param body  - Supplier category update payload.
 * @returns     The updated supplier category object.
 */
export async function updateSupplierCategory(
  token: string,
  id: number,
  body: UpdateSupplierCategoryPayload
): Promise<SupplierCategory> {
  const res = await apiRequest<SupplierCategory>(`/api/supplier-categories/${id}`, {
    token,
    method: 'PUT',
    body,
  });
  return res;
}

// ── Delete Supplier Category ──────────────────────────────────────────────────
/**
 * Delete a supplier category by ID.
 *
 * **HTTP:** `DELETE /api/supplier-categories/{id}`
 *
 * @param token - Auth bearer token.
 * @param id    - ID of the supplier category to delete.
 * @returns     API status response.
 */
export async function deleteSupplierCategory(
  token: string,
  id: number
): Promise<{ status: string; message: string }> {
  const res = await apiRequest<{ status: string; message: string }>(
    `/api/supplier-categories/${id}`,
    { token, method: 'DELETE' }
  );
  return res;
}
