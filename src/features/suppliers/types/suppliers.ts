/**
 * Supplier / Pemasok — types
 * Represents a supplier/vendor from whom products are purchased.
 */

/**
 * Represents a single supplier/vendor.
 */
export interface Supplier {
  /** Unique string identifier. */
  id: string;
  /** Full name or business name of the supplier. */
  name: string;
  /** Contact phone number. */
  phone: string;
  /** Physical address of the supplier. */
  address: string;
  /** Human-readable category name (e.g., "Farmasi", "Alat Kesehatan"). */
  supplier_category: string;
  /** Numeric ID referencing the supplier category. */
  supplier_category_id: number;
  /** Person in charge / contact person (optional). */
  pic?: string;
}

/**
 * Paginated response when fetching a list of suppliers.
 */
export interface SuppliersResponse {
  /** API status string (e.g., "success"). */
  status: string;
  /** Human-readable message from the API. */
  message: string;
  /** Search term used in the request. */
  search: string;
  /** Total number of suppliers matching the query. */
  total_items: number;
  /** Current page number. */
  current_page: number;
  /** Total number of available pages. */
  total_pages: number;
  /** Number of items per page. */
  per_page: number;
  /** Array of supplier objects for the current page. */
  data: Supplier[];
}

/**
 * Query parameters for listing suppliers with pagination and search.
 */
export interface SuppliersListParams {
  /** Page number (1-indexed). */
  page?: number;
  /** Search term to filter suppliers by name or address. */
  search?: string;
}
