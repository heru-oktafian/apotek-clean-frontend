import { useState } from 'react';
import { Edit2, Trash2, Plus, Download, RefreshCw } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { useUnits } from '../hooks/useUnits';
import { createUnit, updateUnit, deleteUnit } from '../api/units-api';
import { buildApiUrl } from '../../../lib/api/env';
import { toast, Table, Modal, Button, Input, Pagination, type TableColumn } from '../../../components/ui';
import { ListSearchBar } from '../../../components/list/ListSearchBar';
import { ActionToolbar } from '../../../components/list/ActionToolbar';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { useListSearch } from '../../../hooks/useListSearch';

interface UnitRow {
  _index?: number;
  id?: number | string;
  name: string;
  createdAt?: string;
}

interface UnitFormData {
  name: string;
}

export function UnitsPage() {
  const { activeToken } = useAuth();

  // Search
  const { searchInput, handleSearchInputChange, handleSearch, handleReset } = useListSearch({
    onSearch: (_search) => loadUnits(1, _search),
  });
  const activeSearch = searchInput.trim().toLowerCase();

  const { units, total, page, perPage, isLoading, loadUnits } = useUnits(activeToken || '');

  // Modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitRow | null>(null);
  const [formData, setFormData] = useState<UnitFormData>({ name: '' });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UnitFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<UnitRow | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Download states
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // ── Refresh ──────────────────────────────────────
  const handleRefresh = () => {
    loadUnits(page, activeSearch);
  };

  // ── Add / Edit ─────────────────────────────────
  const openAdd = () => {
    setEditingUnit(null);
    setFormData({ name: '' });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const openEdit = (unit: UnitRow) => {
    setEditingUnit(unit);
    setFormData({ name: unit.name });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setEditingUnit(null);
    setIsEditOpen(false);
    setFormData({ name: '' });
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setFormErrors({ name: 'Nama satuan wajib diisi.' });
      toast.error('Nama satuan wajib diisi.');
      return;
    }
    if (!activeToken) {
      toast.error('Token tidak tersedia, login ulang.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingUnit?.id) {
        await updateUnit(activeToken, editingUnit.id, { name: formData.name });
        toast.success('Satuan berhasil diperbarui.');
      } else {
        await createUnit(activeToken, { name: formData.name });
        toast.success('Satuan berhasil ditambahkan.');
      }
      closeEdit();
      loadUnits(1, activeSearch);
    } catch {
      toast.error('Gagal menyimpan satuan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ──────────────────────────────────────
  const openDeleteConfirm = (unit: UnitRow) => {
    setDeleteTarget(unit);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteTarget(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id || !activeToken) return;

    setIsDeleting(true);
    try {
      await deleteUnit(activeToken, deleteTarget.id);
      toast.success('Satuan berhasil dihapus.');
      closeDeleteConfirm();
      loadUnits(page, activeSearch);
    } catch {
      toast.error('Gagal menghapus satuan.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Download ────────────────────────────────────
  const downloadFile = async (path: string, defaultName: string) => {
    if (!activeToken) { toast.error('Token tidak tersedia.'); return; }
    try {
      const res = await fetch(buildApiUrl(path), {
        headers: { Authorization: `Bearer ${activeToken}`, Accept: '*/*' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = defaultName;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      toast.error('Gagal mengunduh file.');
    }
  };

  const handleDownloadExcel = async () => {
    if (!activeToken) { toast.error('Token tidak tersedia.'); return; }
    setIsDownloadingExcel(true);
    try {
      await downloadFile('/api/units/excel', 'satuan.xlsx');
      toast.success('Excel berhasil diunduh.');
    } catch {
      toast.error('Gagal mengunduh Excel.');
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!activeToken) { toast.error('Token tidak tersedia.'); return; }
    setIsDownloadingPdf(true);
    try {
      await downloadFile('/api/units/pdf', 'satuan.pdf');
      toast.success('PDF berhasil diunduh.');
    } catch {
      toast.error('Gagal mengunduh PDF.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // ── Columns ────────────────────────────────────
  const dataWithIndex: UnitRow[] = units.map((u, i) => ({ ...u, _index: i }));
  const columns: TableColumn<UnitRow>[] = [
    {
      key: 'no',
      header: 'No',
      align: 'center',
      width: '60px',
      render: (row) => (row._index ?? 0) + 1 + (page - 1) * perPage,
    },
    { key: 'name', header: 'Nama Satuan' },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'center',
      width: '120px',
      render: (row) => (
        <div className="flex justify-center gap-1">
          <button
            type="button"
            onClick={() => openEdit(row)}
            className="inline-flex items-center justify-center p-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded transition-colors"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            onClick={() => openDeleteConfirm(row)}
            className="inline-flex items-center justify-center p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
            title="Hapus"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="list-page">
      {/* Header dengan Search */}
      <div className="list-page__header">
        <ListSearchBar
          value={searchInput}
          onChange={handleSearchInputChange}
          onSearch={handleSearch}
          placeholder="Cari satuan..."
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
        addLabel="Tambah"
        onAddClick={openAdd}
        showExportExcel
        showExportPdf
        onExportExcel={handleDownloadExcel}
        onExportPdf={handleDownloadPdf}
        isLoading={isLoading || isDownloadingExcel || isDownloadingPdf}
      />

      {/* Table */}
      <div className="list-page__table-wrapper">
        {isLoading ? (
          <div className="list-page__loading">Memuat data...</div>
        ) : (
          <Table<UnitRow>
            columns={columns}
            data={dataWithIndex}
            emptyText="Tidak ada data satuan"
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleteConfirmOpen}
        onClose={closeDeleteConfirm}
        title="Hapus Satuan"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Yakin menghapus satuan <strong>{deleteTarget?.name}</strong>?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeDeleteConfirm}>Batal</Button>
            <Button type="button" variant="danger" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit / Add Modal */}
      <Modal
        open={isEditOpen}
        onClose={closeEdit}
        title={editingUnit ? 'Ubah Satuan' : 'Tambah Satuan'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Nama satuan"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
              }}
              aria-label="Nama satuan"
            />
            {formErrors.name && <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeEdit}>Batal</Button>
            <Button
              type="submit"
              variant={editingUnit ? 'outline' : 'primary'}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Menyimpan...' : editingUnit ? 'Simpan' : 'Tambahkan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Pagination */}
      <Pagination
        page={page}
        total={total}
        perPage={perPage}
        onPageChange={(p) => loadUnits(p, activeSearch)}
      />
    </div>
  );
}
