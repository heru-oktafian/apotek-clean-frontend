import { useState } from 'react';
import { Edit2, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { useMemberCategories } from '../hooks/useMemberCategories';
import { createMemberCategory, updateMemberCategory, deleteMemberCategory } from '../api/member-categories-api';
import { buildApiUrl } from '../../../lib/api/env';
import { toast, Table, Modal, Button, Input, Pagination, type TableColumn } from '../../../components/ui';
import { ListSearchBar } from '../../../components/list/ListSearchBar';
import { ActionToolbar } from '../../../components/list/ActionToolbar';
import { useListSearch } from '../../../hooks/useListSearch';

interface MemberCategoryRow {
  _index?: number;
  id: number;
  nama: string;
  pointsConversionRate: number;
  branchId: string;
}

interface MemberCategoryFormData {
  nama: string;
  pointsConversionRate: string;
}

export function MemberCategoriesPage() {
  const { activeToken } = useAuth();

  // Search
  const { searchInput, handleSearchInputChange, handleSearch } = useListSearch({
    onSearch: (_search) => loadMemberCategories(1, _search),
  });
  const activeSearch = searchInput.trim().toLowerCase();

  const { categories, total, perPage, isLoading, loadMemberCategories } = useMemberCategories();
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MemberCategoryRow | null>(null);
  const [formData, setFormData] = useState<MemberCategoryFormData>({
    nama: '',
    pointsConversionRate: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof MemberCategoryFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<MemberCategoryRow | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Download state
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);

  // ── Refresh ──────────────────────────────────────
  const handleRefresh = () => {
    loadMemberCategories(currentPage, activeSearch);
  };

  // ── Add / Edit ─────────────────────────────────
  const openAdd = () => {
    setEditingCategory(null);
    setFormData({ nama: '', pointsConversionRate: '' });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const openEdit = (cat: MemberCategoryRow) => {
    setEditingCategory(cat);
    setFormData({
      nama: cat.nama,
      pointsConversionRate: String(cat.pointsConversionRate),
    });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setEditingCategory(null);
    setIsEditOpen(false);
    setFormData({ nama: '', pointsConversionRate: '' });
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
        points_conversion_rate: formData.pointsConversionRate ? parseFloat(formData.pointsConversionRate) : 0,
        pointsConversionRate: formData.pointsConversionRate ? parseFloat(formData.pointsConversionRate) : 0,
        branch_id: '1',
        branchId: '1',
      };
      if (editingCategory?.id) {
        await updateMemberCategory(activeToken, editingCategory.id, body);
        toast.success('Kategori member berhasil diperbarui.');
      } else {
        await createMemberCategory(activeToken, body);
        toast.success('Kategori member berhasil ditambahkan.');
      }
      closeEdit();
      loadMemberCategories(1, activeSearch);
    } catch {
      toast.error('Gagal menyimpan kategori.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ──────────────────────────────────────
  const openDeleteConfirm = (cat: MemberCategoryRow) => {
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
      await deleteMemberCategory(activeToken, deleteTarget.id);
      toast.success('Kategori member berhasil dihapus.');
      closeDeleteConfirm();
      loadMemberCategories(currentPage, activeSearch);
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
      const res = await fetch(buildApiUrl('/api/member-categories/excel'), {
        headers: { Authorization: `Bearer ${activeToken}`, Accept: '*/*' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'kategori-member.xlsx';
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
  const dataWithIndex: MemberCategoryRow[] = categories.map((c, i) => ({ ...c, _index: i }));
  const columns: TableColumn<MemberCategoryRow>[] = [
    {
      key: 'no',
      header: 'No',
      align: 'center',
      width: '60px',
      render: (row) => (row._index ?? 0) + 1 + (currentPage - 1) * perPage,
    },
    { key: 'nama', header: 'Nama Kategori' },
    {
      key: 'pointsConversionRate',
      header: 'Rate Poin',
      align: 'center',
      render: (row) => (row.pointsConversionRate !== undefined && row.pointsConversionRate !== null ? `${row.pointsConversionRate}` : '-'),
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
        onExportExcel={handleDownloadExcel}
        isLoading={isLoading || isDownloadingExcel}
      />

      {/* Table */}
      <div className="list-page__table-wrapper">
        {isLoading ? (
          <div className="list-page__loading">Memuat data...</div>
        ) : (
          <Table<MemberCategoryRow>
            columns={columns}
            data={dataWithIndex}
            emptyText="Tidak ada data kategori member"
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleteConfirmOpen}
        onClose={closeDeleteConfirm}
        title="Hapus Kategori Member"
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
        title={editingCategory ? 'Ubah Kategori Member' : 'Tambah Kategori Member'}
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
          <div>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="Contoh: 10"
              value={formData.pointsConversionRate}
              onChange={(e) => setFormData({ ...formData, pointsConversionRate: e.target.value })}
              aria-label="Rate Poin"
            />
            <p className="text-xs text-slate-400 mt-1">Rate konversi poin untuk kategori ini.</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeEdit}>Batal</Button>
            <Button
              type="submit"
              variant={editingCategory ? 'outline' : 'primary'}
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
        onPageChange={(p) => { setCurrentPage(p); loadMemberCategories(p, activeSearch); }}
      />
    </div>
  );
}
