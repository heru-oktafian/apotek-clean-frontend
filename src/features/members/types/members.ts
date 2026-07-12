/**
 * Member / Anggota — types
 * Represents a registered loyalty program member/customer.
 */

/**
 * Represents a single member/loyalty customer.
 */
export interface Member {
  /** Unique string identifier. */
  id: string;
  /** Full name of the member. */
  name: string;
  /** Contact phone number. */
  phone: string;
  /** Physical address of the member. */
  address: string;
  /** Human-readable category name (e.g., "Silver", "Gold"). */
  member_category: string;
  /** Current loyalty points balance. */
  points: number;
}

/**
 * Paginated response when fetching a list of members.
 */
export interface MembersResponse {
  /** API status string (e.g., "success"). */
  status: string;
  /** Human-readable message from the API. */
  message: string;
  /** Search term used in the request. */
  search: string;
  /** Total number of members matching the query. */
  total_items: number;
  /** Current page number. */
  current_page: number;
  /** Total number of available pages. */
  total_pages: number;
  /** Number of items per page. */
  per_page: number;
  /** Array of member objects for the current page. */
  data: Member[];
}

/**
 * Query parameters for listing members with pagination and search.
 */
export interface MembersListParams {
  /** Page number (1-indexed). */
  page?: number;
  /** Search term to filter members by name or phone. */
  search?: string;
}
