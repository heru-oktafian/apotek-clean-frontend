// ── Supplier / Pemasok ────────────────────────────────────────────────────────
// GET /api/suppliers?page=1&search=
// Response: { status, data: [Supplier], pagination: { page, per_page, total } }

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  supplier_category: string;
  supplier_category_id: number;
  pic?: string;
}

export interface SuppliersResponse {
  status: string;
  message: string;
  search: string;
  total_items: number;
  current_page: number;
  total_pages: number;
  per_page: number;
  data: Supplier[];
}

export interface SuppliersListParams {
  page?: number;
  search?: string;
}
