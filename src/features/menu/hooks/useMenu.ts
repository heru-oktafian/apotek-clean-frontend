/**
 * @module menu/useMenu
 * @description
 * Hook untuk mengambil dan mengelola struktur navigasi menu aplikasi.
 * Menu ini yang ditampilkan di sidebar (atau mobile bottom bar) dan
 * menentukan halaman mana saja yang bisa diakses user berdasarkan role.
 *
 * Contoh menu:
 * - Master: Produk, Kategori, Supplier, Satuan, Konversi Satuan
 * - Membership: Kategori Member, Members
 * - Laporan: Stok Minim, Laba Rugi, dll
 * - Pengaturan: User Manage, dll
 *
 * Menu di-cache di sessionStorage biar nggak perlu fetch berulang kali
 * setiap user navigasi antar halaman.
 *
 * @see useAuth - dependency untuk auth token dan user role
 */
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/auth-context';
import { getMenus } from '../api/menu-api';
import type { MenuApiResponse, NavGroup } from '../../../types/menu';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle, Banknote, BarChart3, BookOpen, Boxes, Building2,
  Calendar, CircleDollarSign, ClipboardCheck, ClipboardList, Columns,
  CreditCard, IdCard, LayoutDashboard, Network, Package,
  Receipt, RotateCcw, Settings, ShoppingBag, ShoppingCart, Tags,
  Truck, User, UserCog, Wallet,
} from 'lucide-react';

// Icon per group_menu (key = lowercase group_menu)
const GROUP_ICON_MAP: Record<string, LucideIcon> = {
  dashboard:    LayoutDashboard,
  masters:      Boxes,
  transaksi:    ShoppingCart,
  finance:      CircleDollarSign,
  laporan:      ClipboardList,
  membership:   Tags,
  user_manage:  UserCog,
  settings:     Settings,
};

// ── Session Cache ────────────────────────────────────────────────────────────
// Menu di-cache supaya nggak fetch berkali-kali saat navigasi.
// Cache berlaku per branch_id karena menu bisa beda tergantung branch.
const menuPromiseCache = new Map<string, Promise<MenuApiResponse>>();

function getCacheKey(token: string, branchId?: string): string {
  return `${branchId ?? 'all-branches'}`;
}

/**
 * State yang disimpan di dalam hook ini.
 */
interface UseMenuState {
  /** Array kelompok navigasi (NavGroup). Tiap group punya banyak NavItem. */
  navGroups: NavGroup[];
  /** True saat menu sedang dimuat */
  isLoading: boolean;
  /** Pesan error kalau fetch gagal */
  error: string | null;
}

/**
 * Hook untuk mengambil dan mengelola struktur menu navigasi.
 *
 * **Fitur caching:**
 * Menu di-cache di sessionStorage. Ini penting karena menu biasanya
 * nggak berubah selama user session. Tanpa cache, setiap kali user buka
 * halaman baru, menu akan di-fetch ulang — boros dan lambat.
 *
 * **Auto-filter by role:**
 * Menu difilter otomatis berdasarkan `user_role` dari useAuth.
 * User dengan role "Staff" nggak akan lihat menu "Pengaturan" misalnya.
 *
 * **Contoh penggunaan:**
 * ```tsx
 * function Sidebar() {
 *   const { navGroups, isLoading } = useMenu();
 *
 *   if (isLoading) return <SidebarSkeleton />;
 *
 *   return (
 *     <nav>
 *       {navGroups.map(group => (
 *         <div key={group.name}>
 *           <span>{group.name}</span>
 *           {group.items.map(item => (
 *             <Link key={item.path} to={item.path}>{item.name}</Link>
 *           ))}
 *         </div>
 *       ))}
 *     </nav>
 *   );
 * }
 * ```
 *
 * @returns Objek berisi struktur menu, loading state, dan fungsi refresh
 */
export function useMenu() {
  const { activeToken, activeBranch } = useAuth();

  const [state, setState] = useState<UseMenuState>({
    navGroups: [],
    isLoading: true,
    error: null,
  });

  /**
   * Memuat struktur menu dari API.
   *
   * Fungsi ini menggunakan Promise caching — kalau udah ada request
   * yang lagi jalan untuk key yang sama, return promise yang sama.
   * Ini mencegah duplicate requests saat komponen di-remount.
   *
   * @param forceRefresh - Kalau true, skip cache dan fetch ulang
   */
  const loadMenu = useCallback(
    async (forceRefresh = false) => {
      if (!activeToken) {
        setState({ navGroups: [], isLoading: false, error: 'Token tidak tersedia.' });
        return;
      }

      const cacheKey = getCacheKey(activeToken, activeBranch?.branch_id);

      // Kalau nggak force refresh dan udah ada cache, skip
      if (!forceRefresh && menuPromiseCache.has(cacheKey)) {
        const cachedPromise = menuPromiseCache.get(cacheKey)!;
        try {
          const cached = await cachedPromise;
          const cachedGroups = transformMenuRolesToNavGroups(cached.data ?? []);
          const filtered = filterMenuByRole(cachedGroups, 'Superadmin'); // TODO: pakai role dari auth
          setState({ navGroups: filtered, isLoading: false, error: null });
          return;
        } catch {
          // Cache expired atau error, proceed ke fetch baru
          menuPromiseCache.delete(cacheKey);
        }
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Buat promise baru dan simpan di cache
      const menuPromise = getMenus(activeToken);
      menuPromiseCache.set(cacheKey, menuPromise);

      try {
        const response = await menuPromise;
        // Transform MenuRole[] (API format) → NavGroup[] (sidebar format)
        const allGroups = transformMenuRolesToNavGroups(response.data ?? []);
        // TODO: filter menu berdasarkan user role yang sebenarnya dari auth
        const filtered = filterMenuByRole(allGroups, 'Superadmin');

        setState({ navGroups: filtered, isLoading: false, error: null });
      } catch (err) {
        console.error('[useMenu] Gagal memuat menu:', err);
        menuPromiseCache.delete(cacheKey);
        setState({
          navGroups: [],
          isLoading: false,
          error: err instanceof Error ? err.message : 'Gagal memuat menu navigasi.',
        });
      }
    },
    [activeToken, activeBranch?.branch_id]
  );

  // Auto-load saat token/branch berubah
  useEffect(() => {
    void loadMenu(false);
  }, [loadMenu]);

  return {
    /** Array kelompok navigasi */
    navGroups: state.navGroups,
    /** True saat sedang fetch menu */
    isLoading: state.isLoading,
    /** Pesan error kalau fetch gagal */
    error: state.error,
    /** Fungsi untuk force refresh menu (skip cache) */
    loadMenu: () => void loadMenu(true),
  };
}

/**
 * Clear all cached menu promises. Call this on logout.
 */
export function clearMenuCache() {
  menuPromiseCache.clear();
}

/**
 * Menyaring menu berdasarkan role user.
 * User dengan role tertentu cuma bisa lihat menu yang diizinkan.
 *
 * @param groups - Array NavGroup dari API
 * @param role - Role user saat ini (Superadmin, Admin, Staff, Kasir)
 * @returns Array NavGroup yang sudah difilter
 *
 * @example
 * // Staff cuma bisa lihat menu master dan transaksi
 * filterMenuByRole(groups, 'Staff');
 */
// ── Item Icon Map ───────────────────────────────────────────────────────────
// Icon per title item
const ITEM_ICON_MAP: Record<string, LucideIcon> = {
  dashboard:          LayoutDashboard,
  produk:             Package,
  kategori_produk:    Tags,
  supplier:           Truck,
  kategori_supplier:  Tags,
  pelanggan:          User,
  satuan:             BookOpen,
  konversi_satuan:    Network,
  members:            IdCard,
  member:             CreditCard,
  profile:            User,
  users:              UserCog,
  pembelian:          ShoppingBag,
  retur_pembelian:    RotateCcw,
  penjualan:          ShoppingCart,
  retur_penjualan:    RotateCcw,
  pos:                Receipt,
  first_stock:        Package,
  pengurangan_stok:   Package,
  stock_opname:       Boxes,
  pengeluaran:        Wallet,
  pemasukan_lain:     Banknote,
  jurnal_umum:         BookOpen,
  buku_besar:          BarChart3,
  neraca_saldo:        Columns,
  laporan_bulanan:     Calendar,
  laporan_aset:        Building2,
  defecta:             AlertTriangle,
  kopi_resep:          ClipboardList,
  laba_rugi:           BarChart3,
  'stok minimum':      Package,
  'stok maksimal':     Package,
  'stock opname':      Boxes,
  'laba rugi':         BarChart3,
  'laporan pembelian': ShoppingBag,
  'laporan penjualan': ShoppingCart,
};

/**
 * Transform MenuRole[] (API raw) → NavGroup[] (sidebar-ready).
 *
 * API returns: { user_role, details: [{ group_menu, title, url, method, access }] }
 * Sidebar needs: { id, label, icon, items: [{ label, to, icon, apiUrl }] }
 */
function transformMenuRolesToNavGroups(roles: MenuApiResponse['data']): NavGroup[] {
  if (!Array.isArray(roles) || roles.length === 0) return [];

  const groups: Record<string, NavGroup> = {};

  for (const role of roles) {
    if (!role?.details) continue;
    for (const item of role.details) {
      if (!item?.group_menu || !item?.title) continue;

      const groupKey = item.group_menu.toLowerCase();
      const itemLabel = item.title;
      const itemKey = itemLabel.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '_');
      const itemTo = deriveRoute(groupKey, itemLabel);

      if (!groups[groupKey]) {
        const GroupIcon = GROUP_ICON_MAP[groupKey] ?? Settings;
        groups[groupKey] = {
          id: groupKey,
          label: formatGroupLabel(item.group_menu),
          icon: groupKey,
          items: [],
        };
      }

      groups[groupKey].items.push({
        label: itemLabel,
        to: itemTo,
        icon: itemKey,
        apiUrl: item.url ?? '',
      });
    }
  }

  return Object.values(groups).sort((a, b) => {
    const order: Record<string, number> = {
      dashboard: 0, masters: 1, transaksi: 2, finance: 3,
      laporan: 4, membership: 5, user_manage: 6, settings: 7,
    };
    return (order[a.id] ?? 99) - (order[b.id] ?? 99);
  });
}

/** Format group_menu string → nice label */
function formatGroupLabel(raw: string): string {
  const map: Record<string, string> = {
    masters: 'Master', user_manage: 'Pengaturan', user_manage2: 'Pengaturan',
  };
  if (map[raw.toLowerCase()]) return map[raw.toLowerCase()];
  return raw.charAt(0).toUpperCase() + raw.slice(1).replace(/_/g, ' ');
}

/** Derive frontend route from group_menu + title */
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
    if (t.includes('member') && t.includes('kategori')) return '/membership/member-categories';
    if (t === 'member') return '/membership/members';
    return `/master/${t.replace(/\s+/g, '-')}`;
  }
  if (g === 'transaksi') {
    if (t === 'pembelian') return '/transactions/purchases';
    if (t === 'retur pembelian') return '/transactions/buy-returns';
    if (t === 'penjualan') return '/transactions/sales';
    if (t === 'retur penjualan') return '/transactions/sale-returns';
    if (t === 'pos') return '/transactions/pos';
    if (t === 'first stock') return '/transactions/first-stocks';
    if (t.includes('pengurangan') || (t.includes('pengurangan') && t.includes('stok'))) return '/transactions/stock-reductions';
    if (t === 'stock opname') return '/transactions/stock-opnames';
    if (t === 'pengeluaran') return '/transactions/expenses';
    if (t === 'pemasukan lain' || t === 'pendapatan lain') return '/transactions/another-incomes';
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
    if (t.includes('stok minimum')) return '/reports/minimum-stock';
    if (t.includes('stok maksimal')) return '/reports/maximum-stock';
    if (t.includes('stock opname')) return '/reports/stock-opname';
    if (t.includes('laba rugi')) return '/reports/profit-loss';
    if (t.includes('pembelian')) return '/reports/purchases';
    if (t.includes('penjualan')) return '/reports/sales';
    if (t.includes('retur')) return '/reports/returns';
    return `/reports/${t.replace(/\s+/g, '-')}`;
  }
  if (g === 'membership') {
    if (t === 'member' || t === 'members') return '/membership/members';
    if (t.includes('kategori member')) return '/membership/member-categories';
    return `/membership/${t.replace(/\s+/g, '-')}`;
  }
  if (g.includes('user') && g.includes('manage')) {
    if (t === 'users') return '/system/users';
    return `/system/${t.replace(/\s+/g, '-')}`;
  }
  return `/${g}/${t.replace(/\s+/g, '-')}`;
}

function filterMenuByRole(groups: NavGroup[], role: string): NavGroup[] {
  // TODO: Implementasi aktual — untuk sekarang return semua
  // Nanti bisa dipakai buat filter menu per role, misalnya:
  // const allowedPaths = ROLE_PERMISSIONS[role] ?? [];
  // return groups.map(g => ({
  //   ...g,
  //   items: g.items.filter(item => allowedPaths.includes(item.path))
  // })).filter(g => g.items.length > 0);

  return groups;
}
