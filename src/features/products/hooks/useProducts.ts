import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/auth-context';
import { fetchProducts } from '../api/products-api';
import type { Product } from '../types/products';

export function useProducts() {
  const { activeToken } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadProducts = useCallback(
    async (requestedPage = 1, search = '') => {
      if (!activeToken) {
        setProducts([]);
        setTotal(0);
        setPage(1);
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetchProducts(activeToken, requestedPage, search);

        setProducts(response.data || []);
        setTotal(response.total_items || 0);
        setPage(response.current_page || requestedPage);
        setPerPage(response.per_page || 12);
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    },
    [activeToken]
  );

  useEffect(() => {
    if (activeToken) {
      void loadProducts(1, '');
    }
  }, [activeToken, loadProducts]);

  return { products, page, perPage, total, isLoading, loadProducts };
}
