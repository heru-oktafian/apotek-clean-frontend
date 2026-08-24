// Types for Sales feature

// === Product Combobox ===
export interface SalesProductComboItem {
  product_id: string;
  product_name: string;
  price: number;
  stock: number;
  showcase_stock: number;
  unit_name: string;
}

// === Member Combobox ===
export interface SalesMemberComboItem {
  member_id: string;
  member_name: string;
}

// === Sale List ===
export interface SaleListItem {
  id: string;
  description: string;
  payment: 'paid_by_cash' | 'paid_by_credit' | string;
  total_sale: number;
}

export interface SaleListResponse {
  status: 'success' | 'error';
  message: string;
  search: string;
  total_items: number;
  current_page: number;
  total_pages: number;
  per_page: number;
  data: SaleListItem[];
}

// === Sale Items (View) ===
export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  price: number;
  qty: number;
  unit_name: string;
  sub_total: number;
}

export interface SaleItemsResponse {
  status: 'success' | 'error';
  message: string;
  data: SaleItem[];
}

// === Sale Detail (for Print) ===
export interface SaleDetailPrint {
  id: string;
  member_id: string;
  member_name: string;
  sale_date: string;
  total_sale: number;
  discount: number;
  profit_estimate: number;
  payment: string;
  items: SaleItem[];
}

export interface SaleDetailResponse {
  status: 'success' | 'error';
  message: string;
  data: SaleDetailPrint;
}

// === Sale (Full detail from Create/Update) ===
export interface Sale {
  id: string;
  member_id: string;
  sale_date: string;
  branch_id: string;
  total_sale: number;
  discount: number;
  profit_estimate: number;
  payment: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface SaleItemCreated {
  id: string;
  sale_id: string;
  product_id: string;
  price: number;
  qty: number;
  sub_total: number;
}

export interface SaleCreateResponse {
  status: 'success' | 'error';
  message: string;
  data: {
    sale: Sale;
    sale_items: SaleItemCreated[];
  };
}

export interface SaleUpdateResponse {
  status: 'success' | 'error';
  message: string;
  data: Sale;
}

export interface SaleDeleteResponse {
  status: 'success' | 'error';
  message: string;
  data: Sale;
}

// === Sale Item (CRUD responses) ===
export interface SaleItemResponse {
  status: 'success' | 'error';
  message: string;
  data: SaleItemCreated;
}

// === Form Data ===
export interface SaleItemFormData {
  product_id: string;
  price: number;
  qty: number;
  sub_total: number;
}

export interface SaleFormData {
  payment: 'paid_by_cash' | 'paid_by_credit';
  member_id?: string;
  discount?: number;
}

export interface CreateSalePayload {
  sale: {
    payment: string;
  };
  sale_items: SaleItemFormData[];
}

export interface UpdateSalePayload {
  member_id: string;
  payment: string;
  discount: number;
}

export interface AddSaleItemPayload {
  sale_id: string;
  product_id: string;
  qty: number;
}

export interface UpdateSaleItemPayload {
  sale_id: string;
  product_id: string;
  price: number;
  qty: number;
}

// === Payment Options ===
export const PAYMENT_OPTIONS = [
  { value: 'paid_by_cash', label: 'Tunai' },
  { value: 'paid_by_credit', label: 'Kredit' },
] as const;

export type PaymentType = typeof PAYMENT_OPTIONS[number]['value'];
