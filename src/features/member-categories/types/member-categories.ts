/**
 * Member Category — types
 * Represents a loyalty tier or membership level (e.g., "Silver", "Gold", "Platinum").
 */

/**
 * Represents a single member category / loyalty tier.
 */
export interface MemberCategory {
  /** Unique numeric identifier. */
  id: number;
  /** Category name in Indonesian. */
  nama: string;
  /** Conversion rate for points earned per transaction. */
  pointsConversionRate: number;
  /** Associated branch identifier. */
  branchId: string;
}

/**
 * Query parameters for listing member categories with pagination and search.
 */
export interface MemberCategoriesParams {
  /** Page number (1-indexed). */
  page?: number;
  /** Search term to filter categories by name. */
  search?: string;
}

/**
 * Flexible response shape for member categories endpoint.
 * Supports multiple backend response formats.
 */
export interface MemberCategoriesResponse {
  /** Array of member category objects. */
  data?: MemberCategory[];
  /** Total count of items. */
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
