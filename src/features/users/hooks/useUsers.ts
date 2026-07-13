/**
 * @module users/useUsers
 * @description Hook untuk mengelola data user/staff apotek.
 */
import { useState, useEffect, useCallback } from "react";
import { fetchUsers, fetchUserById, updateUser } from "../api/users-api";
import type { User } from "../types/users";
import type { UsersListResponse } from "../types/users";

interface UseUsersState {
  users: User[];
  selectedUser: User | null;
  total: number;
  page: number;
  perPage: number;
  isLoading: boolean;
  error: string | null;
  actionLoading: boolean;
}

export function useUsers(token: string) {
  const [state, setState] = useState<UseUsersState>({
    users: [],
    selectedUser: null,
    total: 0,
    page: 1,
    perPage: 10,
    isLoading: false,
    error: null,
    actionLoading: false,
  });

  const loadUsers = useCallback(async (requestedPage = 1, search = "") => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetchUsers(token, {
        page: requestedPage,
        perPage: state.perPage,
        search,
      });
      const payload = response as unknown as Record<string, unknown>;
      const rawData: User[] = Array.isArray(payload.data)
        ? (payload.data as unknown as User[])
        : Array.isArray((payload.data as Record<string, unknown>)?.data)
        ? ((payload.data as Record<string, unknown>).data as unknown as User[])
        : Array.isArray((payload.data as Record<string, unknown>)?.items)
        ? ((payload.data as Record<string, unknown>).items as unknown as User[])
        : Array.isArray(payload)
        ? (payload as unknown as User[])
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
        users: rawData,
        total: totalItems,
        page: currentPage,
        perPage,
        isLoading: false,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal memuat data user";
      setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
    }
  }, [token, state.perPage]);

  const getUserById = useCallback(async (userId: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetchUserById(token, userId);
      const payload = response as unknown as Record<string, unknown>;
      const userData = ((payload.data as Record<string, unknown>) ?? payload) as unknown as User;
      setState((prev) => ({ ...prev, selectedUser: userData, isLoading: false }));
      return userData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal memuat detail user";
      setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
      return null;
    }
  }, [token]);

  const editUser = useCallback(async (userId: string, payload: Partial<User>) => {
    setState((prev) => ({ ...prev, actionLoading: true, error: null }));
    try {
      const response = await updateUser(token, userId, payload);
      const updatedUser = response as unknown as User;
      setState((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
        selectedUser: updatedUser,
        actionLoading: false,
      }));
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal mengupdate user";
      setState((prev) => ({ ...prev, error: errorMessage, actionLoading: false }));
      return null;
    }
  }, [token]);

  useEffect(() => {
    if (token) void loadUsers(1);
  }, [token, loadUsers]);

  return {
    users: state.users,
    selectedUser: state.selectedUser,
    total: state.total,
    page: state.page,
    perPage: state.perPage,
    isLoading: state.isLoading,
    error: state.error,
    actionLoading: state.actionLoading,
    loadUsers,
    getUserById,
    editUser,
  };
}
