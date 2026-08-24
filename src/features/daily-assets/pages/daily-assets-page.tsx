/**
 * @module daily-assets/pages
 * @description Halaman Laporan Asset — menampilkan daftar aset perusahaan
 *
 * Fitur:
 * - Pencarian asset
 * - Pagination
 * - Download Excel / PDF (stub)
 *
 * Status: Development — dummy data, perlu wire ke API backend
 *
 * TODO:
 * - Wire ke API /api/daily-assets
 * - Tambah filter tanggal (startDate, endDate)
 * - Fitur tambah/edit/delete asset
 * - Export Excel/PDF berfungsi
 */
import { useState } from 'react';
import { Edit2, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { useDailyAssets } from '../hooks/useDailyAssets';
import { toast, Table, Button, Pagination, type TableColumn } from '../../../components/ui';
import { ListSearchBar } from '../../../components/list/ListSearchBar';
import { ActionToolbar } from '../../../components/list/ActionToolbar';
import { useListSearch } from '../../../hooks/useListSearch';
import type { DailyAsset } from '../types/daily-assets';

/** Helper: format angka ke mata uang Rupiah */
function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString('id-ID')}`;
}

export function DailyAssetsPage() {
  const { activeToken } = useAuth();

  // ── Search ──────────────────────────────────────────────────────────────
  const { searchInput, handleSearchInputChange, handleSearch, handleReset } = useListSearch({
    onSearch: (_search) => loadAssets(1, _search),
  });
  const activeSearch = searchInput.trim();

  // ── Data ───────────────────────────────────────────────────────────────
  const { assets, total, page, perPage, isLoading, loadAssets } = useDailyAssets(activeToken ?? '');

  // ── Refresh ───────────────────────────────────────────────────────────
  const handleRefresh = () => loadAssets(page, activeSearch);

  // ── Download (stub) ───────────────────────────────────────────────────
  const handleDownloadExcel = () => {
    toast.info('Fitur export Excel sedang dalam pengembangan.');
  };
  const handleDownloadPdf = () => {
    toast.info('Fitur export PDF sedang dalam pengembangan.');
  };

  // ── Kolom Tabel ───────────────────────────────────────────────────────
  const columns: TableColumn<DailyAsset>[] = [
    {
      key: 'no',
      header: 'No',
      align: 'center',
      width: '50px',
      render: (row) => {
        const idx = (assets.indexOf(row));
        return idx + 1 + (page - 1) * perPage;
      },
    },
    { key: 'assetCode', header: 'Kode Asset' },
    { key: 'assetName', header: 'Nama Asset' },
    { key: 'category', header: 'Kategori' },
    { key: 'purchaseDate', header: 'Tgl. Beli' },
    {
      key: 'purchasePrice',
      header: 'Harga Beli',
      align: 'right',
      render: (row) => formatRupiah(row.purchasePrice),
    },
    {
      key: 'currentValue',
      header: 'Nilai Saat Ini',
      align: 'right',
      render: (row) => formatRupiah(row.currentValue),
    },
    {
      key: 'condition',
      header: 'Kondisi',
      render: (row) => {
        const variant = row.condition === 'Baik'
          ? 'success'
          : row.condition === 'Rusak'
          ? 'danger'
          : 'warning';
        return <span className={`badge badge--${variant}`}>{row.condition}</span>;
      },
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'center',
      width: '100px',
      render: (row) => (
        <div className="flex justify-center gap-1">
          <button
            type="button"
            className="inline-flex items-center justify-center p-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded transition-colors"
            title="Edit"
            onClick={() => toast.info(`Edit asset: ${row.assetName}`)}
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
            title="Hapus"
            onClick={() => toast.info(`Hapus asset: ${row.assetName}`)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="list-page">
      {/* Search Bar */}
      <div className="list-page__header">
        <ListSearchBar
          value={searchInput}
          onChange={handleSearchInputChange}
          onSearch={handleSearch}
          placeholder="Cari asset..."
          disabled={isLoading}
        />
        <button
          className="list-page__refresh-btn"
          onClick={handleRefresh}
          disabled={isLoading}
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Toolbar */}
      <ActionToolbar
        addLabel="Tambah Asset"
        onAddClick={() => toast.info('Fitur tambah asset belum tersedia.')}
        showExportExcel
        showExportPdf
        onExportExcel={handleDownloadExcel}
        onExportPdf={handleDownloadPdf}
        isLoading={isLoading}
      />

      {/* Tabel */}
      <div className="list-page__table-wrapper">
        {isLoading ? (
          <div className="list-page__loading">Memuat data...</div>
        ) : (
          <Table<DailyAsset>
            columns={columns}
            data={assets}
            emptyText="Tidak ada data asset"
          />
        )}
      </div>

      {/* Pagination */}
      <Pagination
        page={page}
        total={total}
        perPage={perPage}
        onPageChange={(p) => loadAssets(p, activeSearch)}
      />
    </div>
  );
}
