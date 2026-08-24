// API layer for Sales feature
import { apiRequest } from '../../../lib/api/client';
import { buildApiUrl } from '../../../lib/api/env';
import type {
  SalesProductComboItem,
  SalesMemberComboItem,
  SaleListResponse,
  SaleItemsResponse,
  SaleDetailResponse,
  SaleCreateResponse,
  SaleUpdateResponse,
  SaleDeleteResponse,
  SaleItemResponse,
  CreateSalePayload,
  UpdateSalePayload,
  AddSaleItemPayload,
  UpdateSaleItemPayload,
} from '../types/sales';

// === Product Combobox ===
export async function fetchSalesProductsCombo(
  token: string,
  search: string = ''
): Promise<SalesProductComboItem[]> {
  const response = await apiRequest<{ status: string; data: SalesProductComboItem[] }>(
    `/api/sales-products-combo?search=${encodeURIComponent(search)}`,
    { token }
  );
  return response.data || [];
}

// === Member Combobox ===
export async function fetchSalesMembersCombo(
  token: string,
  search: string = ''
): Promise<SalesMemberComboItem[]> {
  const response = await apiRequest<{ status: string; data: SalesMemberComboItem[] }>(
    `/api/members-combo?search=${encodeURIComponent(search)}`,
    { token }
  );
  return response.data || [];
}

// === Sales List ===
export async function fetchSalesList(
  token: string,
  params: {
    page?: number;
    search?: string;
    month?: string;
  } = {}
): Promise<SaleListResponse> {
  const { page = 1, search = '', month = '' } = params;
  const query = new URLSearchParams({
    page: String(page),
    search,
    ...(month && { month }),
  });

  return apiRequest<SaleListResponse>(`/api/sales-details?${query}`, { token });
}

// === Create Sale ===
export async function createSale(
  token: string,
  payload: CreateSalePayload
): Promise<SaleCreateResponse> {
  return apiRequest<SaleCreateResponse>('/api/sales', {
    method: 'POST',
    token,
    body: payload,
  });
}

// === Update Sale ===
export async function updateSale(
  token: string,
  saleId: string,
  payload: UpdateSalePayload
): Promise<SaleUpdateResponse> {
  return apiRequest<SaleUpdateResponse>(`/api/sales/${saleId}`, {
    method: 'PUT',
    token,
    body: payload,
  });
}

// === Delete Sale ===
export async function deleteSale(
  token: string,
  saleId: string
): Promise<SaleDeleteResponse> {
  return apiRequest<SaleDeleteResponse>(`/api/sales/${saleId}`, {
    method: 'DELETE',
    token,
  });
}

// === View Sale Items ===
export async function fetchSaleItems(
  token: string,
  saleId: string
): Promise<SaleItemsResponse> {
  return apiRequest<SaleItemsResponse>(`/api/sale-items/all/${saleId}`, { token });
}

// === Add Sale Item ===
export async function addSaleItem(
  token: string,
  payload: AddSaleItemPayload
): Promise<SaleItemResponse> {
  return apiRequest<SaleItemResponse>('/api/sale-items', {
    method: 'POST',
    token,
    body: payload,
  });
}

// === Update Sale Item ===
export async function updateSaleItem(
  token: string,
  itemId: string,
  payload: UpdateSaleItemPayload
): Promise<SaleItemResponse> {
  return apiRequest<SaleItemResponse>(`/api/sale-items/${itemId}`, {
    method: 'PUT',
    token,
    body: payload,
  });
}

// === Delete Sale Item ===
export async function deleteSaleItem(
  token: string,
  itemId: string
): Promise<SaleItemResponse> {
  return apiRequest<SaleItemResponse>(`/api/sale-items/${itemId}`, {
    method: 'DELETE',
    token,
  });
}

// === Get Sale Detail (for Print) ===
export async function fetchSaleDetail(
  token: string,
  saleId: string
): Promise<SaleDetailResponse> {
  return apiRequest<SaleDetailResponse>(`/api/sales/${saleId}`, { token });
}

// === Download Reports ===
export function getSalesPdfUrl(token: string, month: string): string {
  return buildApiUrl(`/api/sales/pdf?month=${month}`) + `&token=${encodeURIComponent(token)}`;
}

export function getSalesExcelUrl(token: string, month: string): string {
  return buildApiUrl(`/api/sales/excel?month=${month}`) + `&token=${encodeURIComponent(token)}`;
}

export function getSaleItemsPdfUrl(token: string, saleId: string): string {
  return buildApiUrl(`/api/sale-items/pdf?sale_id=${saleId}`) + `&token=${encodeURIComponent(token)}`;
}

export function getSaleItemsExcelUrl(token: string, saleId: string): string {
  return buildApiUrl(`/api/sale-items/excel?sale_id=${saleId}`) + `&token=${encodeURIComponent(token)}`;
}
