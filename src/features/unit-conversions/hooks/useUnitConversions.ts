import { useState, useEffect, useCallback } from 'react';
import { fetchUnitConversions } from '../api/unit-conversions-api';
import type { UnitConversion } from '../types/unit-conversions';

interface UseUnitConversionsState {
  unitConversions: UnitConversion[];
  total: number;
  page: number;
  perPage: number;
  isLoading: boolean;
  error: string | null;
}

export function useUnitConversions(token: string) {
  const [state, setState] = useState<UseUnitConversionsState>({
    unitConversions: [],
    total: 0,
    page: 1,
    perPage: 10,
    isLoading: false,
    error: null,
  });

  const loadUnitConversions = useCallback(
    async (page: number = 1, search?: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetchUnitConversions(token, {
          page,
          per_page: state.perPage,
          search,
        });

        const payload = response as any;
        const rawData = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data?.items)
          ? payload.data.items
          : [];

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
          page;

        const perPage =
          payload.per_page ??
          payload.pagination?.per_page ??
          payload.meta?.per_page ??
          state.perPage;

        setState((prev) => ({
          ...prev,
          unitConversions: rawData.map((it: any) => {
            // normalize various backend shapes into expected UnitConversion
            const src = it || {};
            const productObj = src.product ?? src.product_info ?? null;
            const fromUnitObj = src.from_unit ?? src.init ?? null;
            const toUnitObj = src.to_unit ?? src.final ?? null;

            return {
              id: src.id ?? src._id ?? null,
              product_id: src.product_id ?? productObj?.id ?? src.productCode ?? src.product_code ?? src.product ?? null,
              product_name: src.product_name ?? productObj?.name ?? productObj?.nama ?? src.productName ?? src.product_name ?? null,
              from_unit_id: src.from_unit_id ?? src.init_id ?? fromUnitObj?.id ?? fromUnitObj?.unit_id ?? src.initId ?? null,
              from_unit_name: src.from_unit_name ?? fromUnitObj?.name ?? fromUnitObj?.nama ?? src.init_name ?? null,
              to_unit_id: src.to_unit_id ?? src.final_id ?? toUnitObj?.id ?? toUnitObj?.unit_id ?? src.finalId ?? null,
              to_unit_name: src.to_unit_name ?? toUnitObj?.name ?? toUnitObj?.nama ?? src.final_name ?? null,
              conversion_value: src.conversion_value ?? src.value_conv ?? src.valueConv ?? src.value ?? null,
              created_at: src.created_at ?? src.createdAt ?? null,
              updated_at: src.updated_at ?? src.updatedAt ?? null,
            };
          }),
          total: totalItems,
          page: currentPage,
          perPage,
          isLoading: false,
        }));
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data konversi satuan';
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
      loadUnitConversions(1);
    }
  }, [token, loadUnitConversions]);

  return {
    unitConversions: state.unitConversions,
    total: state.total,
    page: state.page,
    perPage: state.perPage,
    isLoading: state.isLoading,
    error: state.error,
    loadUnitConversions,
  };
}
