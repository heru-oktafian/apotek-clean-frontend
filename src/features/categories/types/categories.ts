export interface Category {
  id: number;
  nama: string;
}

export interface CategoriesListParams {
  page?: number;
  search?: string;
}

export interface CategoriesResponse {
  data?: any[];
  items?: any[];
  rows?: any[];
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
