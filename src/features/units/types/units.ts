/**
 * Unit / Satuan — types
 * Represents a unit of measurement used for products (e.g., tablet, capsule, ml).
 */

/**
 * Represents a single unit of measurement.
 */
export interface Unit {
  /** Unique identifier (string or number depending on backend). */
  id?: string | number;
  /** Display name of the unit (e.g., "Tablet", "Kapsul"). */
  name: string;
  /** ISO timestamp when the unit was created. */
  created_at?: string;
  /** ISO timestamp when the unit was last updated. */
  updated_at?: string;
}

/**
 * Paginated response when fetching a list of units.
 */
export interface UnitsResponse {
  /** Array of unit objects. */
  data: Unit[];
  /** Pagination metadata. */
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages?: number;
  };
}

/**
 * Query parameters for listing units with pagination and search.
 */
export interface UnitsListParams {
  /** Page number (1-indexed). */
  page?: number;
  /** Number of items per page. */
  per_page?: number;
  /** Search term to filter units by name. */
  search?: string;
}
