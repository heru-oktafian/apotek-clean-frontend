import { useState } from 'react';
import { Edit2, Trash2, RefreshCw, Download, Search } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { useUnits } from '../hooks/useUnits';
import { Table, type TableColumn } from '../../../components/ui/Table';
import type { Unit } from '../types/units';

interface UnitWithIndex extends Unit {
  _index?: number;
}

export function UnitsPage() {
  const { activeToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const { units, total, page, perPage, isLoading, loadUnits } = useUnits(activeToken || '');

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    const normalized = value.trim();
    if (!normalized) {
      setActiveSearch('');
      loadUnits(1, '');
      return;
    }

    if (normalized.length >= 3) {
      setActiveSearch(normalized);
      loadUnits(1, normalized);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const normalized = searchQuery.trim();
    setActiveSearch(normalized);
    loadUnits(1, normalized);
  };

  const handleRefresh = () => {
    loadUnits(page, activeSearch);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      loadUnits(page - 1, activeSearch);
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    if (page < totalPages) {
      loadUnits(page + 1, activeSearch);
    }
  };

  const handleDownloadExcel = () => {
    // TODO: Implement Excel download
    console.log('Download Excel');
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download
    console.log('Download PDF');
  };

  const columns: TableColumn<UnitWithIndex>[] = [
    {
      key: 'no',
      header: 'No',
      render: (row) => {
        const index = row._index ?? 0;
        return index + 1 + (page - 1) * perPage;
      },
    },
    {
      key: 'name',
      header: 'Nama',
      render: (row) => row.name,
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: () => (
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
            Edit
          </button>
          <button
            className="inline-flex items-center justify-center p-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
            title="Hapus"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const startItem = total === 0 ? 0 : (page - 1) * perPage + 1;
  const endItem = total === 0 ? 0 : Math.min(page * perPage, total);

  const dataWithIndex: UnitWithIndex[] = units.map((unit, index) => ({
    ...unit,
    _index: index,
  }));

  return (
    <div className="units-page">
      {/* Header dengan Search dan Refresh */}
      <div className="units-page__header">
        <div className="units-page__search-group">
          <form className="units-page__search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Cari..."
              className="units-page__search-input"
              value={searchQuery}
              onChange={handleSearchInput}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
            />
            <button
              className="units-page__search-btn"
              type="submit"
              disabled={isLoading}
              title="Cari"
            >
              <Search size={14} />
              Cari
            </button>
          </form>
          <button
            className="units-page__refresh-btn"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Toolbar - Tombol Tambah & Download */}
      <div className="units-page__toolbar">
        <button className="units-page__btn-tambah">
          Tambah +
        </button>
        <div className="units-page__download-group">
          <button
            className="units-page__btn-download units-page__btn-download--excel"
            onClick={handleDownloadExcel}
            title="Download Excel"
          >
            <Download size={14} />
            Excel
          </button>
          <button
            className="units-page__btn-download units-page__btn-download--pdf"
            onClick={handleDownloadPDF}
            title="Download PDF"
          >
            <Download size={14} />
            PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="units-page__table-wrapper">
        {isLoading ? (
          <div className="units-page__loading">
            Memuat data...
          </div>
        ) : (
          <Table<UnitWithIndex>
            columns={columns}
            data={dataWithIndex}
            emptyText="Tidak ada data satuan"
          />
        )}
      </div>

      {/* Pagination Info & Controls */}
      <div className="units-page__pagination">
        <div className="units-page__pagination-info">
          {total === 0 ? 'Tidak ada data' : `Menampilkan ${startItem}-${endItem} dari ${total}`}
        </div>
        <div className="units-page__pagination-controls">
          <button
            className="units-page__pagination-btn"
            onClick={handlePreviousPage}
            disabled={page === 1}
            title="Halaman sebelumnya"
          >
            ←
          </button>
          <span className="units-page__pagination-number">{page}</span>
          <button
            className="units-page__pagination-btn"
            onClick={handleNextPage}
            disabled={page >= totalPages}
            title="Halaman berikutnya"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
