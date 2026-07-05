// ── Unit Conversion / Konversi Satuan ──────────────────────────────────────────
// GET /api/unit-conversions?page=1&search=
// Response: { data: [UnitConversion], pagination: { page, per_page, total } }

export interface UnitConversion {
  id?: string | number;
  product_id?: string | number;
  product_name?: string;
  from_unit_id?: string | number;
  from_unit_name?: string;
  to_unit_id?: string | number;
  to_unit_name?: string;
  init_id?: string | number;
  initId?: string | number;
  final_id?: string | number;
  finalId?: string | number;
  conversion_value?: number | string;
  value_conv?: number | string;
  created_at?: string;
  updated_at?: string;
}

export interface UnitConversionsResponse {
  data: UnitConversion[];
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages?: number;
  };
}

export interface UnitConversionsListParams {
  page?: number;
  per_page?: number;
  search?: string;
}

// ── Combo types ────────────────────────────────────────────────────────────────
// GET /api/conversion-products-combo?search=
export interface ProductCombo {
  id: string | number;
  nama?: string;
  name?: string;
}

export interface ProductComboResponse {
  data?: ProductCombo[];
}

// GET /api/units-combo?search=
export interface UnitCombo {
  id: string | number;
  nama?: string;
  name?: string;
}

export interface UnitComboResponse {
  data?: UnitCombo[];
}
