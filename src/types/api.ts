export interface ApiResponse<T> {
  status: string
  message: string
  data: T
}

export interface BranchOption {
  branch_id?: string
  id?: string
  branch_name?: string
  name?: string
  address?: string
  phone?: string
  sia_name?: string
  sipa_name?: string
}

export interface ProfileData {
  id?: string
  user_id?: string
  username?: string
  name?: string
  user_role?: string
  [key: string]: unknown
}
