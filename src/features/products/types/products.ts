export interface ProductCategory {
  product_category_id: number;
  product_category_name: string;
}

export interface Unit {
  unit_id: string;
  unit_name: string;
}

// Product — display model (GET response, read-only list view)
// Pola: FK IDs tidak ada di sini, hanya resolved names
// stock/showcase_stock/warehouse_stock adalah read-only (tidak bisa diedit lewat master product)
export interface Product {
  id: string;
  sku: string;
  name: string;
  alias: string;
  description: string;
  ingredient: string;
  dosage: string;
  side_affection: string;
  unit_name: string;
  stock: number;
  showcase_stock: number;
  warehouse_stock: number;
  purchase_price: number;
  sales_price: number;
  alternate_price: number;
  expired_date: string;
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
