import { useState, useEffect, useCallback } from 'react';
import { fetchMembers } from '../api/members-api';
import type { Member, MembersListParams } from '../types/members';

interface UseMembersState {
  members: Member[];
  total: number;
  page: number;
  perPage: number;
  isLoading: boolean;
  error: string | null;
}

export function useMembers(token: string) {
  const [state, setState] = useState<UseMembersState>({
    members: [],
    total: 0,
    page: 1,
    perPage: 10,
    isLoading: false,
    error: null,
  });

  const loadMembers = useCallback(
    async (page: number = 1, search?: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetchMembers(token, {
          page,
          search,
        });

        const payload = response as any;
        const rawData = Array.isArray(payload.data) ? payload.data : [];

        const totalItems = payload.total_items ?? rawData.length;
        const currentPage = payload.current_page ?? page;
        const perPage = payload.per_page ?? state.perPage;

        setState((prev) => ({
          ...prev,
          members: rawData,
          total: totalItems,
          page: currentPage,
          perPage,
          isLoading: false,
        }));
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data member';
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
      loadMembers(1);
    }
  }, [token, loadMembers]);

  return {
    members: state.members,
    total: state.total,
    page: state.page,
    perPage: state.perPage,
    isLoading: state.isLoading,
    error: state.error,
    loadMembers,
  };
}
