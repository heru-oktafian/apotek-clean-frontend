/**
 * Users API — dummy/memory-based implementation.
 *
 * All functions use in-memory dummy data and artificial delays
 * to simulate real API behaviour for development/demo purposes.
 */

import type {
  BranchOption,
  User,
  UserBranchAccess,
  UsersListParams,
  UsersListResponse,
} from '../types/users';

// ── Dummy Data ───────────────────────────────────────────────────────────────

/** In-memory user records used as the data source. */
const dummyUsers: User[] = [
  { id: '1', username: 'vita_fauzi', name: 'Vita Fauzi. M', user_role: 'Superadmin', status: 'Active', branch_id: 'AZF' },
  { id: '2', username: 'zia', name: 'Zia', user_role: 'Admin', status: 'Active', branch_id: 'BRC' },
  { id: '3', username: 'fanny', name: 'Fanny', user_role: 'Staff', status: 'Active', branch_id: 'TBB' },
  { id: '4', username: 'lala', name: 'Lala', user_role: 'Staff', status: 'Inactive', branch_id: 'SLG' },
  { id: '5', username: 'rio', name: 'Rio Kurniawan', user_role: 'Kasir', status: 'Active', branch_id: 'AZF' },
];

/** Available branch options. */
const dummyBranches: BranchOption[] = [
  { branch_id: 'AZF', branch_name: 'Apotek Zijda Farma' },
  { branch_id: 'BRC', branch_name: 'Branch Central' },
  { branch_id: 'TBB', branch_name: 'Tebet Branch' },
  { branch_id: 'SLG', branch_name: 'Salaga Branch' },
];

/** Branch access records keyed by user ID. */
const dummyBranchAccess: Record<string, UserBranchAccess[]> = {
  '1': [
    { id: 'access-1-AZF', branch_id: 'AZF', branch_name: 'Apotek Zijda Farma', role: 'Superadmin', status: 'Active' },
    { id: 'access-1-BRC', branch_id: 'BRC', branch_name: 'Branch Central', role: 'Superadmin', status: 'Active' },
  ],
  '2': [
    { id: 'access-2-AZF', branch_id: 'AZF', branch_name: 'Apotek Zijda Farma', role: 'Admin', status: 'Active' },
  ],
  '3': [
    { id: 'access-3-AZF', branch_id: 'AZF', branch_name: 'Apotek Zijda Farma', role: 'Staff', status: 'Active' },
  ],
  '4': [
    { id: 'access-4-AZF', branch_id: 'AZF', branch_name: 'Apotek Zijda Farma', role: 'Staff', status: 'Inactive' },
  ],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Simulate network latency. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Normalize search input for case-insensitive matching. */
function normalizeSearchValue(value?: string): string {
  return String(value || '').trim().toLowerCase();
}

// ── Fetch Users ───────────────────────────────────────────────────────────────
/**
 * Fetch a paginated list of users with optional search and branch filter.
 *
 * @param token  - Auth bearer token (unused in dummy implementation).
 * @param params - Optional pagination, search, and branch filter params.
 * @returns      Paginated list of users.
 */
export async function fetchUsers(
  token: string,
  params: UsersListParams = {}
): Promise<UsersListResponse> {
  await delay(250);

  const { page = 1, perPage = 10, search, branch_id } = params;
  const searchValue = normalizeSearchValue(search);

  let users = dummyUsers;

  // Filter by branch if a valid branch_id is provided.
  const branchIds = new Set(dummyBranches.map((branch) => branch.branch_id));
  if (branch_id && branchIds.has(branch_id)) {
    users = users.filter((user) => user.branch_id === branch_id);
  }

  // Filter by search term.
  if (searchValue) {
    users = users.filter((user) => {
      return (
        user.username.toLowerCase().includes(searchValue) ||
        user.name.toLowerCase().includes(searchValue) ||
        user.user_role.toLowerCase().includes(searchValue)
      );
    });
  }

  const total_items = users.length;
  const start = (page - 1) * perPage;
  const paged = users.slice(start, start + perPage);

  return {
    data: paged,
    total_items,
    current_page: page,
    per_page: perPage,
  };
}

// ── Fetch User By ID ──────────────────────────────────────────────────────────
/**
 * Fetch a single user by their ID.
 *
 * @param token  - Auth bearer token (unused in dummy implementation).
 * @param userId - ID of the user to retrieve.
 * @returns      The user object.
 * @throws       Error if the user is not found.
 */
export async function fetchUserById(token: string, userId: string): Promise<User> {
  await delay(200);
  const user = dummyUsers.find((item) => item.id === userId);
  if (!user) {
    throw new Error('User tidak ditemukan');
  }
  return user;
}

// ── Fetch User Branch Access ──────────────────────────────────────────────────
/**
 * Fetch the list of branch access records for a specific user.
 *
 * @param token  - Auth bearer token (unused in dummy implementation).
 * @param userId - ID of the user whose branch access to retrieve.
 * @returns      Array of branch access records (empty array if none).
 */
export async function fetchUserBranchAccess(
  token: string,
  userId: string
): Promise<UserBranchAccess[]> {
  await delay(200);
  return dummyBranchAccess[userId] ? [...dummyBranchAccess[userId]] : [];
}

// ── Fetch Branch Options ─────────────────────────────────────────────────────
/**
 * Fetch all available branch options for dropdown display.
 *
 * @param token - Auth bearer token (unused in dummy implementation).
 * @returns     Array of branch options.
 */
export async function fetchBranchOptions(token: string): Promise<BranchOption[]> {
  await delay(250);
  return [...dummyBranches];
}

// ── Add User Branch Access ───────────────────────────────────────────────────
/**
 * Grant a user access to a specific branch.
 *
 * @param token   - Auth bearer token (unused in dummy implementation).
 * @param userId  - ID of the user to grant access to.
 * @param branchId - Branch ID to grant access to.
 * @returns       The newly created branch access record.
 * @throws        Error if the user or branch is not found, or if access already exists.
 */
export async function addUserBranchAccess(
  token: string,
  userId: string,
  branchId: string
): Promise<UserBranchAccess> {
  await delay(200);

  const user = dummyUsers.find((item) => item.id === userId);
  if (!user) {
    throw new Error('User tidak ditemukan');
  }

  const branch = dummyBranches.find((item) => item.branch_id === branchId);
  if (!branch) {
    throw new Error('Branch tidak valid');
  }

  const currentAccess = dummyBranchAccess[userId] ?? [];
  if (currentAccess.some((item) => item.branch_id === branchId)) {
    throw new Error('User sudah memiliki akses ke branch tersebut');
  }

  const newAccess: UserBranchAccess = {
    id: `access-${userId}-${branchId}`,
    branch_id: branch.branch_id,
    branch_name: branch.branch_name,
    role: user.user_role,
    status: 'Active',
  };

  dummyBranchAccess[userId] = [...currentAccess, newAccess];
  return newAccess;
}

// ── Remove User Branch Access ────────────────────────────────────────────────
/**
 * Revoke a specific branch access record from a user.
 *
 * @param token    - Auth bearer token (unused in dummy implementation).
 * @param userId   - ID of the user.
 * @param accessId - ID of the branch access record to remove.
 */
export async function removeUserBranchAccess(
  token: string,
  userId: string,
  accessId: string
): Promise<void> {
  await delay(200);

  const currentAccess = dummyBranchAccess[userId] ?? [];
  dummyBranchAccess[userId] = currentAccess.filter((item) => item.id !== accessId);
}

// ── Update User ───────────────────────────────────────────────────────────────
/**
 * Update mutable fields on an existing user record.
 *
 * @param token   - Auth bearer token (unused in dummy implementation).
 * @param userId  - ID of the user to update.
 * @param payload - Partial user object with fields to update.
 * @returns       The fully updated user object.
 * @throws        Error if the user is not found.
 */
export async function updateUser(
  token: string,
  userId: string,
  payload: Partial<User>
): Promise<User> {
  await delay(200);

  const idx = dummyUsers.findIndex((u) => u.id === userId);
  if (idx === -1) {
    throw new Error('User tidak ditemukan');
  }

  const updated: User = {
    ...dummyUsers[idx],
    ...payload,
  };

  dummyUsers[idx] = updated;
  return updated;
}
