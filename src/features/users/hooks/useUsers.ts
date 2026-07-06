import { useCallback, useEffect, useState } from 'react'
import { fetchUsers } from '../api/users-api'
import type { User } from '../types/users'

interface UseUsersState {
  users: User[]
  total: number
  page: number
  perPage: number
  isLoading: boolean
  error: string | null
}

export function useUsers(token: string, branchId?: string) {
  const [state, setState] = useState<UseUsersState>({
    users: [],
    total: 0,
    page: 1,
    perPage: 10,
    isLoading: false,
    error: null,
  })

  const loadUsers = useCallback(
    async (page: number = 1, search?: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const response = await fetchUsers(token, {
          page,
          perPage: state.perPage,
          search,
          branch_id: branchId,
        })

        setState((prev) => ({
          ...prev,
          users: response.data,
          total: response.total_items,
          page: response.current_page,
          perPage: response.per_page,
          isLoading: false,
        }))
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data user'
        setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }))
      }
    },
    [token, state.perPage, branchId]
  )

  useEffect(() => {
    loadUsers(1)
  }, [loadUsers])

  return {
    users: state.users,
    total: state.total,
    page: state.page,
    perPage: state.perPage,
    isLoading: state.isLoading,
    error: state.error,
    loadUsers,
  }
}
