import { apiRequest } from '../../../lib/api/client';
import type { MembersResponse, MembersListParams, Member } from '../types/members';
import type { MemberCategoriesResponse, MemberCategoriesParams } from '../types/member-categories';

// ── Fetch Members ────────────────────────────────────────────────────────────
/**
 * Fetch a paginated list of members with optional search.
 *
 * **HTTP:** `GET /api/members`
 *
 * @param token  - Auth bearer token.
 * @param params - Optional pagination and search params.
 * @returns      Paginated list of members.
 */
export async function fetchMembers(
  token: string,
  params?: MembersListParams
): Promise<MembersResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) {
    queryParams.append('page', String(params.page));
  }

  if (params?.search) {
    queryParams.append('search', params.search);
  }

  const query = queryParams.toString();
  const url = query ? `/api/members?${query}` : '/api/members';

  const res = await apiRequest<MembersResponse>(url, { token });
  return res;
}

/** Payload for creating a new member. */
export interface CreateMemberPayload {
  /** Full name of the member. */
  name: string;
  /** Contact phone number. */
  phone: string;
  /** Physical address. */
  address: string;
  /** Numeric ID of the member category/tier. */
  member_category_id: number;
}

/** Payload for updating an existing member. */
export interface UpdateMemberPayload extends CreateMemberPayload {}

// ── Create Member ────────────────────────────────────────────────────────────
/**
 * Create a new loyalty program member.
 *
 * **HTTP:** `POST /api/members`
 *
 * @param token - Auth bearer token.
 * @param body  - Member creation payload.
 * @returns     The newly created member object.
 */
export async function createMember(
  token: string,
  body: CreateMemberPayload
): Promise<Member> {
  const url = '/api/members';
  const res = await apiRequest<Member>(url, { token, method: 'POST', body });
  return res;
}

// ── Update Member ────────────────────────────────────────────────────────────
/**
 * Update an existing loyalty program member.
 *
 * **HTTP:** `PUT /api/members/{id}`
 *
 * @param token - Auth bearer token.
 * @param id    - ID of the member to update.
 * @param body  - Member update payload.
 * @returns     The updated member object.
 */
export async function updateMember(
  token: string,
  id: string,
  body: UpdateMemberPayload
): Promise<Member> {
  const url = `/api/members/${id}`;
  const res = await apiRequest<Member>(url, { token, method: 'PUT', body });
  return res;
}

// ── Delete Member ────────────────────────────────────────────────────────────
/**
 * Delete a loyalty program member by ID.
 *
 * **HTTP:** `DELETE /api/members/{id}`
 *
 * @param token - Auth bearer token.
 * @param id    - ID of the member to delete.
 */
export async function deleteMember(
  token: string,
  id: string
): Promise<void> {
  const url = `/api/members/${id}`;
  return apiRequest<void>(url, { token, method: 'DELETE' });
}

// ── Fetch Member Categories ──────────────────────────────────────────────────
/**
 * Fetch member categories for dropdown/combo display.
 *
 * **HTTP:** `GET /api/member-categories-combo`
 *
 * @param token  - Auth bearer token.
 * @param params - Optional search param.
 * @returns      List of member categories.
 */
export async function fetchMemberCategories(
  token: string,
  params?: MemberCategoriesParams
): Promise<MemberCategoriesResponse> {
  const queryParams = new URLSearchParams();

  if (params?.search) {
    queryParams.append('search', params.search);
  }

  const query = queryParams.toString();
  const url = query
    ? `/api/member-categories-combo?${query}`
    : '/api/member-categories-combo';

  const res = await apiRequest<MemberCategoriesResponse>(url, { token });
  return res;
}
