// Hook for Sales feature
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/auth-context';
import {
  fetchSalesList,
  fetchSaleItems,
  createSale,
  updateSale,
  deleteSale,
  addSaleItem,
  updateSaleItem,
  deleteSaleItem,
  fetchSaleDetail,
} from '../api/sales-api';
import type {
  SaleListItem,
  SaleItem,
  SaleDetailPrint,
  SaleItemFormData,
  CreateSalePayload,
  UpdateSalePayload,
  AddSaleItemPayload,
  UpdateSaleItemPayload,
} from '../types/sales';

interface SalesState {
  sales: SaleListItem[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  perPage: number;
  isLoading: boolean;
  error: string | null;
  search: string;
  month: string;
}

interface SaleDetailState {
  sale: SaleDetailPrint | null;
  items: SaleItem[];
  isLoading: boolean;
  error: string | null;
}

export function useSalesList() {
  const { activeToken } = useAuth();
  const [state, setState] = useState<SalesState>({
    sales: [],
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
    perPage: 10,
    isLoading: false,
    error: null,
    search: '',
    month: '',
  });

  const loadSales = useCallback(
    async (page: number = 1, search: string = '', month: string = '') => {
      if (!activeToken) return;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetchSalesList(activeToken, { page, search, month });
        setState((prev) => ({
          ...prev,
          sales: response.data || [],
          totalItems: response.total_items || 0,
          currentPage: response.current_page || 1,
          totalPages: response.total_pages || 1,
          perPage: response.per_page || 10,
          isLoading: false,
          search,
          month,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to load sales',
        }));
      }
    },
    [activeToken]
  );

  const deleteSaleById = useCallback(
    async (saleId: string): Promise<boolean> => {
      if (!activeToken) return false;

      try {
        await deleteSale(activeToken, saleId);
        await loadSales(state.currentPage, state.search, state.month);
        return true;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to delete sale',
        }));
        return false;
      }
    },
    [activeToken, loadSales, state.currentPage, state.search, state.month]
  );

  // Auto load on mount
  useEffect(() => {
    loadSales(1, '', '');
  }, [loadSales]);

  return {
    ...state,
    loadSales,
    deleteSaleById,
  };
}

export function useSaleDetail(saleId: string) {
  const { activeToken } = useAuth();
  const [state, setState] = useState<SaleDetailState>({
    sale: null,
    items: [],
    isLoading: false,
    error: null,
  });

  const loadSaleDetail = useCallback(async () => {
    if (!activeToken || !saleId) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetchSaleDetail(activeToken, saleId);
      setState({
        sale: response.data,
        items: response.data?.items || [],
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load sale detail',
      }));
    }
  }, [activeToken, saleId]);

  const updateSaleData = useCallback(
    async (payload: UpdateSalePayload): Promise<boolean> => {
      if (!activeToken || !saleId) return false;

      try {
        await updateSale(activeToken, saleId, payload);
        await loadSaleDetail();
        return true;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to update sale',
        }));
        return false;
      }
    },
    [activeToken, saleId, loadSaleDetail]
  );

  const removeSaleItem = useCallback(
    async (itemId: string): Promise<boolean> => {
      if (!activeToken) return false;

      try {
        await deleteSaleItem(activeToken, itemId);
        await loadSaleDetail();
        return true;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to delete item',
        }));
        return false;
      }
    },
    [activeToken, loadSaleDetail]
  );

  useEffect(() => {
    loadSaleDetail();
  }, [loadSaleDetail]);

  return {
    ...state,
    loadSaleDetail,
    updateSaleData,
    removeSaleItem,
  };
}

export function useSaleItems(saleId: string) {
  const { activeToken } = useAuth();
  const [items, setItems] = useState<SaleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    if (!activeToken || !saleId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchSaleItems(activeToken, saleId);
      setItems(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
    } finally {
      setIsLoading(false);
    }
  }, [activeToken, saleId]);

  const addItem = useCallback(
    async (productId: string, qty: number): Promise<boolean> => {
      if (!activeToken) return false;

      try {
        const payload: AddSaleItemPayload = { sale_id: saleId, product_id: productId, qty };
        await addSaleItem(activeToken, payload);
        await loadItems();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add item');
        return false;
      }
    },
    [activeToken, saleId, loadItems]
  );

  const editItem = useCallback(
    async (itemId: string, productId: string, price: number, qty: number): Promise<boolean> => {
      if (!activeToken) return false;

      try {
        const payload: UpdateSaleItemPayload = { sale_id: saleId, product_id: productId, price, qty };
        await updateSaleItem(activeToken, itemId, payload);
        await loadItems();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update item');
        return false;
      }
    },
    [activeToken, saleId, loadItems]
  );

  const removeItem = useCallback(
    async (itemId: string): Promise<boolean> => {
      if (!activeToken) return false;

      try {
        await deleteSaleItem(activeToken, itemId);
        await loadItems();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete item');
        return false;
      }
    },
    [activeToken, loadItems]
  );

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return {
    items,
    isLoading,
    error,
    loadItems,
    addItem,
    editItem,
    removeItem,
  };
}

export function useCreateSale() {
  const { activeToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const create = useCallback(
    async (payload: CreateSalePayload): Promise<{ saleId: string | null; error: string | null }> => {
      if (!activeToken) return { saleId: null, error: 'Token tidak ditemukan' };

      setIsLoading(true);

      try {
        const response = await createSale(activeToken, payload);
        return { saleId: response.data.sale.id, error: null };
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Gagal membuat penjualan';
        return { saleId: null, error };
      } finally {
        setIsLoading(false);
      }
    },
    [activeToken]
  );

  return { create, isLoading };
}
