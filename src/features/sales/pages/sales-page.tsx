// ============================================================
// Sales Page — View Data Penjualan dengan Filter Bulan
// ============================================================

import { useState, useEffect } from 'react';
import { RefreshCw, Printer } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { fetchSalesList } from '../api/sales-api';
import { formatNumber } from '../../../lib/format-currency';
import { toast, Table, Pagination } from '../../../components/ui';
import { ListSearchBar } from '../../../components/list/ListSearchBar';
import { ActionToolbar } from '../../../components/list/ActionToolbar';
import { ActionCell } from '../../../components/list/ActionCell';
import type { SaleListItem } from '../types/sales';

// ── Types ─────────────────────────────────────────────────
interface SaleListState {
  sales: SaleListItem[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

// ── Main Component ────────────────────────────────────────
export function SalesPage() {
  const { activeToken } = useAuth();

  // Month filter default: bulan ini
  const now = new Date();
  const currentMonthDefault = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthDefault);

  // List state
  const [state, setState] = useState<SaleListState>({
    sales: [],
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
  });

  // Search
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Loading
  const [isLoading, setIsLoading] = useState(false);

  // ── Load Data ────────────────────────────────────────────
  const loadSales = async (page: number = 1, searchTerm: string = '', month: string = selectedMonth) => {
    if (!activeToken) return;

    setIsLoading(true);
    try {
      const response = await fetchSalesList(activeToken, {
        page,
        search: searchTerm,
        month,
      });

      if (response.status === 'success') {
        setState({
          sales: response.data || [],
          totalItems: response.total_items || 0,
          currentPage: response.current_page || 1,
          totalPages: response.total_pages || 1,
        });
      } else {
        toast.error(response.message || 'Gagal memuat data');
      }
    } catch {
      toast.error('Gagal memuat data penjualan');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeToken]);

  // ── Search ───────────────────────────────────────────────
  const handleSearch = () => {
    setSearch(searchInput.trim());
    loadSales(1, searchInput.trim(), selectedMonth);
  };

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
  };

  const handleReset = () => {
    setSearchInput('');
    setSearch('');
    loadSales(1, '', selectedMonth);
  };

  // ── Filter Bulan ────────────────────────────────────────
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    loadSales(1, search, month);
  };

  // ── Refresh ─────────────────────────────────────────────
  const handleRefresh = () => {
    loadSales(state.currentPage, search, selectedMonth);
  };

  // ── Tambah (buka modal form) ───────────────────────────
  const [showFormModal, setShowFormModal] = useState(false);

  const handleAdd = () => {
    setShowFormModal(true);
  };

  // ── Export ───────────────────────────────────────────────
  const handleExportExcel = async () => {
    if (!activeToken) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/sales/excel?month=${selectedMonth}`,
        { headers: { Authorization: `Bearer ${activeToken}` } }
      );
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `penjualan-${selectedMonth}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Gagal export Excel');
    }
  };

  const handleExportPdf = async () => {
    if (!activeToken) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/sales/pdf?month=${selectedMonth}`,
        { headers: { Authorization: `Bearer ${activeToken}` } }
      );
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `penjualan-${selectedMonth}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Gagal export PDF');
    }
  };

  // ── Print ───────────────────────────────────────────────
  const handlePrint = (saleId: string) => {
    window.open(`${import.meta.env.VITE_API_BASE_URL}/api/sales/${saleId}`, '_blank');
  };

  // ── Columns ─────────────────────────────────────────────
  const dataWithIndex: (SaleListItem & { _index?: number })[] = state.sales.map((s, i) => ({
    ...s,
    _index: i,
  }));

  const columns = [
    {
      key: 'no',
      header: 'No',
      align: 'center' as const,
      width: '60px',
      render: (row: SaleListItem & { _index?: number }) =>
        (row._index ?? 0) + 1 + (state.currentPage - 1) * 10,
    },
    {
      key: 'id',
      header: 'ID Transaksi',
      render: (row: SaleListItem) => (
        <span className="font-mono text-xs text-slate-600">{row.id}</span>
      ),
    },
    {
      key: 'description',
      header: 'Deskripsi',
      render: (row: SaleListItem) => {
        const parts = (row.description || '').split(';');
        return (
          <div className="whitespace-pre-line text-sm">
            {parts[0] && <div className="font-semibold text-slate-800">{parts[0].trim()}</div>}
            {parts[1] && <div className="text-slate-500">{parts[1].trim()}</div>}
          </div>
        );
      },
    },
    {
      key: 'payment',
      header: 'Pembayaran',
      align: 'center' as const,
      render: (row: SaleListItem) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
            row.payment === 'paid_by_cash'
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {row.payment === 'paid_by_cash' ? 'Tunai' : 'Kredit'}
        </span>
      ),
    },
    {
      key: 'total_sale',
      header: 'Total',
      align: 'right' as const,
      render: (row: SaleListItem) => (
        <span className="font-semibold text-slate-800">{formatNumber(row.total_sale)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'center' as const,
      width: '80px',
      render: (row: SaleListItem) => (
        <ActionCell>
          <button
            type="button"
            onClick={() => handlePrint(row.id)}
            className="inline-flex items-center justify-center p-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded transition-colors outline-none"
            title="Cetak Struk"
          >
            <Printer size={14} />
          </button>
        </ActionCell>
      ),
    },
  ];

  return (
    <div className="list-page">
      {/* ── Header: Search + Refresh ───────────────────────── */}
      <div className="list-page__header">
        <ListSearchBar
          value={searchInput}
          onChange={handleSearchInputChange}
          onSearch={handleSearch}
          placeholder="Cari transaksi..."
          disabled={isLoading}
        />
        <button
          type="button"
          className="list-page__refresh-btn"
          onClick={handleRefresh}
          disabled={isLoading}
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ── Toolbar: + Tambah | Filter Bulan + Excel + PDF ─── */}
      <ActionToolbar
        addLabel="Tambah"
        onAddClick={handleAdd}
        showExportExcel
        showExportPdf
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        isLoading={isLoading}
        customRightSlot={
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-600 font-medium">Bulan:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        }
      />

      {/* ── Table ───────────────────────────────────────────── */}
      <div className="list-page__table-wrapper">
        {isLoading ? (
          <div className="list-page__loading">
            <span className="animate-pulse">Memuat data...</span>
          </div>
        ) : (
          <Table
            columns={columns}
            data={dataWithIndex}
            emptyText="Tidak ada data penjualan"
          />
        )}
      </div>

      {/* ── Pagination ──────────────────────────────────────── */}
      <Pagination
        page={state.currentPage}
        total={state.totalItems}
        perPage={10}
        onPageChange={(page) => loadSales(page, search, selectedMonth)}
      />
    </div>
  );
}
