import { apiRequest } from '../../../lib/api/client';
import type { SuppliersResponse, SuppliersListParams, Supplier } from '../types/suppliers';
import type { SupplierCategoriesResponse, SupplierCategoriesParams } from '../types/supplier-categories';

// ── List Suppliers ───────────────────────────────────────────────────────────
// GET /api/suppliers?page=1&search=...
export const fetchSuppliers = async (token: string, params?: SuppliersListParams) => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) {
    queryParams.append('page', String(params.page));
  }
  
  if (params?.search) {
    queryParams.append('search', params.search);
  }

  const query = queryParams.toString();
  const url = query ? `/api/suppliers?${query}` : '/api/suppliers';

  const res = await apiRequest<SuppliersResponse>(url, { token });
  return res;
};

// ── Create Supplier ──────────────────────────────────────────────────────────
// POST /api/suppliers
export const createSupplier = async (
  token: string,
  body: {
    name: string;
    phone: string;
    address: string;
    categoryId: number;
    pic?: string;
  }
) => {
  const url = '/api/suppliers';
  const res = await apiRequest<Supplier>(url, {
    token,
    method: 'POST',
    body: {
      name: body.name,
      phone: body.phone,
      address: body.address,
      supplier_category_id: body.categoryId,
      pic: body.pic,
    },
  });
  return res;
};

// ── Update Supplier ──────────────────────────────────────────────────────────
// PUT /api/suppliers/{id}
export const updateSupplier = async (
  token: string,
  id: number,
  body: {
    name: string;
    phone: string;
    address: string;
    categoryId: number;
    pic?: string;
  }
) => {
  const url = `/api/suppliers/${id}`;
  const res = await apiRequest<Supplier>(url, {
    token,
    method: 'PUT',
    body: {
      name: body.name,
      phone: body.phone,
      address: body.address,
      supplier_category_id: body.categoryId,
      pic: body.pic,
    },
  });
  return res;
};

// ── Delete Supplier ──────────────────────────────────────────────────────────
// DELETE /api/suppliers/{id}
export const deleteSupplier = async (token: string, id: number) => {
  const url = `/api/suppliers/${id}`;
  const res = await apiRequest<{ status: string; message: string }>(url, { token, method: 'DELETE' });
  return res;
};

// ── Fetch Supplier Categories ────────────────────────────────────────────────
// GET /api/supplier-categories-combo?search=...
export const fetchSupplierCategories = async (token: string, params?: SupplierCategoriesParams) => {
  const queryParams = new URLSearchParams();
  
  if (params?.search) {
    queryParams.append('search', params.search);
  }

  const query = queryParams.toString();
  const url = query ? `/api/supplier-categories-combo?${query}` : '/api/supplier-categories-combo';

  const res = await apiRequest<SupplierCategoriesResponse>(url, { token });
  return res;
};
