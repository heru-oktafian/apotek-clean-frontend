import { apiRequest } from '../../lib/api/client'
import type { ApiResponse, BranchOption, ProfileData } from '../../types/api'

function unwrapTokenResponse(response: ApiResponse<unknown>): string {
  const { data } = response
  if (typeof data === 'string') {
    return data
  }

  if (data && typeof data === 'object') {
    if ('token' in data && typeof (data as any).token === 'string') {
      return (data as any).token
    }
    if ('access_token' in data && typeof (data as any).access_token === 'string') {
      return (data as any).access_token
    }
    if ('data' in data && typeof (data as any).data === 'string') {
      return (data as any).data
    }
  }

  throw new Error('Invalid token response from auth endpoint')
}

export async function login(username: string, password: string) {
  const response = await apiRequest<ApiResponse<unknown>>('/api/login', {
    method: 'POST',
    body: { username, password },
  })
  return { ...response, data: unwrapTokenResponse(response) }
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
  const response = await apiRequest<ApiResponse<unknown>>('/api/set_branch', {
    method: 'POST',
    token,
    body: { branch_id: branchId },
  })
  return { ...response, data: unwrapTokenResponse(response) }
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
