import { useState } from 'react';
import { Edit2, Trash2, RefreshCw, Search, Plus, Download } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { useMemberCategories } from '../hooks/useMemberCategories';
import {
  createMemberCategory,
  updateMemberCategory,
  deleteMemberCategory,
} from '../api/member-categories-api';
import { useToast, Table, Modal, Button, Input, Pagination, type TableColumn } from '../../../components/ui';
import { buildApiUrl } from '../../../lib/api/env';
import type { MemberCategory } from '../types/member-categories';

export function MemberCategoriesPage() {
  const { activeToken } = useAuth();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MemberCategory | null>(null);
  const [nama, setNama] = useState('');
  const [pointsConversionRate, setPointsConversionRate] = useState('');
  const [branchId, setBranchId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<MemberCategory | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const {
    categories,
    page,
    setPage,
    perPage,
    total,
    isLoading,
    apiError,
    loadMemberCategories,
  } = useMemberCategories();

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const normalized = searchQuery.trim();
    setActiveSearch(normalized);
    setPage(1);
    void loadMemberCategories(1, normalized);
  };

  const openAddCategory = () => {
    setEditingCategory(null);
    setNama('');
    setPointsConversionRate('');
    setBranchId('');
    setErrors({});
    setModalOpen(true);
  };

  const openEditCategory = (category: MemberCategory) => {
    setEditingCategory(category);
    setNama(category.nama);
    setPointsConversionRate(String(category.pointsConversionRate));
    setBranchId(category.branchId);
    setErrors({});
    setModalOpen(true);
  };

  const closeCategoryModal = () => {
    setModalOpen(false);
  };

  const validateCategory = () => {
    const e: Record<string, string> = {};
    if (!nama.trim()) e.nama = 'Wajib diisi.';
    return e;
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCategory();
    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    if (!activeToken) {
      toast.addToast('Token tidak tersedia, login ulang.', 'error');
      return;
    }

    try {
      const body = {
        name: nama.trim(),
        nama: nama.trim(),
        points_conversion_rate: Number(pointsConversionRate) || 0,
        pointsConversionRate: Number(pointsConversionRate) || 0,
        branch_id: branchId,
        branchId,
      };

      if (editingCategory?.id) {
        await updateMemberCategory(activeToken, editingCategory.id, body);
        toast.addToast('Kategori member berhasil diperbarui.', 'success');
      } else {
        await createMemberCategory(activeToken, body);
        toast.addToast('Kategori member berhasil ditambahkan.', 'success');
      }

      setModalOpen(false);
      setEditingCategory(null);
      setNama('');
      setPointsConversionRate('');
      setBranchId('');
      setErrors({});
      void loadMemberCategories(1, activeSearch);
    } catch (error) {
      console.error(error);
      toast.addToast(error instanceof Error ? error.message : 'Gagal menyimpan kategori member.', 'error');
    }
  };

  const openDeleteConfirm = (category: MemberCategory) => {
    setDeleteTarget(category);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteTarget(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deleteTarget || !activeToken) return;

    try {
      await deleteMemberCategory(activeToken, deleteTarget.id);
      toast.addToast('Kategori member berhasil dihapus.', 'success');
      closeDeleteConfirm();
      void loadMemberCategories(1, activeSearch);
    } catch (error) {
      console.error(error);
      toast.addToast(error instanceof Error ? error.message : 'Gagal menghapus kategori member.', 'error');
    }
  };

  const handleRefresh = () => {
    void loadMemberCategories(page, activeSearch);
  };

  const downloadFile = async (path: string, defaultName: string) => {
    if (!activeToken) {
      toast.addToast('Token tidak tersedia, login ulang.', 'error');
      return;
    }

    try {
      const response = await fetch(buildApiUrl(path), {
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

      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition') || '';
      const filenameMatch = /filename\*=(?:UTF-8'')?([^;\n]+)|filename=(?:"?)([^";\n]+)(?:"?)/i.exec(contentDisposition);
      const fileName = filenameMatch ? decodeURIComponent((filenameMatch[1] || filenameMatch[2]).trim()) : defaultName;
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error(error);
      toast.addToast('Gagal mengunduh file. Cek koneksi atau endpoint.', 'error');
    }
  };

  const handleDownloadExcel = async () => {
    await downloadFile('/api/member-categories/excel', 'member-categories.xlsx');
  };

  const handleDownloadPDF = async () => {
    await downloadFile('/api/member-categories/pdf', 'member-categories.pdf');
  };

  const columns: TableColumn<MemberCategory>[] = [
    { key: 'id', header: 'ID' },
    { key: 'nama', header: 'Nama Kategori' },
    { key: 'pointsConversionRate', header: 'Rate Poin' },
    { key: 'branchId', header: 'Branch ID' },
    {
      key: 'actions',
      header: 'Aksi',
      render: (row) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openEditCategory(row)}
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

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    void loadMemberCategories(nextPage, activeSearch);
  };

  return (
    <div className="units-page">
      <div className="units-page__header">
        <div className="units-page__search-group">
          <form className="units-page__search-form" onSubmit={handleSearchSubmit}>
            <Input
              placeholder="Cari kategori member..."
              className="units-page__search-input"
              value={searchQuery}
              onChange={handleSearchInput}
              aria-label="Cari kategori member"
            />
            <button className="units-page__search-btn" type="submit">
              <Search size={14} />
              Cari
            </button>
          </form>
          <button type="button" className="units-page__refresh-btn" onClick={handleRefresh} title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="units-page__toolbar">
        <button type="button" className="units-page__btn-tambah" onClick={openAddCategory}>
          <Plus size={14} /> Tambah +
        </button>
        <div className="units-page__download-group">
          <button
            type="button"
            className="units-page__btn-download units-page__btn-download--excel"
            onClick={handleDownloadExcel}
            title="Download Excel"
          >
            <Download size={14} />
            Excel
          </button>
          <button
            type="button"
            className="units-page__btn-download units-page__btn-download--pdf"
            onClick={handleDownloadPDF}
            title="Download PDF"
          >
            <Download size={14} />
            PDF
          </button>
        </div>
      </div>

      <div className="units-page__table-wrapper">
        {apiError ? (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{apiError}</div>
        ) : null}
        <Table columns={columns} data={categories} emptyText={isLoading ? 'Memuat data...' : 'Tidak ada kategori member'} />
      </div>

      <Modal open={modalOpen} onClose={closeCategoryModal} title={editingCategory ? 'Ubah Kategori Member' : 'Tambah Kategori Member'} size="sm">
        <form onSubmit={handleCategorySubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Nama kategori"
              value={nama}
              onChange={(e) => {
                setNama(e.target.value);
                setErrors((prev) => ({ ...prev, nama: '' }));
              }}
              aria-label="Nama kategori member"
            />
            {errors.nama && <p className="text-sm text-red-600 mt-1">{errors.nama}</p>}
          </div>
          <div>
            <Input
              type="number"
              placeholder="Rate poin"
              value={pointsConversionRate}
              onChange={(e) => setPointsConversionRate(e.target.value)}
              aria-label="Rate poin member"
            />
          </div>
          <div>
            <Input
              placeholder="Branch ID"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              aria-label="Branch ID"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeCategoryModal}>Batal</Button>
            <Button type="submit" variant="primary" className={editingCategory ? 'bg-amber-500 hover:bg-amber-600 text-slate-900' : 'bg-green-600 hover:bg-green-700 text-white'}>
              {editingCategory ? 'Simpan' : 'Tambahkan'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={isDeleteConfirmOpen} onClose={closeDeleteConfirm} title="Hapus Kategori Member" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Yakin ingin menghapus kategori <strong>{deleteTarget?.nama}</strong>?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeDeleteConfirm}>Batal</Button>
            <Button type="button" variant="danger" onClick={handleConfirmDeleteCategory}>Hapus</Button>
          </div>
        </div>
      </Modal>

      <Pagination page={page} total={total} perPage={perPage} onPageChange={handlePageChange} />
    </div>
  );
}
