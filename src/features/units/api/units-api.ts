import { apiRequest } from '../../../lib/api/client';
import type { Unit, UnitsResponse, UnitsListParams } from '../types/units';

// ── Fetch Units ───────────────────────────────────────────────────────────────
/**
 * Fetch a paginated list of units with optional search.
 *
 * **HTTP:** `GET /api/units`
 *
 * @param token  - Auth bearer token.
 * @param params - Optional pagination and search params.
 * @returns      Paginated list of units.
 */
export async function fetchUnits(
  token: string,
  params?: UnitsListParams
): Promise<UnitsResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) {
    queryParams.append('page', String(params.page));
  }

  if (params?.per_page) {
    queryParams.append('per_page', String(params.per_page));
  }

  if (params?.search) {
    queryParams.append('search', params.search);
  }

  const query = queryParams.toString();
  const url = query ? `/api/units?${query}` : '/api/units';

  const res = await apiRequest<UnitsResponse>(url, { token });
  return res;
}

/** Payload for creating a new unit. */
export interface CreateUnitPayload {
  /** Name of the unit (e.g., "Tablet", "Kapsul"). */
  name: string;
}

/** Payload for updating an existing unit. */
export interface UpdateUnitPayload extends CreateUnitPayload {}

// ── Create Unit ─────────────────────────────────────────────────────────────
/**
 * Create a new unit of measurement.
 *
 * **HTTP:** `POST /api/units`
 *
 * @param token - Auth bearer token.
 * @param body  - Unit creation payload.
 * @returns     The newly created unit object.
 */
export async function createUnit(
  token: string,
  body: CreateUnitPayload
): Promise<Unit> {
  const url = '/api/units';
  const res = await apiRequest<Unit>(url, { token, method: 'POST', body });
  return res;
}

// ── Update Unit ─────────────────────────────────────────────────────────────
/**
 * Update an existing unit of measurement.
 *
 * **HTTP:** `PUT /api/units/{id}`
 *
 * @param token - Auth bearer token.
 * @param id    - ID of the unit to update.
 * @param body  - Unit update payload.
 * @returns     The updated unit object.
 */
export async function updateUnit(
  token: string,
  id: string | number,
  body: UpdateUnitPayload
): Promise<Unit> {
  const url = `/api/units/${id}`;
  const res = await apiRequest<Unit>(url, { token, method: 'PUT', body });
  return res;
}

// ── Delete Unit ─────────────────────────────────────────────────────────────
/**
 * Delete a unit of measurement by ID.
 *
 * **HTTP:** `DELETE /api/units/{id}`
 *
 * @param token - Auth bearer token.
 * @param id    - ID of the unit to delete.
 */
export async function deleteUnit(
  token: string,
  id: string | number
): Promise<void> {
  const url = `/api/units/${id}`;
  return apiRequest<void>(url, { token, method: 'DELETE' });
}
