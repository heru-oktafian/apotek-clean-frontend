import { apiRequest } from '../../../lib/api/client';
import type { MenuApiResponse } from '../../../types/menu';

export async function getMenus(token: string): Promise<MenuApiResponse> {
  return apiRequest<MenuApiResponse>('/api/menus', {
    token,
  });
}
