import type { BranchOption, User, UserBranchAccess, UsersListParams, UsersListResponse } from '../types/users'

const dummyUsers: User[] = [
  { id: '1', username: 'vita_fauzi', name: 'Vita Fauzi. M', user_role: 'Superadmin', status: 'Active', branch_id: 'AZF' },
  { id: '2', username: 'zia', name: 'Zia', user_role: 'Admin', status: 'Active', branch_id: 'BRC' },
  { id: '3', username: 'fanny', name: 'Fanny', user_role: 'Staff', status: 'Active', branch_id: 'TBB' },
  { id: '4', username: 'lala', name: 'Lala', user_role: 'Staff', status: 'Inactive', branch_id: 'SLG' },
  { id: '5', username: 'rio', name: 'Rio Kurniawan', user_role: 'Kasir', status: 'Active', branch_id: 'AZF' },
]

const dummyBranches: BranchOption[] = [
  { branch_id: 'AZF', branch_name: 'Apotek Zijda Farma' },
  { branch_id: 'BRC', branch_name: 'Branch Central' },
  { branch_id: 'TBB', branch_name: 'Tebet Branch' },
  { branch_id: 'SLG', branch_name: 'Salaga Branch' },
]

const dummyBranchAccess: Record<string, UserBranchAccess[]> = {
  '1': [
    { id: 'access-1-AZF', branch_id: 'AZF', branch_name: 'Apotek Zijda Farma', role: 'Superadmin', status: 'Active' },
    { id: 'access-1-BRC', branch_id: 'BRC', branch_name: 'Branch Central', role: 'Superadmin', status: 'Active' },
  ],
  '2': [
    { id: 'access-2-AZF', branch_id: 'AZF', branch_name: 'Apotek Zijda Farma', role: 'Admin', status: 'Active' },
  ],
  '3': [
    { id: 'access-3-AZF', branch_id: 'AZF', branch_name: 'Apotek Zijda Farma', role: 'Staff', status: 'Active' },
  ],
  '4': [
    { id: 'access-4-AZF', branch_id: 'AZF', branch_name: 'Apotek Zijda Farma', role: 'Staff', status: 'Inactive' },
  ],
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizeSearchValue(value?: string) {
  return String(value || '').trim().toLowerCase()
}

export async function fetchUsers(token: string, params: UsersListParams = {}): Promise<UsersListResponse> {
  await delay(250)

  const { page = 1, perPage = 10, search, branch_id } = params
  const searchValue = normalizeSearchValue(search)

  let users = dummyUsers

  const branchIds = new Set(dummyBranches.map((branch) => branch.branch_id))
  if (branch_id && branchIds.has(branch_id)) {
    users = users.filter((user) => user.branch_id === branch_id)
  }

  if (searchValue) {
    users = users.filter((user) => {
      return (
        user.username.toLowerCase().includes(searchValue) ||
        user.name.toLowerCase().includes(searchValue) ||
        user.user_role.toLowerCase().includes(searchValue)
      )
    })
  }

  const total_items = users.length
  const start = (page - 1) * perPage
  const paged = users.slice(start, start + perPage)

  return {
    data: paged,
    total_items,
    current_page: page,
    per_page: perPage,
  }
}

export async function fetchUserById(token: string, userId: string): Promise<User> {
  await delay(200)
  const user = dummyUsers.find((item) => item.id === userId)
  if (!user) {
    throw new Error('User tidak ditemukan')
  }
  return user
}

export async function fetchUserBranchAccess(token: string, userId: string): Promise<UserBranchAccess[]> {
  await delay(200)
  return dummyBranchAccess[userId] ? [...dummyBranchAccess[userId]] : []
}

export async function fetchBranchOptions(token: string): Promise<BranchOption[]> {
  await delay(250)
  return [...dummyBranches]
}

export async function addUserBranchAccess(token: string, userId: string, branchId: string): Promise<UserBranchAccess> {
  await delay(200)

  const user = dummyUsers.find((item) => item.id === userId)
  if (!user) {
    throw new Error('User tidak ditemukan')
  }

  const branch = dummyBranches.find((item) => item.branch_id === branchId)
  if (!branch) {
    throw new Error('Branch tidak valid')
  }

  const currentAccess = dummyBranchAccess[userId] ?? []
  if (currentAccess.some((item) => item.branch_id === branchId)) {
    throw new Error('User sudah memiliki akses ke branch tersebut')
  }

  const newAccess: UserBranchAccess = {
    id: `access-${userId}-${branchId}`,
    branch_id: branch.branch_id,
    branch_name: branch.branch_name,
    role: user.user_role,
    status: 'Active',
  }

  dummyBranchAccess[userId] = [...currentAccess, newAccess]
  return newAccess
}

export async function removeUserBranchAccess(token: string, userId: string, accessId: string): Promise<void> {
  await delay(200)

  const currentAccess = dummyBranchAccess[userId] ?? []
  dummyBranchAccess[userId] = currentAccess.filter((item) => item.id !== accessId)
}
