import { apiRequest } from '../../../lib/api/client';
import { buildApiUrl } from '../../../lib/api/env';
import type { ProductCategory, Unit, ComboResponse, ProductsListResponse } from '../types/products';

/**
 * Fetch product categories combo for dropdown
 */
export async function fetchProductCategoriesCombo(
  token: string,
  params: { search?: string } = {}
): Promise<ComboResponse<ProductCategory>> {
  const queryParams = new URLSearchParams();
  if (params.search) {
    queryParams.append('search', params.search);
  }

  const response = await apiRequest<ComboResponse<ProductCategory>>(
    `/api/product-categories-combo?${queryParams.toString()}`,
    { token }
  );

  return response as ComboResponse<ProductCategory>;
}

/**
 * Fetch units combo for dropdown
 */
export async function fetchUnitsCombo(
  token: string,
  params: { search?: string } = {}
): Promise<ComboResponse<Unit>> {
  const queryParams = new URLSearchParams();
  if (params.search) {
    queryParams.append('search', params.search);
  }

  const response = await apiRequest<ComboResponse<Unit>>(
    `/api/units-combo?${queryParams.toString()}`,
    { token }
  );

  return response as ComboResponse<Unit>;
}

/**
 * Fetch all products with pagination and search
 */
export async function fetchProducts(
  token: string,
  page: number = 1,
  search: string = ''
): Promise<ProductsListResponse> {
  const queryParams = new URLSearchParams();
  queryParams.append('page', String(page));
  if (search.trim()) {
    queryParams.append('search', search.trim());
  }

  const response = await apiRequest<ProductsListResponse>(
    `/api/products?${queryParams.toString()}`,
    { token }
  );

  return response as ProductsListResponse;
}

export interface CreateProductPayload {
  sku: string;
  name: string;
  alias: string;
  description: string;
  ingredient: string;
  dosage: string;
  side_affection: string;
  unit_id: string;
  purchase_price: number;
  sales_price: number;
  alternate_price: number;
  expired_date: string;
  product_category_id: number;
}

export interface UpdateProductPayload extends CreateProductPayload {}

export async function createProduct(
  token: string,
  body: CreateProductPayload
) {
  return apiRequest<Product>('/api/products', {
    token,
    method: 'POST',
    body,
  });
}

export async function updateProduct(
  token: string,
  id: string,
  body: UpdateProductPayload
) {
  return apiRequest<Product>(`/api/products/${id}`, {
    token,
    method: 'PUT',
    body,
  });
}

/**
 * Download product label as PDF
 * @param token Auth token
 * @param productId Product ID
 * @param quantity Quantity of labels
 */
export async function downloadProductLabel(
  token: string,
  productId: string,
  quantity: number = 1
): Promise<void> {
  const url = buildApiUrl(`/api/product-label/${productId}?qty=${quantity}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const body = await response.json();
      throw new Error(body.message || `HTTP ${response.status}`);
    }
    throw new Error(`HTTP ${response.status}`);
  }

  // Get filename from Content-Disposition or use default
  const contentDisposition = response.headers.get('content-disposition');
  let filename = `product-label-${productId}.pdf`;
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^"]*)"?/);
    if (match && match[1]) {
      filename = match[1];
    }
  }

  // Download the file
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}

/**
 * Download all products as PDF
 */
export async function downloadProductsPDF(token: string): Promise<void> {
  const url = buildApiUrl('/api/products/pdf');

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const body = await response.json();
      throw new Error(body.message || `HTTP ${response.status}`);
    }
    throw new Error(`HTTP ${response.status}`);
  }

  // Get filename from Content-Disposition or use default
  const contentDisposition = response.headers.get('content-disposition');
  let filename = 'products.pdf';
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^"]*)"?/);
    if (match && match[1]) {
      filename = match[1];
    }
  }

  // Download the file
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}

/**
 * Download all products as Excel
 */
export async function downloadProductsExcel(token: string): Promise<void> {
  const url = buildApiUrl('/api/products/excel');

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const body = await response.json();
      throw new Error(body.message || `HTTP ${response.status}`);
    }
    throw new Error(`HTTP ${response.status}`);
  }

  // Get filename from Content-Disposition or use default
  const contentDisposition = response.headers.get('content-disposition');
  let filename = 'products.xlsx';
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^"]*)"?/);
    if (match && match[1]) {
      filename = match[1];
    }
  }

  // Download the file
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}
