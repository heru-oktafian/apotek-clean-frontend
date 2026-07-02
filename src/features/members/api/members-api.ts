import { apiRequest } from '../../../lib/api/client';
import type { MembersResponse, MembersListParams, Member } from '../types/members';
import type { MemberCategoriesResponse, MemberCategoriesParams } from '../types/member-categories';

// ── List Members ────────────────────────────────────────────────────────────
// GET /api/members?page=1&search=...
export const fetchMembers = async (token: string, params?: MembersListParams) => {
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
};

// ── Create Member ───────────────────────────────────────────────────────────
// POST /api/members
export const createMember = async (
  token: string,
  body: {
    name: string;
    phone: string;
    address: string;
    member_category_id: number;
  }
) => {
  const url = '/api/members';
  const res = await apiRequest<Member>(url, { token, method: 'POST', body });
  return res;
};

// ── Update Member ───────────────────────────────────────────────────────────
// PUT /api/members/{id}
export const updateMember = async (
  token: string,
  id: string,
  body: {
    name: string;
    phone: string;
    address: string;
    member_category_id: number;
  }
) => {
  const url = `/api/members/${id}`;
  const res = await apiRequest<Member>(url, { token, method: 'PUT', body });
  return res;
};

// ── Delete Member ───────────────────────────────────────────────────────────
// DELETE /api/members/{id}
export const deleteMember = async (token: string, id: string) => {
  const url = `/api/members/${id}`;
  return apiRequest<void>(url, { token, method: 'DELETE' });
};

// ── List Member Categories for Combo ────────────────────────────────────────
// GET /api/member-categories-combo?search=...
export const fetchMemberCategories = async (token: string, params?: MemberCategoriesParams) => {
  const queryParams = new URLSearchParams();
  
  if (params?.search) {
    queryParams.append('search', params.search);
  }

  const query = queryParams.toString();
  const url = query ? `/api/member-categories-combo?${query}` : '/api/member-categories-combo';

  const res = await apiRequest<MemberCategoriesResponse>(url, { token });
  return res;
};
