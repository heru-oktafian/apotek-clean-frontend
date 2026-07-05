export interface MemberCategory {
  id: number;
  nama: string;
  pointsConversionRate: number;
  branchId: string;
}

export interface MemberCategoriesParams {
  page?: number;
  search?: string;
}

export interface MemberCategoriesResponse {
  data?: any[];
  total_items?: number;
  total?: number;
  current_page?: number;
  page?: number;
  per_page?: number;
  pagination?: {
    total?: number;
    page?: number;
    per_page?: number;
  };
  meta?: {
    total?: number;
    current_page?: number;
    per_page?: number;
  };
}
