import { apiRequest } from '../../../lib/api/client';
import type { CategoriesListParams, CategoriesResponse, Category } from '../types/categories';

export const fetchCategories = async (token: string, params?: CategoriesListParams) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.search) queryParams.append('search', params.search);
  const query = queryParams.toString();
  const url = query ? `/api/product-categories?${query}` : '/api/product-categories';
  return apiRequest<CategoriesResponse>(url, { token });
};

export const createCategory = async (token: string, body: { name: string; nama: string; product_category_name: string; }) => {
  return apiRequest<Category>('/api/product-categories', { token, method: 'POST', body });
};

export const updateCategory = async (token: string, id: number, body: { name: string; nama: string; product_category_name: string; }) => {
  return apiRequest<Category>(`/api/product-categories/${id}`, { token, method: 'PUT', body });
};

export const deleteCategory = async (token: string, id: number) => {
  return apiRequest<void>(`/api/product-categories/${id}`, { token, method: 'DELETE' });
};
