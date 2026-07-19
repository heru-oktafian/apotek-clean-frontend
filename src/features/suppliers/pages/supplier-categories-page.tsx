import { useState } from 'react';
import { Edit2, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { useSupplierCategories } from '../hooks/useSupplierCategories';
import { createSupplierCategory, updateSupplierCategory, deleteSupplierCategory } from '../api/supplier-categories-api';
import { buildApiUrl } from '../../../lib/api/env';
import { toast, Table, Modal, Button, Input, Pagination, type TableColumn } from '../../../components/ui';
import { ListSearchBar } from '../../../components/list/ListSearchBar';
import { ActionToolbar } from '../../../components/list/ActionToolbar';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { useListSearch } from '../../../hooks/useListSearch';

interface SupplierCategoryRow {
  _index?: number;
  id?: number;
  nama: string;
}

interface CategoryFormData {
  name: string;
}

export function SupplierCategoriesPage() {
  const { activeToken } = useAuth();

  // Search
  const { searchInput, handleSearchInputChange, handleSearch } = useListSearch({
    onSearch: (_search) => loadSupplierCategories(1, _search),
  });
  const activeSearch = searchInput.trim().toLowerCase();

  const { categories, total, perPage, isLoading, loadSupplierCategories } = useSupplierCategories(activeToken || '');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SupplierCategoryRow | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({ name: '' });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CategoryFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<SupplierCategoryRow | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Download state
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);

  // ── Refresh ──────────────────────────────────────
  const handleRefresh = () => {
    loadSupplierCategories(currentPage, activeSearch);
  };

  // ── Add / Edit ─────────────────────────────────
  const openAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '' });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const openEdit = (cat: SupplierCategoryRow) => {
    setEditingCategory(cat);
    setFormData({ name: cat.nama });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setEditingCategory(null);
    setIsEditOpen(false);
    setFormData({ name: '' });
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setFormErrors({ name: 'Nama kategori wajib diisi.' });
      toast.error('Nama kategori wajib diisi.');
      return;
    }
    if (!activeToken) {
      toast.error('Token tidak tersedia, login ulang.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory?.id) {
        await updateSupplierCategory(activeToken, editingCategory.id, { name: formData.name });
        toast.success('Kategori supplier berhasil diperbarui.');
      } else {
        await createSupplierCategory(activeToken, { name: formData.name });
        toast.success('Kategori supplier berhasil ditambahkan.');
      }
      closeEdit();
      loadSupplierCategories(1, activeSearch);
    } catch {
      toast.error('Gagal menyimpan kategori.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ──────────────────────────────────────
  const openDeleteConfirm = (cat: SupplierCategoryRow) => {
    setDeleteTarget(cat);
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
      await deleteSupplierCategory(activeToken, deleteTarget.id);
      toast.success('Kategori supplier berhasil dihapus.');
      closeDeleteConfirm();
      loadSupplierCategories(currentPage, activeSearch);
    } catch {
      toast.error('Gagal menghapus kategori.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Download ────────────────────────────────────
  const handleDownloadExcel = async () => {
    if (!activeToken) { toast.error('Token tidak tersedia.'); return; }
    setIsDownloadingExcel(true);
    try {
      const res = await fetch(buildApiUrl('/api/supplier-categories/excel'), {
        headers: { Authorization: `Bearer ${activeToken}`, Accept: '*/*' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'kategori-supplier.xlsx';
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success('Excel berhasil diunduh.');
    } catch {
      toast.error('Gagal mengunduh Excel.');
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  // ── Columns ────────────────────────────────────
  const dataWithIndex: SupplierCategoryRow[] = categories.map((c, i) => ({ ...c, _index: i }));
  const columns: TableColumn<SupplierCategoryRow>[] = [
    {
      key: 'no',
      header: 'No',
      align: 'center',
      width: '60px',
      render: (row) => (row._index ?? 0) + 1 + (currentPage - 1) * perPage,
    },
    { key: 'nama', header: 'Nama Kategori Supplier' },
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
          placeholder="Cari kategori..."
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
        onExportExcel={handleDownloadExcel}
        isLoading={isLoading || isDownloadingExcel}
      />

      {/* Table */}
      <div className="list-page__table-wrapper">
        {isLoading ? (
          <div className="list-page__loading">Memuat data...</div>
        ) : (
          <Table<SupplierCategoryRow>
            columns={columns}
            data={dataWithIndex}
            emptyText="Tidak ada data kategori supplier"
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleteConfirmOpen}
        onClose={closeDeleteConfirm}
        title="Hapus Kategori Supplier"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Yakin menghapus kategori <strong>{deleteTarget?.nama}</strong>?
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
        title={editingCategory ? 'Ubah Kategori Supplier' : 'Tambah Kategori Supplier'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Nama kategori supplier"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
              }}
              aria-label="Nama kategori supplier"
            />
            {formErrors.name && <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeEdit}>Batal</Button>
            <Button
              type="submit"
              variant={editingCategory ? 'edit' : 'primary'}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Menyimpan...' : editingCategory ? 'Simpan' : 'Tambahkan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Pagination */}
      <Pagination
        page={currentPage}
        total={total}
        perPage={perPage}
        onPageChange={(p) => { setCurrentPage(p); loadSupplierCategories(p, activeSearch); }}
      />
    </div>
  );
}
