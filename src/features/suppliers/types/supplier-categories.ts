/**
 * Supplier Category — types
 * Represents a category used to classify suppliers (e.g., "Farmasi", "Alkes").
 */

/**
 * Represents a single supplier category.
 */
export interface SupplierCategory {
  /** Unique numeric identifier. */
  id: number;
  /** Category name in Indonesian. */
  nama: string;
  /** Associated branch identifier (optional). */
  branchId?: string;
}

/**
 * Response shape for supplier categories endpoint.
 * May return a raw array or a wrapped object with status/message/data.
 */
export interface SupplierCategoriesResponse {
  /** API status string (optional when array is returned directly). */
  status?: string;
  /** Human-readable message from the API (optional). */
  message?: string;
  /** Array of supplier category objects. */
  data: SupplierCategory[];
}

/**
 * Query parameters for fetching supplier categories (typically for combo/dropdown).
 */
export interface SupplierCategoriesParams {
  /** Search term to filter categories by name. */
  search?: string;
}
