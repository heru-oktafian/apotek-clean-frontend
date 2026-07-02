// ── Supplier Category ─────────────────────────────────────────────────────────
// GET /api/supplier-categories-combo?search=...
// Response: Could be array directly or { status, message, data: [...] }

export interface SupplierCategory {
  id: number;
  nama: string;
  branchId?: string;
}

export interface SupplierCategoriesResponse {
  status?: string;
  message?: string;
  data: SupplierCategory[];
}

export interface SupplierCategoriesParams {
  search?: string;
}
