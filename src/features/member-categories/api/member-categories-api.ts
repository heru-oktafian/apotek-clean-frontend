import { apiRequest } from '../../../lib/api/client';
import type { MemberCategory, MemberCategoriesParams, MemberCategoriesResponse } from '../types/member-categories';

export const fetchMemberCategories = async (token: string, params?: MemberCategoriesParams) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.search) queryParams.append('search', params.search);

  const query = queryParams.toString();
  const url = query ? `/api/member-categories?${query}` : '/api/member-categories';

  return apiRequest<MemberCategoriesResponse>(url, { token });
};

export const createMemberCategory = async (
  token: string,
  body: {
    name: string;
    nama: string;
    points_conversion_rate: number;
    pointsConversionRate: number;
    branch_id: string;
    branchId: string;
  },
) => {
  const url = '/api/member-categories';
  return apiRequest<MemberCategory>(url, { token, method: 'POST', body });
};

export const updateMemberCategory = async (
  token: string,
  id: number,
  body: {
    name: string;
    nama: string;
    points_conversion_rate: number;
    pointsConversionRate: number;
    branch_id: string;
    branchId: string;
  },
) => {
  const url = `/api/member-categories/${id}`;
  return apiRequest<MemberCategory>(url, { token, method: 'PUT', body });
};

export const deleteMemberCategory = async (token: string, id: number) => {
  const url = `/api/member-categories/${id}`;
  return apiRequest<void>(url, { token, method: 'DELETE' });
};
