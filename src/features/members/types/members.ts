// ── Member / Anggota ───────────────────────────────────────────────────────
// GET /api/members?page=1&search=
// Response: { status, data: [Member], pagination: { page, per_page, total } }

export interface Member {
  id: string;
  name: string;
  phone: string;
  address: string;
  member_category: string;
  points: number;
}

export interface MembersResponse {
  status: string;
  message: string;
  search: string;
  total_items: number;
  current_page: number;
  total_pages: number;
  per_page: number;
  data: Member[];
}

export interface MembersListParams {
  page?: number;
  search?: string;
}
