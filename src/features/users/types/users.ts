export interface User {
  id: string
  username: string
  name: string
  user_role: string
  status: string
  branch_id?: string
}

export interface UserBranchAccess {
  id: string
  branch_id: string
  branch_name: string
  role: string
  status: string
}

export interface BranchOption {
  branch_id: string
  branch_name: string
}

export interface UsersListParams {
  page?: number
  perPage?: number
  search?: string
  branch_id?: string
}

export interface UsersListResponse {
  data: User[]
  total_items: number
  current_page: number
  per_page: number
}
