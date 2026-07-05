import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/auth-context';
import { fetchMemberCategories } from '../api/member-categories-api';
import type { MemberCategory } from '../types/member-categories';

export function useMemberCategories() {
  const { activeToken } = useAuth();
  const [categories, setCategories] = useState<MemberCategory[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(7);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const normalizeMemberCategory = useCallback((item: any): MemberCategory => ({
    id: item?.id ?? item?.Id ?? item?.member_category_id ?? item?.memberCategoryId ?? 0,
    nama: item?.nama ?? item?.name ?? item?.member_category_name ?? '',
    pointsConversionRate: Number(item?.points_conversion_rate ?? item?.pointsConversionRate ?? 0),
    branchId: item?.branch_id ?? item?.branchId ?? '',
  }), []);

  const loadMemberCategories = useCallback(async (requestedPage = 1, search = '') => {
    if (!activeToken) {
      setCategories([]);
      setTotal(0);
      setPage(1);
      setPerPage(7);
      setApiError(null);
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fetchMemberCategories(activeToken, { page: requestedPage, search });
      const payload = response as any;
      const rawData = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.data?.data)
          ? payload.data.data
          : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(payload?.rows)
              ? payload.rows
              : Array.isArray(payload)
                ? payload
                : [];

      const normalizedCategories = rawData.map(normalizeMemberCategory);
      const totalItems = payload?.total_items ?? payload?.pagination?.total ?? payload?.total ?? payload?.meta?.total ?? payload?.data?.total ?? normalizedCategories.length;
      const currentPage = payload?.current_page ?? payload?.pagination?.page ?? payload?.page ?? payload?.meta?.current_page ?? requestedPage;
      const nextPerPage = payload?.per_page ?? payload?.pagination?.per_page ?? payload?.meta?.per_page ?? 7;

      setCategories(normalizedCategories);
      setTotal(Number(totalItems ?? normalizedCategories.length));
      setPage(Number(currentPage ?? requestedPage));
      setPerPage(Number(nextPerPage ?? 7));
    } catch (error) {
      console.error(error);
      setCategories([]);
      setTotal(0);
      setApiError(error instanceof Error ? error.message : 'Gagal memuat kategori member.');
    } finally {
      setIsLoading(false);
    }
  }, [activeToken, normalizeMemberCategory]);

  useEffect(() => {
    if (!activeToken) return;
    void loadMemberCategories(1, '');
  }, [activeToken, loadMemberCategories]);

  return {
    categories,
    page,
    setPage,
    perPage,
    total,
    isLoading,
    apiError,
    loadMemberCategories,
  };
}
