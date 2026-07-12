import { apiRequest } from '../../../lib/api/client';
import type { MenuApiResponse } from '../../../types/menu';

// ── Get Menus ────────────────────────────────────────────────────────────────
/**
 * Fetch the full navigation menu structure for the authenticated user.
 *
 * **HTTP:** `GET /api/menus`
 *
 * @param token - Auth bearer token.
 * @returns     Menu tree response containing navigation items.
 */
export async function getMenus(token: string): Promise<MenuApiResponse> {
  return apiRequest<MenuApiResponse>('/api/menus', {
    token,
  });
}
