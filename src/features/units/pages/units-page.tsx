import { useState } from 'react';
import { Edit2, Trash2, RefreshCw, Download, Search } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { useUnits } from '../hooks/useUnits';
import { createUnit, updateUnit, deleteUnit } from '../api/units-api';
import { Modal, Button, Input, useToast } from '../../../components/ui';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { buildApiUrl } from '../../../lib/api/env';
import type { Unit } from '../types/units';

interface UnitWithIndex extends Unit {
  _index?: number;
}

export function UnitsPage() {
  const { activeToken } = useAuth();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitError, setNewUnitError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Unit | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
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

  const openAddUnit = () => {
    setEditingUnit(null);
    setNewUnitName('');
    setNewUnitError('');
    setIsAddOpen(true);
  };

  const openEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setNewUnitName(unit.name);
    setNewUnitError('');
    setIsAddOpen(true);
  };

  const closeAddUnit = () => {
    setIsAddOpen(false);
  };

  const handleAddUnitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = newUnitName.trim();
    if (!normalized) {
      setNewUnitError('Nama satuan wajib diisi.');
      return;
    }
    if (!activeToken) {
      toast.addToast('Token tidak tersedia, login ulang.', 'error');
      return;
    }

    try {
      if (editingUnit?.id) {
        await updateUnit(activeToken, editingUnit.id, { name: normalized });
        toast.addToast('Satuan berhasil diperbarui.', 'success');
      } else {
        await createUnit(activeToken, { name: normalized });
        toast.addToast('Satuan berhasil ditambahkan.', 'success');
      }

      setIsAddOpen(false);
      setEditingUnit(null);
      setNewUnitName('');
      setNewUnitError('');
      loadUnits(1, activeSearch);
    } catch (error) {
      console.error(error);
      toast.addToast('Gagal menyimpan satuan. Coba lagi.', 'error');
    }
  };

  const openDeleteConfirm = (unit: Unit) => {
    if (!unit.id || !activeToken) return;
    setDeleteTarget(unit);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteTarget(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleConfirmDeleteUnit = async () => {
    if (!deleteTarget?.id || !activeToken) return;
    try {
      await deleteUnit(activeToken, deleteTarget.id);
      toast.addToast('Satuan berhasil dihapus.', 'success');
      closeDeleteConfirm();
      loadUnits(1, activeSearch);
    } catch (error) {
      console.error(error);
      toast.addToast('Gagal menghapus satuan.', 'error');
    }
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

  const downloadFile = async (path: string, defaultName: string) => {
    if (!activeToken) {
      console.warn('Token tidak tersedia untuk download file.');
      return;
    }

    const url = buildApiUrl(path);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${activeToken}`,
        Accept: 'application/octet-stream, application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, */*',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Download gagal: ${response.status} - ${errorText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json') || contentType.includes('text/html')) {
      const errorText = await response.text();
      throw new Error(`Download gagal: respons bukan file (${contentType}). ${errorText}`);
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get('content-disposition') || '';

    if (!contentDisposition) {
      console.warn('Content-Disposition header tidak tersedia dari response; nama file default akan digunakan.');
    }

    const parseFileName = (header: string, fallback: string) => {
      if (!header) return fallback;
      const filenameStarMatch = /filename\*=(?:UTF-8'')?([^;\n]+)/i.exec(header);
      const filenameMatch = filenameStarMatch
        ? filenameStarMatch[1]
        : /filename=(?:"?)([^";\n]+)(?:"?)/i.exec(header)?.[1];
      if (!filenameMatch) return fallback;
      const trimmed = filenameMatch.trim().replace(/^['"]|['"]$/g, '');
      try {
        return decodeURIComponent(trimmed);
      } catch {
        return trimmed;
      }
    };

    const fileName = parseFileName(contentDisposition, defaultName);

    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(blobUrl);
  };

  const handleDownloadExcel = async () => {
    await downloadFile('/api/units/excel', 'units.xlsx');
  };

  const handleDownloadPDF = async () => {
    await downloadFile('/api/units/pdf', 'units.pdf');
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
      render: (row) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openEditUnit(row)}
            className="inline-flex items-center justify-center p-2 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => openDeleteConfirm(row)}
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
        <button className="units-page__btn-tambah" onClick={openAddUnit}>
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

      {/* Add/Edit Unit Modal */}
      <Modal
        open={isAddOpen}
        onClose={closeAddUnit}
        title={editingUnit ? 'Ubah Satuan' : 'Tambah Satuan'}
        size="sm"
      >
        <form onSubmit={handleAddUnitSubmit} className="space-y-4">
          <Input
            placeholder="Nama satuan"
            value={newUnitName}
            onChange={(e) => {
              setNewUnitName(e.target.value);
              setNewUnitError('');
            }}
            aria-label="Nama satuan"
          />
          {newUnitError && <p className="text-sm text-red-600">{newUnitError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeAddUnit}>Batal</Button>
            <Button
              type="submit"
              variant="primary"
              className={editingUnit ? 'bg-amber-500 hover:bg-amber-600 text-slate-900' : 'bg-green-600 hover:bg-green-700 text-white'}
            >
              {editingUnit ? 'Simpan' : 'Tambahkan'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={isDeleteConfirmOpen} onClose={closeDeleteConfirm} title="Hapus Satuan" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Yakin ingin menghapus satuan <strong>{deleteTarget?.name}</strong>?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeDeleteConfirm}>Batal</Button>
            <Button type="button" variant="danger" onClick={handleConfirmDeleteUnit}>Hapus</Button>
          </div>
        </div>
      </Modal>

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
