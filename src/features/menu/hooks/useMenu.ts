import { useState, useEffect } from 'react';
import { getMenus } from '../api/menu-api';
import type { NavGroup, MenuApiResponse } from '../../../types/menu';

// ═══════════════════════════════════════════════════════════════════════════
// Menu Caching Strategy
// ═══════════════════════════════════════════════════════════════════════════
// Tujuan: Fetch menu HANYA 1x per token, cache ke sessionStorage
//
// Flow:
// 1. Component mount → cek cache di sessionStorage
// 2. Jika ada → return cached data (instant)
// 3. Jika tidak ada → fetch dari API + cache
// 4. Promise cache untuk avoid race condition saat multiple mount
// 5. Logout → clear cache untuk sesi bersih
//
// Keuntungan:
// - Navigasi antar halaman TIDAK ada delay (cache hit)
// - Memory efficient: hanya 1 Promise per token
// - Auto-clear saat window ditutup (sessionStorage)
// ═══════════════════════════════════════════════════════════════════════════

const MENU_CACHE_KEY = 'apotek.menu-cache';
const MENU_CACHE_VERSION = 2;
const menuPromiseCache: Record<string, Promise<NavGroup[]>> = {};

type MenuCacheEntry = { version: number; navGroups: NavGroup[] };

/** Membaca cache menu dari sessionStorage */
function readMenuCache(): Record<string, MenuCacheEntry> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = JSON.parse(sessionStorage.getItem(MENU_CACHE_KEY) || '{}');
    if (typeof raw !== 'object' || raw === null) return {};
    return raw as Record<string, MenuCacheEntry>;
  } catch {
    return {};
  }
}

/** Menulis cache menu ke sessionStorage */
function writeMenuCache(cache: Record<string, MenuCacheEntry>) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(MENU_CACHE_KEY, JSON.stringify(cache));
}

/** Ambil menu cache untuk token tertentu */
function getCachedMenu(token: string): NavGroup[] | undefined {
  const cache = readMenuCache();
  const entry = cache[token];
  if (!entry) return undefined;
  if (entry.version !== MENU_CACHE_VERSION) return undefined;
  return entry.navGroups;
}

/** Simpan menu cache untuk token tertentu */
function setCachedMenu(token: string, navGroups: NavGroup[]) {
  const cache = readMenuCache();
  cache[token] = { version: MENU_CACHE_VERSION, navGroups };
  writeMenuCache(cache);
}

/** Hapus seluruh cache menu dan Promise cache (dipanggil saat logout) */
export function clearMenuCache() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(MENU_CACHE_KEY);
  Object.keys(menuPromiseCache).forEach((key) => delete menuPromiseCache[key]);
}

function mapGroupToId(group: string): string {
  return group.toLowerCase().replace(/\s+/g, '_');
}

function deriveRoute(groupMenu: string, title: string): string {
  const g = groupMenu.toLowerCase();
  const t = title.toLowerCase();

  if (g === 'dashboard') return '/dashboard';

  if (g === 'masters' || g === 'master') {
    if (t.includes('produk') && t.includes('kategori')) return '/master/product-categories';
    if (t === 'produk') return '/master/products';
    if (t === 'supplier') return '/master/suppliers';
    if (t.includes('supplier') && t.includes('kategori')) return '/master/supplier-categories';
    if (t === 'pelanggan') return '/master/customers';
    if (t === 'satuan') return '/master/satuan';
    if (t === 'konversi satuan') return '/master/unit-conversions';
    if (t.includes('member') && t.includes('kategori')) return '/master/member-categories';
    if (t === 'member') return '/master/members';
    return `/master/${t.replace(/\s+/g, '-')}`;
  }

  if (g === 'transaksi') {
    if (t === 'pembelian') return '/transactions/purchases';
    if (t === 'retur pembelian') return '/transactions/buy-returns';
    if (t === 'penjualan') return '/transactions/sales';
    if (t === 'retur penjualan') return '/transactions/sale-returns';
    if (t === 'pos') return '/transactions/pos';
    if (t === 'first stock') return '/transactions/first-stocks';
    if (t.includes('pengurangan') || t.includes('stok')) return '/transactions/stock-reductions';
    if (t === 'stock opname') return '/transactions/stock-opnames';
    if (t === 'pengeluaran') return '/transactions/expenses';
    if (t === 'pendapatan lain') return '/transactions/another-incomes';
    return `/transactions/${t.replace(/\s+/g, '-')}`;
  }

  if (g === 'finance') {
    if (t === 'jurnal umum') return '/finance/general-journals';
    if (t === 'buku besar') return '/finance/ledgers';
    if (t === 'neraca saldo') return '/finance/trial-balances';
    if (t === 'laba rugi') return '/finance/profit-loss';
    return `/finance/${t.replace(/\s+/g, '-')}`;
  }

  if (g === 'laporan') {
    if (t.includes('stok minimum') || t === 'laporan stok minimum') return '/reports/minimum-stock';
    if (t.includes('stok maksimal') || t === 'laporan stok maksimal') return '/reports/maximum-stock';
    if (t.includes('stock opname') || t === 'laporan stock opname') return '/reports/stock-opname';
    if (t.includes('laba rugi') || t === 'laporan laba rugi') return '/reports/profit-loss';
    if (t.includes('pembelian') || t === 'laporan pembelian') return '/reports/purchases';
    if (t.includes('penjualan') || t === 'laporan penjualan') return '/reports/sales';
    if (t.includes('retur')) return '/reports/returns';
    return `/reports/${t.replace(/\s+/g, '-')}`;
  }

  if (g === 'membership') {
    if (t.includes('kategori member')) return '/master/member-categories';
    if (t === 'member') return '/master/members';
    return `/membership/${t.replace(/\s+/g, '-')}`;
  }

  if (g === 'user manage') {
    if (t === 'users') return '/system/users';
    return `/system/${t.replace(/\s+/g, '-')}`;
  }

  return `/${g}/${t.replace(/\s+/g, '-')}`;
}

function buildNavGroups(data: MenuApiResponse): NavGroup[] {
  if (!data?.data?.length) return [];

  const groups: Record<string, NavGroup> = {};

  for (const role of data.data) {
    for (const item of role.details) {
      const { group_menu, title, url } = item;
      const id = mapGroupToId(group_menu);

      if (!groups[id]) {
        groups[id] = {
          id,
          label: group_menu,
          icon: group_menu,
          items: [],
        };
      }

      groups[id].items.push({
        label: title,
        to: deriveRoute(group_menu, title),
        icon: title,
        apiUrl: url,
      });
    }
  }

  // Remove any Settings group (id: 'setting' or 'settings' or label contains 'setting')
  for (const id of Object.keys(groups)) {
    const g = groups[id];
    const lid = String(g.label || '').toLowerCase();
    if (id === 'setting' || id === 'settings' || lid.includes('setting')) {
      delete groups[id];
      continue;
    }

    // Remove any `Profile` / `Profil` submenu entries from this group
    g.items = g.items.filter((it) => {
      const t = String(it.label).toLowerCase();
      return t !== 'profile' && t !== 'profil';
    });
  }

  // Desired order (lowercased ids):
  const desiredOrder = [
    'dashboard',
    'transaksi',
    'finance',
    'laporan',
    'master', // match master/masters
    'membership',
    'user_manage',
  ];

  const ordered: NavGroup[] = [];

  const remaining = { ...groups };

  // Helper to find and push by matching id patterns
  function takeMatch(prefixes: string[] | string) {
    const prefs = Array.isArray(prefixes) ? prefixes : [prefixes];
    for (const id of Object.keys(remaining)) {
      for (const p of prefs) {
        if (id === p || id.startsWith(p)) {
          ordered.push(remaining[id]);
          delete remaining[id];
          return true;
        }
      }
    }
    return false;
  }

  // Apply desired ordering with some flexible matching
  for (const key of desiredOrder) {
    if (key === 'master') {
      // match both master and masters
      takeMatch(['master', 'masters']);
    } else if (key === 'user_manage') {
      takeMatch(['user_manage', 'user manage', 'usermanage']);
    } else {
      takeMatch(key);
    }
  }

  // Append any remaining groups in their original order
  for (const id of Object.keys(remaining)) {
    ordered.push(remaining[id]);
  }

  return ordered;
}

export function useMenu(token: string | null) {
  const [navGroups, setNavGroups] = useState<NavGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setNavGroups([]);
      setLoading(false);
      setError(null);
      return;
    }

    const safeToken = token;
    const cachedMenu = getCachedMenu(safeToken);
    if (cachedMenu) {
      setNavGroups(cachedMenu);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const promise = menuPromiseCache[safeToken] ?? (async () => {
      const res = await getMenus(safeToken);
      const groups = buildNavGroups(res);
      setCachedMenu(safeToken, groups);
      return groups;
    })();

    menuPromiseCache[safeToken] = promise;

    setLoading(true);
    setError(null);

    promise
      .then((groups) => {
        if (!cancelled) {
          setNavGroups(groups);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load menu');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [token]);

  return { navGroups, loading, error };
}
