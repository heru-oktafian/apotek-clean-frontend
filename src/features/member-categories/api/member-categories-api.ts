import { apiRequest } from '../../../lib/api/client';
import type { MemberCategory, MemberCategoriesParams, MemberCategoriesResponse } from '../types/member-categories';

// ── Fetch Member Categories ───────────────────────────────────────────────────
/**
 * Fetch a paginated list of member categories with optional search.
 *
 * **HTTP:** `GET /api/member-categories`
 *
 * @param token  - Auth bearer token.
 * @param params - Optional pagination and search params.
 * @returns      Paginated list of member categories.
 */
export async function fetchMemberCategories(
  token: string,
  params?: MemberCategoriesParams
): Promise<MemberCategoriesResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) {
    queryParams.append('page', String(params.page));
  }
  if (params?.search) {
    queryParams.append('search', params.search);
  }

  const query = queryParams.toString();
  const url = query ? `/api/member-categories?${query}` : '/api/member-categories';

  return apiRequest<MemberCategoriesResponse>(url, { token });
}

/** Payload for creating a new member category. */
export interface CreateMemberCategoryPayload {
  /** Display name of the category. */
  name: string;
  /** Indonesian name (typically same as `name`). */
  nama: string;
  /** Points earned per unit currency spent. */
  points_conversion_rate: number;
  /** Alias for points conversion rate (used by frontend). */
  pointsConversionRate: number;
  /** Branch ID this category belongs to. */
  branch_id: string;
  /** Alias for branch ID (used by frontend). */
  branchId: string;
}

/** Payload for updating an existing member category. */
export interface UpdateMemberCategoryPayload extends CreateMemberCategoryPayload {}

// ── Create Member Category ──────────────────────────────────────────────────
/**
 * Create a new member category / loyalty tier.
 *
 * **HTTP:** `POST /api/member-categories`
 *
 * @param token - Auth bearer token.
 * @param body  - Member category creation payload.
 * @returns     The newly created member category object.
 */
export async function createMemberCategory(
  token: string,
  body: CreateMemberCategoryPayload
): Promise<MemberCategory> {
  const url = '/api/member-categories';
  return apiRequest<MemberCategory>(url, { token, method: 'POST', body });
}

// ── Update Member Category ───────────────────────────────────────────────────
/**
 * Update an existing member category / loyalty tier.
 *
 * **HTTP:** `PUT /api/member-categories/{id}`
 *
 * @param token - Auth bearer token.
 * @param id    - ID of the member category to update.
 * @param body  - Member category update payload.
 * @returns     The updated member category object.
 */
export async function updateMemberCategory(
  token: string,
  id: number,
  body: UpdateMemberCategoryPayload
): Promise<MemberCategory> {
  const url = `/api/member-categories/${id}`;
  return apiRequest<MemberCategory>(url, { token, method: 'PUT', body });
}

// ── Delete Member Category ───────────────────────────────────────────────────
/**
 * Delete a member category by ID.
 *
 * **HTTP:** `DELETE /api/member-categories/{id}`
 *
 * @param token - Auth bearer token.
 * @param id    - ID of the member category to delete.
 */
export async function deleteMemberCategory(
  token: string,
  id: number
): Promise<void> {
  const url = `/api/member-categories/${id}`;
  return apiRequest<void>(url, { token, method: 'DELETE' });
}
