// ── Member Category / Kategori Member ──────────────────────────────────────
// GET /api/member-categories-combo?search=
// Response: { status, data: [MemberCategory] }

export interface MemberCategory {
  member_category_id: number;
  member_category_name: string;
}

export interface MemberCategoriesResponse {
  status: string;
  message: string;
  data: MemberCategory[];
}

export interface MemberCategoriesParams {
  search?: string;
}
