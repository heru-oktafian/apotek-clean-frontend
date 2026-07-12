/**
 * User — types
 * Represents a system user (staff, admin, superadmin, cashier, etc.).
 */

/**
 * Represents a system user account.
 */
export interface User {
  /** Unique string identifier. */
  id: string;
  /** Login username. */
  username: string;
  /** Display name. */
  name: string;
  /** Role label (e.g., "Superadmin", "Admin", "Staff", "Kasir"). */
  user_role: string;
  /** Account status (e.g., "Active", "Inactive"). */
  status: string;
  /** Primary branch identifier this user belongs to. */
  branch_id?: string;
}

/**
 * Represents a user's access record for a specific branch.
 */
export interface UserBranchAccess {
  /** Unique access record ID. */
  id: string;
  /** Branch identifier. */
  branch_id: string;
  /** Human-readable branch name. */
  branch_name: string;
  /** Role assigned for this branch access. */
  role: string;
  /** Access status (e.g., "Active", "Inactive"). */
  status: string;
}

/**
 * Represents a branch option available for selection in dropdowns.
 */
export interface BranchOption {
  /** Branch identifier. */
  branch_id: string;
  /** Human-readable branch name. */
  branch_name: string;
}

/**
 * Query parameters for listing users with pagination, search, and branch filter.
 */
export interface UsersListParams {
  /** Page number (1-indexed). */
  page?: number;
  /** Number of items per page. */
  perPage?: number;
  /** Search term to filter users by username or name. */
  search?: string;
  /** Filter by specific branch ID. */
  branch_id?: string;
}

/**
 * Paginated response when fetching a list of users.
 */
export interface UsersListResponse {
  /** Array of user objects for the current page. */
  data: User[];
  /** Total number of users matching the query. */
  total_items: number;
  /** Current page number. */
  current_page: number;
  /** Number of items per page. */
  per_page: number;
}
