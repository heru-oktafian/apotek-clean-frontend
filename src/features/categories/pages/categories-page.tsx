import { useState } from 'react';
import { Edit2, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { useCategories } from '../hooks/useCategories';
import { createCategory, updateCategory, deleteCategory } from '../api/categories-api';
import { buildApiUrl } from '../../../lib/api/env';
import { toast, Table, Modal, Button, Input, Pagination, type TableColumn } from '../../../components/ui';
import { ListSearchBar } from '../../../components/list/ListSearchBar';
import { ActionToolbar } from '../../../components/list/ActionToolbar';
import { useListSearch } from '../../../hooks/useListSearch';

interface CategoryRow {
  _index?: number;
  id: number;
  nama: string;
}

interface CategoryFormData {
  nama: string;
}

export function CategoriesPage() {
  const { activeToken } = useAuth();

  // Search
  const { searchInput, handleSearchInputChange, handleSearch } = useListSearch({
    onSearch: (_search) => loadCategories(1, _search),
  });
  const activeSearch = searchInput.trim().toLowerCase();

  const { categories, total, perPage, isLoading, loadCategories } = useCategories();
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({ nama: '' });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CategoryFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Download state
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // ── Refresh ──────────────────────────────────────
  const handleRefresh = () => {
    loadCategories(currentPage, activeSearch);
  };

  // ── Add / Edit ─────────────────────────────────
  const openAdd = () => {
    setEditingCategory(null);
    setFormData({ nama: '' });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const openEdit = (cat: CategoryRow) => {
    setEditingCategory(cat);
    setFormData({ nama: cat.nama });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setEditingCategory(null);
    setIsEditOpen(false);
    setFormData({ nama: '' });
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nama.trim()) {
      setFormErrors({ nama: 'Nama kategori wajib diisi.' });
      toast.error('Nama kategori wajib diisi.');
      return;
    }
    if (!activeToken) {
      toast.error('Token tidak tersedia, login ulang.');
      return;
    }

    setIsSubmitting(true);
    try {
      const body = {
        name: formData.nama,
        nama: formData.nama,
        product_category_name: formData.nama,
      };
      if (editingCategory?.id) {
        await updateCategory(activeToken, editingCategory.id, body);
        toast.success('Kategori berhasil diperbarui.');
      } else {
        await createCategory(activeToken, body);
        toast.success('Kategori berhasil ditambahkan.');
      }
      closeEdit();
      loadCategories(1, activeSearch);
    } catch {
      toast.error('Gagal menyimpan kategori.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ──────────────────────────────────────
  const openDeleteConfirm = (cat: CategoryRow) => {
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
      await deleteCategory(activeToken, deleteTarget.id);
      toast.success('Kategori berhasil dihapus.');
      closeDeleteConfirm();
      loadCategories(currentPage, activeSearch);
    } catch {
      toast.error('Gagal menghapus kategori.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Download ────────────────────────────────────
  const downloadFile = async (path: string, defaultName: string, successMsg: string) => {
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
      toast.success(successMsg);
    } catch {
      toast.error('Gagal mengunduh file.');
    }
  };

  const handleDownloadExcel = async () => {
    setIsDownloadingExcel(true);
    try {
      await downloadFile('/api/categories/excel', 'kategori.xlsx', 'Excel berhasil diunduh.');
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      await downloadFile('/api/categories/pdf', 'kategori.pdf', 'PDF berhasil diunduh.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // ── Columns ────────────────────────────────────
  const dataWithIndex: CategoryRow[] = categories.map((c, i) => ({ ...c, _index: i }));
  const columns: TableColumn<CategoryRow>[] = [
    {
      key: 'no',
      header: 'No',
      align: 'center',
      width: '60px',
      render: (row) => (row._index ?? 0) + 1 + (currentPage - 1) * perPage,
    },
    { 
      key: 'nama', 
      header: 'Nama Kategori' 
    },
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
          <Table<CategoryRow>
            columns={columns}
            data={dataWithIndex}
            emptyText="Tidak ada data kategori produk"
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleteConfirmOpen}
        onClose={closeDeleteConfirm}
        title="Hapus Kategori"
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
        title={editingCategory ? 'Ubah Kategori' : 'Tambah Kategori'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Nama kategori"
              value={formData.nama}
              onChange={(e) => {
                setFormData({ ...formData, nama: e.target.value });
                if (formErrors.nama) setFormErrors({ ...formErrors, nama: undefined });
              }}
              aria-label="Nama kategori"
            />
            {formErrors.nama && <p className="text-sm text-red-600 mt-1">{formErrors.nama}</p>}
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
        onPageChange={(p) => { setCurrentPage(p); loadCategories(p, activeSearch); }}
      />
    </div>
  );
}
