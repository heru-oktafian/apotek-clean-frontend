import { apiRequest } from '../../../lib/api/client';
import type { CategoriesListParams, CategoriesResponse, Category } from '../types/categories';

// ── Fetch Categories ─────────────────────────────────────────────────────────
/**
 * Fetch a paginated list of product categories with optional search.
 *
 * **HTTP:** `GET /api/product-categories`
 *
 * @param token  - Auth bearer token.
 * @param params - Optional pagination and search params.
 * @returns      Paginated list of categories.
 */
export async function fetchCategories(
  token: string,
  params?: CategoriesListParams
): Promise<CategoriesResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) {
    queryParams.append('page', String(params.page));
  }
  if (params?.search) {
    queryParams.append('search', params.search);
  }

  const query = queryParams.toString();
  const url = query ? `/api/product-categories?${query}` : '/api/product-categories';
  return apiRequest<CategoriesResponse>(url, { token });
}

/** Payload for creating a new product category. */
export interface CreateCategoryPayload {
  /** Display name of the category. */
  name: string;
  /** Indonesian name (typically the same as `name`). */
  nama: string;
  /** Human-readable product category label. */
  product_category_name: string;
}

/** Payload for updating an existing product category. */
export interface UpdateCategoryPayload extends CreateCategoryPayload {}

// ── Create Category ─────────────────────────────────────────────────────────
/**
 * Create a new product category.
 *
 * **HTTP:** `POST /api/product-categories`
 *
 * @param token - Auth bearer token.
 * @param body  - Category creation payload.
 * @returns     The newly created category object.
 */
export async function createCategory(
  token: string,
  body: CreateCategoryPayload
): Promise<Category> {
  return apiRequest<Category>('/api/product-categories', { token, method: 'POST', body });
}

// ── Update Category ──────────────────────────────────────────────────────────
/**
 * Update an existing product category.
 *
 * **HTTP:** `PUT /api/product-categories/{id}`
 *
 * @param token - Auth bearer token.
 * @param id    - ID of the category to update.
 * @param body  - Category update payload.
 * @returns     The updated category object.
 */
export async function updateCategory(
  token: string,
  id: number,
  body: UpdateCategoryPayload
): Promise<Category> {
  return apiRequest<Category>(`/api/product-categories/${id}`, { token, method: 'PUT', body });
}

// ── Delete Category ──────────────────────────────────────────────────────────
/**
 * Delete a product category by ID.
 *
 * **HTTP:** `DELETE /api/product-categories/{id}`
 *
 * @param token - Auth bearer token.
 * @param id    - ID of the category to delete.
 */
export async function deleteCategory(
  token: string,
  id: number
): Promise<void> {
  return apiRequest<void>(`/api/product-categories/${id}`, { token, method: 'DELETE' });
}
