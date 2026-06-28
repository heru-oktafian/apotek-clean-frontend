import { apiRequest } from '../../lib/api/client'
import type { ApiResponse, BranchOption, ProfileData } from '../../types/api'

export async function login(username: string, password: string) {
  return apiRequest<ApiResponse<string>>('/api/login', {
    method: 'POST',
    body: { username, password },
  })
}

export async function listBranches(token: string): Promise<ApiResponse<BranchOption[]>> {
  const response = await apiRequest<ApiResponse<unknown>>('/api/list_branches', { token })
  // Backend bisa return single object atau array — normalisasi jadi array
  let data: BranchOption[]
  if (Array.isArray(response.data)) {
    data = response.data
  } else if (response.data && typeof response.data === 'object') {
    data = [response.data as BranchOption]
  } else {
    data = []
  }
  return { ...response, data }
}

export async function setBranch(token: string, branchId: string) {
  return apiRequest<ApiResponse<string>>('/api/set_branch', {
    method: 'POST',
    token,
    body: { branch_id: branchId },
  })
}

export async function getProfile(token: string) {
  return apiRequest<ApiResponse<ProfileData>>('/api/profile', {
    token,
  })
}

export function normalizeBranch(branch: BranchOption) {
  return {
    ...branch,
    branch_id: branch.branch_id || branch.id,
    branch_name: branch.branch_name || branch.name || 'Cabang',
  }
}
