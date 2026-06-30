// ── Unit / Satuan ──────────────────────────────────────────────────────────
// GET /api/units
// Response: { data: [Unit], pagination: { page, per_page, total } }

export interface Unit {
  id?: string | number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface UnitsResponse {
  data: Unit[];
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages?: number;
  };
}

export interface UnitsListParams {
  page?: number;
  per_page?: number;
  search?: string;
}
