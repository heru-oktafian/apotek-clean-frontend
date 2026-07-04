import { useCallback, useEffect, useState } from 'react';
import { fetchSupplierCategories } from '../api/suppliers-api';
import type { SupplierCategory } from '../types/supplier-categories';

export function useSupplierCategories(token: string) {
  const [categories, setCategories] = useState<SupplierCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(7);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSupplierCategories = useCallback(
    async (requestedPage = 1, search = '') => {
      if (!token) {
        setCategories([]);
        setTotal(0);
        setPerPage(7);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchSupplierCategories(token, { search });
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

        const nextItems = rawData.map((item: any) => ({
          id: item?.id ?? item?.Id ?? item?.supplier_category_id ?? item?.supplierCategoryId ?? 0,
          nama: item?.nama ?? item?.name ?? item?.supplier_category_name ?? '',
          branchId: item?.branch_id ?? item?.branchId ?? '',
        }));

        const totalItems = payload?.total_items ?? payload?.pagination?.total ?? payload?.total ?? payload?.meta?.total ?? payload?.data?.total ?? nextItems.length;
        const nextPerPage = payload?.per_page ?? payload?.pagination?.per_page ?? payload?.meta?.per_page ?? 7;

        setCategories(nextItems);
        setTotal(Number(totalItems ?? nextItems.length));
        setPerPage(Number(nextPerPage ?? 7));
      } catch (err) {
        console.error(err);
        setCategories([]);
        setTotal(0);
        setError(err instanceof Error ? err.message : 'Gagal memuat data kategori supplier.');
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    void loadSupplierCategories(1, '');
  }, [loadSupplierCategories]);

  return {
    categories,
    total,
    perPage,
    isLoading,
    error,
    loadSupplierCategories,
  };
}
