import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/auth-context';
import { apiRequest } from '../../../lib/api/client';

export interface Category {
  id: number;
  nama: string;
}

export function useCategories() {
  const { activeToken } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(7);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const normalizeCategory = useCallback((item: any): Category => ({
    id: item?.product_category_id ?? item?.productCategoryId ?? item?.id ?? item?.category_id ?? item?.categoryId ?? 0,
    nama: item?.product_category_name ?? item?.productCategoryName ?? item?.name ?? item?.nama ?? '',
  }), []);

  const loadCategories = useCallback(async (requestedPage = 1, search = '') => {
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
      const queryParams = new URLSearchParams({ page: String(requestedPage), search: search.trim() });
      const response = await apiRequest<any>(`/api/product-categories?${queryParams.toString()}`, { token: activeToken });
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

      const nextItems = rawData.map(normalizeCategory);
      const totalItems = payload?.total_items ?? payload?.pagination?.total ?? payload?.total ?? payload?.meta?.total ?? payload?.data?.total ?? nextItems.length;
      const currentPage = payload?.current_page ?? payload?.pagination?.page ?? payload?.page ?? payload?.meta?.current_page ?? requestedPage;
      const nextPerPage = payload?.per_page ?? payload?.pagination?.per_page ?? payload?.meta?.per_page ?? 7;

      setCategories(nextItems);
      setTotal(Number(totalItems ?? nextItems.length));
      setPage(Number(currentPage ?? requestedPage));
      setPerPage(Number(nextPerPage ?? 7));
    } catch (error) {
      console.error(error);
      setCategories([]);
      setTotal(0);
      setApiError(error instanceof Error ? error.message : 'Gagal memuat data kategori produk.');
    } finally {
      setIsLoading(false);
    }
  }, [activeToken, normalizeCategory]);

  useEffect(() => {
    void loadCategories(page, '');
  }, [loadCategories, page]);

  return { categories, page, setPage, perPage, total, isLoading, apiError, loadCategories };
}
