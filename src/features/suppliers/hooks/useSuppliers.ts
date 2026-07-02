import { useState, useEffect, useCallback } from 'react';
import { fetchSuppliers } from '../api/suppliers-api';
import type { Supplier } from '../types/suppliers';

export function useSuppliers(token: string) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const loadSuppliers = useCallback(
    async (requestedPage: number = 1, search: string = '') => {
      if (!token) return;

      setIsLoading(true);
      try {
        const response = await fetchSuppliers(token, {
          page: requestedPage,
          search,
        });

        const payload = response as any;
        const data = Array.isArray(payload?.data) ? payload.data : [];

        setSuppliers(data);
        setTotal(payload?.total_items ?? data.length);
        setPage(requestedPage);
        setPerPage(payload?.per_page ?? 10);
      } catch (error) {
        console.error('Error loading suppliers:', error);
        setSuppliers([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (token) {
      loadSuppliers(1);
    }
  }, [token, loadSuppliers]);

  return { suppliers, total, page, perPage, isLoading, loadSuppliers };
}
