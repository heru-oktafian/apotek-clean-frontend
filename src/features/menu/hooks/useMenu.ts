import { useState, useEffect } from 'react';
import { getMenus } from '../api/menu-api';
import type { NavGroup, MenuApiResponse } from '../../../types/menu';

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
    if (t === 'satuan') return '/master/units';
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

  return Object.values(groups);
}

export function useMenu(token: string | null) {
  const [navGroups, setNavGroups] = useState<NavGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const safeToken = token;

    let cancelled = false;

    async function fetchMenu() {
      setLoading(true);
      setError(null);
      try {
        const res = await getMenus(safeToken);
        if (!cancelled) {
          setNavGroups(buildNavGroups(res));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load menu');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchMenu();
    return () => { cancelled = true; };
  }, [token as string]);

  return { navGroups, loading, error };
}
