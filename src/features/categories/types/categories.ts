/**
 * Product Category — types
 * Represents a category used to group products (e.g., "Obat keras", "Suplemen").
 */

/**
 * Represents a single product category.
 */
export interface Category {
  /** Unique numeric identifier. */
  id: number;
  /** Category name in Indonesian. */
  nama: string;
}

/**
 * Query parameters for listing categories with pagination and search.
 */
export interface CategoriesListParams {
  /** Page number (1-indexed). */
  page?: number;
  /** Search term to filter categories by name. */
  search?: string;
}

/**
 * Flexible response shape for categories endpoint.
 * Supports multiple backend response formats.
 */
export interface CategoriesResponse {
  /** Array of category objects. */
  data?: Category[];
  /** Alternative array key used by some endpoints. */
  items?: Category[];
  /** Another alternative array key. */
  rows?: Category[];
  /** Total count of items (alternative keys). */
  total_items?: number;
  total?: number;
  current_page?: number;
  page?: number;
  per_page?: number;
  /** Nested pagination object. */
  pagination?: {
    total?: number;
    page?: number;
    per_page?: number;
  };
  /** Alternative meta object for pagination. */
  meta?: {
    total?: number;
    current_page?: number;
    per_page?: number;
  };
}
