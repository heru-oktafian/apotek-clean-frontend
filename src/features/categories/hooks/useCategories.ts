import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/auth-context';
import { fetchCategories } from '../api/categories-api';
import type { CategoriesListParams } from '../types/categories';
import type { Category } from '../types/categories';

export type { Category } from '../types/categories';

export function useCategories() {
  const { activeToken } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
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
      setPerPage(10);
      setApiError(null);
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      const params: CategoriesListParams = {
        page: requestedPage,
        search: search.trim(),
      };

      const payload = await fetchCategories(activeToken, params);
      const responseData = payload as Record<string, unknown>;
      const dataValue = responseData.data as unknown;
      const nestedDataValue = typeof dataValue === 'object' && dataValue !== null ? (dataValue as Record<string, unknown>).data : undefined;

      const rawData = Array.isArray(dataValue)
        ? dataValue
        : Array.isArray(nestedDataValue)
          ? nestedDataValue
          : Array.isArray(responseData.items)
            ? responseData.items
            : Array.isArray(responseData.rows)
              ? responseData.rows
              : Array.isArray(payload)
                ? payload
                : [];

      const nextItems = rawData.map(normalizeCategory);
      const totalItems = responseData.total_items as number | undefined
        ?? (responseData.pagination as Record<string, unknown> | undefined)?.total as number | undefined
        ?? responseData.total as number | undefined
        ?? (responseData.meta as Record<string, unknown> | undefined)?.total as number | undefined
        ?? (dataValue as Record<string, unknown> | undefined)?.total as number | undefined
        ?? nextItems.length;
      const currentPage = responseData.current_page as number | undefined
        ?? (responseData.pagination as Record<string, unknown> | undefined)?.page as number | undefined
        ?? responseData.page as number | undefined
        ?? (responseData.meta as Record<string, unknown> | undefined)?.current_page as number | undefined
        ?? requestedPage;
      const nextPerPage = responseData.per_page as number | undefined
        ?? (responseData.pagination as Record<string, unknown> | undefined)?.per_page as number | undefined
        ?? (responseData.meta as Record<string, unknown> | undefined)?.per_page as number | undefined
        ?? 10;

      setCategories(nextItems);
      setTotal(Number(totalItems ?? nextItems.length));
      setPage(Number(currentPage ?? requestedPage));
      setPerPage(Number(nextPerPage ?? 10));
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
