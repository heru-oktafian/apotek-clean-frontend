import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  Banknote,
  BarChart3,
  BookOpen,
  Boxes,
  Building2,
  Calendar,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  Columns,
  CreditCard,
  IdCard,
  LayoutDashboard,
  List,
  LogOut,
  Network,
  Package,
  RotateCcw,
  Receipt,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Tags,
  Truck,
  User,
  UserCog,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../features/auth/auth-context';
import { useMenu } from '../../features/menu/hooks/useMenu';
import type { NavGroup } from '../../types/menu';

// ═══════════════════════════════════════════════════════════════════════════
// App Sidebar Component
// ═══════════════════════════════════════════════════════════════════════════
// Sidebar desktop dengan navigasi menu dari API
//
// Data Source:
// - Menu diambil dari useMenu(activeToken) hook
// - Data di-cache di sessionStorage (fetch hanya 1x per token)
// - Tidak ada refetch saat sidebar mount/unmount
//
// Fitur:
// - Group menu bisa di-expand/collapse
// - Auto-expand grup yang active sesuai current route
// - Icon per group & item dari icon map (GROUP_ICON_MAP, ITEM_ICON_MAP)
// - Dashboard render sebagai standalone item (tidak dalam grup)
//
// Mobile:
// - Sidebar bisa di-toggle via hamburger button
// - Overlay + drawer effect
// ═══════════════════════════════════════════════════════════════════════════

// Icon per group_menu (key = lowercase group_menu)
export const GROUP_ICON_MAP: Record<string, LucideIcon> = {
  dashboard:    LayoutDashboard,
  masters:      Boxes,
  transaksi:    ShoppingCart,
  finance:      CircleDollarSign,
  laporan:      ClipboardList,
  membership:   Tags,
  user_manage:  UserCog,
  settings:     Settings,
};

// Urutan grup (index = prioritas)
const GROUP_ORDER: Record<string, number> = {
  dashboard:    0,
  transaksi:    1,
  finance:      2,
  laporan:      3,
  masters:      4,
  membership:   5,
  user_manage:  6,
  settings:     7,
};

// Icon per title item
export const ITEM_ICON_MAP: Record<string, LucideIcon> = {
  dashboard:          LayoutDashboard,
  produk:             Package,
  kategori_produk:    Tags,
  supplier:           Truck,
  kategori_supplier:  Tags,
  pelanggan:          Users,
  satuan:             BookOpen,
  konversi_satuan:    Network,
  pembelian:          ShoppingBag,
  retur_pembelian:    ShoppingBag,
  penjualan:          ShoppingCart,
  retur_penjualan:    ShoppingCart,
  pos:                Receipt,
  first_stock:        Package,
  'pengurangan stok': Package,
  stock_opname:       Boxes,
  'stock opname':     ClipboardList,
  pengeluaran:        Wallet,
  'pemasukan lain':  Banknote,
  'stok awal':       ClipboardCheck,
  jurnal_umum:        BookOpen,
  buku_besar:         BarChart3,
  neraca_saldo:       BarChart3,
  'laporan bulanan':  Calendar,
  'neraca saldo':     Columns,
  'laporan aset':     Building2,
  'defecta':          AlertTriangle,
  'kopi resep':       ClipboardList,
  'retur penjualan':  RotateCcw,
  'retur pembelian':  RotateCcw,
  members:            IdCard,
  profile:            User,
  member:             CreditCard,
  laba_rugi:          BarChart3,
  'laporan_stok_minimum':     Package,
  'laporan_stok_maksimal':    Package,
  'laporan_stock_opname':     Boxes,
  'laporan_laba_rugi':        BarChart3,
  'laporan_pembelian':       ShoppingBag,
  'laporan_penjualan':       ShoppingCart,
  users:             UserCog,
};

interface AppSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

function mapGroupToId(group: string): string {
  return group.toLowerCase().replace(/\s+/g, '_');
}

function deriveRoute(groupMenu: string, title: string): string {
  const g = groupMenu.toLowerCase();
  const t = title.toLowerCase();
  if (g === 'dashboard') return '/dashboard';
  if (g === 'masters') {
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

export function AppSidebar({ mobileOpen, onClose }: AppSidebarProps) {
  const { activeToken } = useAuth();
  const location = useLocation();
  const { navGroups: allGroups, loading: menuLoading, error: menuError } = useMenu(activeToken);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Auto-expand group yang aktif saat allGroups loaded
  useEffect(() => {
    if (!allGroups.length) return;
    const activeGroup = allGroups.find((g) =>
      g.items.some((item) => location.pathname.startsWith(item.to))
    );
    if (activeGroup) {
      setExpandedGroups(new Set([activeGroup.id]));
    }
  }, [allGroups, location.pathname]);

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };



  return (
    <>
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`app-sidebar${mobileOpen ? ' app-sidebar--mobile-open' : ''}`}>
        {/* Brand header */}
        <div className="app-sidebar__brand">
          <div className="app-sidebar__brand-text">
            <span className="app-sidebar__brand-name">Vimedika</span>
            <span className="app-sidebar__brand-sub">Pharma P.O.S</span>
          </div>
          {/* Burger button — mobile only */}
          <button className="sidebar-burger" onClick={onClose} aria-label="Tutup menu">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="app-sidebar__nav">
          {menuLoading && (
            <div style={{ padding: '1rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textAlign: 'center' }}>
              Memuat...
            </div>
          )}
          {menuError && (
            <div style={{ padding: '1rem', color: '#ef4444', fontSize: '0.8rem', textAlign: 'center' }}>
              {menuError}
            </div>
          )}
          {!menuLoading && !menuError && (
            <>
              {/* Render Dashboard as standalone (no group) if present */}
              {allGroups.filter(g => g.id.toLowerCase() === 'dashboard' || g.label.toLowerCase() === 'dashboard').map((dg) => (
                dg.items.map((item) => {
                  const itemKey = item.label.toLowerCase();
                  const ItemIcon = ITEM_ICON_MAP[itemKey] ?? Settings;
                  const isActive = location.pathname.startsWith(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={`sidebar-link${isActive ? ' active' : ''}`}
                    >
                      <ItemIcon size={16} strokeWidth={2.2} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })
              ))}

              {allGroups.filter(g => !(g.id.toLowerCase() === 'dashboard' || g.label.toLowerCase() === 'dashboard')).map((group) => {
            const groupKey = group.id.toLowerCase();
            const GroupIcon = GROUP_ICON_MAP[groupKey] ?? Settings;
            const isExpanded = expandedGroups.has(group.id);
            const hasActiveItem = group.items.some((item) => location.pathname.startsWith(item.to));
            return (
              <section key={group.id} className="sidebar-group">
                <button
                  className={`sidebar-group__header sidebar-group__toggle${isExpanded ? ' expanded' : ''}${hasActiveItem ? ' has-active' : ''}`}
                  onClick={() => toggleGroup(group.id)}
                >
                  <GroupIcon size={14} strokeWidth={2.5} />
                  <span>{group.label}</span>
                  <span className="sidebar-group__chevron">{isExpanded ? '▲' : '▼'}</span>
                </button>
                {isExpanded && group.items.map((item) => {
                  const itemKey = item.label.toLowerCase();
                  const ItemIcon = ITEM_ICON_MAP[itemKey] ?? Settings;
                  const isActive = location.pathname.startsWith(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={`sidebar-link${isActive ? ' active' : ''}`}
                    >
                      <ItemIcon size={16} strokeWidth={2.2} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </section>
            );
          })}
            </>
          )}
        </nav>

        {/* User profile — bottom (logout removed) */}
      </aside>
    </>
  );
}
