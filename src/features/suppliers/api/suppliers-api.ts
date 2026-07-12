import { apiRequest } from '../../../lib/api/client';
import type { SuppliersResponse, SuppliersListParams, Supplier } from '../types/suppliers';
import type { SupplierCategoriesResponse, SupplierCategoriesParams } from '../types/supplier-categories';

// ── Fetch Suppliers ──────────────────────────────────────────────────────────
/**
 * Fetch a paginated list of suppliers with optional search.
 *
 * **HTTP:** `GET /api/suppliers`
 *
 * @param token  - Auth bearer token.
 * @param params - Optional pagination and search params.
 * @returns      Paginated list of suppliers.
 */
export async function fetchSuppliers(
  token: string,
  params?: SuppliersListParams
): Promise<SuppliersResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) {
    queryParams.append('page', String(params.page));
  }

  if (params?.search) {
    queryParams.append('search', params.search);
  }

  const query = queryParams.toString();
  const url = query ? `/api/suppliers?${query}` : '/api/suppliers';

  const res = await apiRequest<SuppliersResponse>(url, { token });
  return res;
}

/** Payload for creating a new supplier. */
export interface CreateSupplierPayload {
  /** Full name or business name of the supplier. */
  name: string;
  /** Contact phone number. */
  phone: string;
  /** Physical address. */
  address: string;
  /** Numeric ID of the supplier category. */
  categoryId: number;
  /** Person in charge / contact person (optional). */
  pic?: string;
}

/** Payload for updating an existing supplier. */
export interface UpdateSupplierPayload extends CreateSupplierPayload {}

// ── Create Supplier ──────────────────────────────────────────────────────────
/**
 * Create a new supplier/vendor.
 *
 * **HTTP:** `POST /api/suppliers`
 *
 * @param token - Auth bearer token.
 * @param body  - Supplier creation payload.
 * @returns     The newly created supplier object.
 */
export async function createSupplier(
  token: string,
  body: CreateSupplierPayload
): Promise<Supplier> {
  const url = '/api/suppliers';
  const res = await apiRequest<Supplier>(url, {
    token,
    method: 'POST',
    body: {
      name: body.name,
      phone: body.phone,
      address: body.address,
      supplier_category_id: body.categoryId,
      pic: body.pic,
    },
  });
  return res;
}

// ── Update Supplier ──────────────────────────────────────────────────────────
/**
 * Update an existing supplier/vendor.
 *
 * **HTTP:** `PUT /api/suppliers/{id}`
 *
 * @param token - Auth bearer token.
 * @param id    - ID of the supplier to update.
 * @param body  - Supplier update payload.
 * @returns     The updated supplier object.
 */
export async function updateSupplier(
  token: string,
  id: number,
  body: UpdateSupplierPayload
): Promise<Supplier> {
  const url = `/api/suppliers/${id}`;
  const res = await apiRequest<Supplier>(url, {
    token,
    method: 'PUT',
    body: {
      name: body.name,
      phone: body.phone,
      address: body.address,
      supplier_category_id: body.categoryId,
      pic: body.pic,
    },
  });
  return res;
}

// ── Delete Supplier ──────────────────────────────────────────────────────────
/**
 * Delete a supplier by ID.
 *
 * **HTTP:** `DELETE /api/suppliers/{id}`
 *
 * @param token - Auth bearer token.
 * @param id    - ID of the supplier to delete.
 * @returns     API status response.
 */
export async function deleteSupplier(
  token: string,
  id: number
): Promise<{ status: string; message: string }> {
  const url = `/api/suppliers/${id}`;
  const res = await apiRequest<{ status: string; message: string }>(url, { token, method: 'DELETE' });
  return res;
}

// ── Fetch Supplier Categories ────────────────────────────────────────────────
/**
 * Fetch supplier categories for dropdown/combo display.
 *
 * **HTTP:** `GET /api/supplier-categories-combo`
 *
 * @param token  - Auth bearer token.
 * @param params - Optional search param.
 * @returns      List of supplier categories.
 */
export async function fetchSupplierCategories(
  token: string,
  params?: SupplierCategoriesParams
): Promise<SupplierCategoriesResponse> {
  const queryParams = new URLSearchParams();

  if (params?.search) {
    queryParams.append('search', params.search);
  }

  const query = queryParams.toString();
  const url = query
    ? `/api/supplier-categories-combo?${query}`
    : '/api/supplier-categories-combo';

  const res = await apiRequest<SupplierCategoriesResponse>(url, { token });
  return res;
}
