/**
 * @module units/useUnits
 * @description Hook untuk mengelola data satuan obat.
 */
import { useState, useEffect, useCallback } from "react";
import { fetchUnits, createUnit, updateUnit, deleteUnit } from "../api/units-api";
import type { Unit } from "../types/units";

interface UseUnitsState {
  units: Unit[];
  selectedUnit: Unit | null;
  total: number;
  page: number;
  perPage: number;
  isLoading: boolean;
  error: string | null;
  actionLoading: boolean;
}

export function useUnits(token: string) {
  const [state, setState] = useState<UseUnitsState>({
    units: [],
    selectedUnit: null,
    total: 0,
    page: 1,
    perPage: 10,
    isLoading: false,
    error: null,
    actionLoading: false,
  });

  const loadUnits = useCallback(async (requestedPage = 1, search = "") => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetchUnits(token, {
        page: requestedPage,
        per_page: state.perPage,
        search,
      });
      const payload = response as unknown as Record<string, unknown>;
      const rawData: Unit[] = Array.isArray(payload.data)
        ? (payload.data as unknown as Unit[])
        : Array.isArray((payload.data as Record<string, unknown>)?.data)
        ? ((payload.data as Record<string, unknown>).data as unknown as Unit[])
        : Array.isArray((payload.data as Record<string, unknown>)?.items)
        ? ((payload.data as Record<string, unknown>).items as unknown as Unit[])
        : Array.isArray(payload)
        ? (payload as unknown as Unit[])
        : [];

      const totalItems =
        (payload.total_items as number) ??
        ((payload.pagination as Record<string, number>)?.total) ??
        (payload.total as number) ??
        ((payload.meta as Record<string, number>)?.total) ??
        rawData.length;

      const currentPage =
        (payload.current_page as number) ??
        ((payload.pagination as Record<string, number>)?.page) ??
        (payload.page as number) ??
        ((payload.meta as Record<string, number>)?.current_page) ??
        requestedPage;

      const perPage =
        (payload.per_page as number) ??
        ((payload.pagination as Record<string, number>)?.per_page) ??
        ((payload.meta as Record<string, number>)?.per_page) ??
        state.perPage;

      setState((prev) => ({
        ...prev,
        units: rawData,
        total: totalItems,
        page: currentPage,
        perPage,
        isLoading: false,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal memuat data satuan";
      setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
    }
  }, [token, state.perPage]);

  const addUnit = useCallback(async (payload: { name: string }) => {
    setState((prev) => ({ ...prev, actionLoading: true, error: null }));
    try {
      const response = await createUnit(token, payload);
      const payloadResponse = response as unknown as Record<string, unknown>;
      const createdUnit = ((payloadResponse.data as Record<string, unknown>) ?? payloadResponse) as unknown as Unit;
      setState((prev) => ({
        ...prev,
        units: [...prev.units, createdUnit],
        total: prev.total + 1,
        actionLoading: false,
      }));
      return createdUnit;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal menambah satuan";
      setState((prev) => ({ ...prev, error: errorMessage, actionLoading: false }));
      return null;
    }
  }, [token]);

  const editUnit = useCallback(async (id: string | number, payload: { name: string }) => {
    setState((prev) => ({ ...prev, actionLoading: true, error: null }));
    try {
      const response = await updateUnit(token, id, payload);
      const payloadResponse = response as unknown as Record<string, unknown>;
      const updatedUnit = ((payloadResponse.data as Record<string, unknown>) ?? payloadResponse) as unknown as Unit;
      setState((prev) => ({
        ...prev,
        units: prev.units.map((u) => (u.id === updatedUnit.id ? updatedUnit : u)),
        selectedUnit: updatedUnit,
        actionLoading: false,
      }));
      return updatedUnit;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal mengupdate satuan";
      setState((prev) => ({ ...prev, error: errorMessage, actionLoading: false }));
      return null;
    }
  }, [token]);

  const removeUnit = useCallback(async (id: string | number) => {
    setState((prev) => ({ ...prev, actionLoading: true, error: null }));
    try {
      await deleteUnit(token, id);
      setState((prev) => ({
        ...prev,
        units: prev.units.filter((u) => u.id !== id),
        total: prev.total - 1,
        actionLoading: false,
      }));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal menghapus satuan";
      setState((prev) => ({ ...prev, error: errorMessage, actionLoading: false }));
      return false;
    }
  }, [token]);

  useEffect(() => {
    if (token) void loadUnits(1);
  }, [token, loadUnits]);

  return {
    units: state.units,
    selectedUnit: state.selectedUnit,
    total: state.total,
    page: state.page,
    perPage: state.perPage,
    isLoading: state.isLoading,
    error: state.error,
    actionLoading: state.actionLoading,
    loadUnits,
    addUnit,
    editUnit,
    removeUnit,
  };
}
