/**
 * @module retur-penjualan/pages/retur-penjualan-page
 * @description
 * Halaman daftar retur/pengembalian barang penjualan.
 * Menampilkan riwayat transaksi retur dari customer.
 *
 * Status saat ini: **DUMMY DATA** — data di-hardcode,
 * belum terkoneksi ke API backend yang sebenarnya.
 *
 * Fitur (dummy):
 * - Pencarian by nomor, pelanggan, atau status
 * - Refresh manual (toast notification)
 * - Tabel retur dengan kolom: Nomor, Pelanggan, Tanggal, Total, Status, Aksi
 *
 * TODO:
 * - Wire ke API retur penjualan
 * - Kolom aksi → detail retur
 * - Form buat ajukan retur baru
 * - Pagination
 *
 * @see useAuth - context untuk auth token
 */
import { useMemo, useState } from 'react';
import { Search, RefreshCw, Eye } from 'lucide-react';
import { Input, useToast } from '../../../components/ui';
import { Table, type TableColumn } from '../../../components/ui/Table';

/**
 * Shape data item retur dummy.
 * Nanti diganti sama type dari API retur penjualan.
 */
interface ReturItem {
  id: number;
  nomor: string;
  pelanggan: string;
  tanggal: string;
  total: string;
  status: string;
}

/**
 * Data dummy retur penjualan.
 * TODO: Ganti dengan fetch dari API `/api/retur-penjualan`
 */
const seedReturns: ReturItem[] = [
  { id: 1, nomor: 'RT-001', pelanggan: 'Budi', tanggal: '2026-07-01', total: 'Rp 125.000', status: 'Selesai' },
  { id: 2, nomor: 'RT-002', pelanggan: 'Sari', tanggal: '2026-07-02', total: 'Rp 75.000', status: 'Diproses' },
];

/**
 * Halaman daftar retur penjualan.
 *
 * Layout: `units-page` (table wrapper dengan header search)
 */
export function ReturPenjualanPage() {
  // ── State ──────────────────────────────────────────────────────
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [returns] = useState<ReturItem[]>(seedReturns);

  // ── Filtered Data ─────────────────────────────────────────────
  const filteredReturns = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return returns;
    return returns.filter((item) => [item.nomor, item.pelanggan, item.status].some((value) => value.toLowerCase().includes(query)));
  }, [searchQuery, returns]);

  // ── Table Columns ─────────────────────────────────────────────
  const columns: TableColumn<ReturItem>[] = [
    { key: 'nomor', header: 'Nomor' },
    { key: 'pelanggan', header: 'Pelanggan' },
    { key: 'tanggal', header: 'Tanggal' },
    { key: 'total', header: 'Total' },
    { key: 'status', header: 'Status' },
    {
      key: 'actions',
      header: 'Aksi',
      render: () => (
        <button type="button" className="inline-flex items-center justify-center p-2 bg-slate-700 hover:bg-slate-800 text-white rounded transition-colors" title="Lihat">
          <Eye size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="units-page">
      <div className="list-page__header">
        <div className="list-page__search-group">
          <div className="list-page__search-form">
            <Input placeholder="Cari retur penjualan..." className="list-page__search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} aria-label="Cari retur penjualan" />
            <button className="list-page__search-btn" type="button">
              <Search size={14} />
              Cari
            </button>
          </div>
          <button type="button" className="list-page__refresh-btn" title="Refresh" onClick={() => toast.addToast('Data retur disegarkan.', 'success')}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="list-page__table-wrapper">
        <Table columns={columns} data={filteredReturns} emptyText="Tidak ada retur penjualan" />
      </div>
    </div>
  );
}
