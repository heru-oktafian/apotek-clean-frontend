import { useState, useEffect, useCallback } from 'react';
import { fetchUnits } from '../api/units-api';
import type { Unit, UnitsListParams } from '../types/units';

interface UseUnitsState {
  units: Unit[];
  total: number;
  page: number;
  perPage: number;
  isLoading: boolean;
  error: string | null;
}

export function useUnits(token: string) {
  const [state, setState] = useState<UseUnitsState>({
    units: [],
    total: 0,
    page: 1,
    perPage: 7,
    isLoading: false,
    error: null,
  });

  const loadUnits = useCallback(
    async (page: number = 1, search?: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetchUnits(token, {
          page,
          per_page: state.perPage,
          search,
        });

        const payload = response as any;
        const rawData = Array.isArray(payload.data)
          ? payload.data
          : Array.isArray(payload.data?.data)
          ? payload.data.data
          : Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data?.items)
          ? payload.data.items
          : [];

        // Enforce client-side paging: always use requested per-page (state.perPage)
        // and slice the raw data according to the requested page. This ensures
        // the UI displays exactly `perPage` rows even if backend ignores per_page.
        const requestedPerPage = state.perPage;
        const requestedPage = page;

        const totalItems =
          payload.total_items ??
          payload.pagination?.total ??
          payload.total ??
          payload.meta?.total ??
          payload.data?.total ??
          rawData.length;

        const currentPage =
          payload.current_page ??
          payload.pagination?.page ??
          payload.page ??
          payload.meta?.current_page ??
          requestedPage;

        const perPage =
          payload.per_page ??
          payload.pagination?.per_page ??
          payload.meta?.per_page ??
          requestedPerPage;

        const pageSlice = rawData;

        setState((prev) => ({
          ...prev,
          units: pageSlice,
          total: totalItems,
          page: currentPage,
          perPage,
          isLoading: false,
        }));
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data satuan';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
      }
    },
    [token, state.perPage]
  );

  useEffect(() => {
    if (token) {
      loadUnits(1);
    }
  }, [token, loadUnits]);

  return {
    units: state.units,
    total: state.total,
    page: state.page,
    perPage: state.perPage,
    isLoading: state.isLoading,
    error: state.error,
    loadUnits,
  };
}
