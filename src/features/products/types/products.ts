export interface ProductCategory {
  product_category_id: number;
  product_category_name: string;
}

export interface Unit {
  unit_id: string;
  unit_name: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  alias: string;
  description: string;
  ingredient: string;
  dosage: string;
  side_affection: string;
  unit_id: string;
  unit_name: string;
  stock: number;
  purchase_price: number;
  expired_date: string;
  sales_price: number;
  alternate_price: number;
  product_category_id: number;
  product_category_name: string;
}

export interface ProductsListResponse {
  status: string;
  message: string;
  search?: string;
  total_items: number;
  current_page: number;
  total_pages: number;
  per_page: number;
  data: Product[];
}

export interface ComboResponse<T> {
  status: string;
  message: string;
  data: T[];
}
