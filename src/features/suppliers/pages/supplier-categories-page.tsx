import { useState } from 'react';
import { Edit2, Trash2, RefreshCw, Search, Download, Plus } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { useToast, Table, Modal, Button, Input, Pagination, type TableColumn } from '../../../components/ui';
import { useSupplierCategories } from '../hooks/useSupplierCategories';
import { buildApiUrl } from '../../../lib/api/env';
import type { SupplierCategory } from '../types/supplier-categories';

export function SupplierCategoriesPage() {
  const { activeToken } = useAuth();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SupplierCategory | null>(null);
  const [nama, setNama] = useState('');
  const [branchId, setBranchId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<SupplierCategory | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const { categories, total, perPage, isLoading, error, loadSupplierCategories } = useSupplierCategories(activeToken || '');

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const normalized = searchQuery.trim();
    setActiveSearch(normalized);
    setPage(1);
    void loadSupplierCategories(1, normalized);
  };

  const openAddCategory = () => {
    setEditingCategory(null);
    setNama('');
    setBranchId('');
    setErrors({});
    setModalOpen(true);
  };

  const openEditCategory = (category: SupplierCategory) => {
    setEditingCategory(category);
    setNama(category.nama);
    setBranchId(category.branchId ?? '');
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
      const body = { name: nama, nama, branch_id: branchId, branchId };

      if (editingCategory) {
        await fetch(`${buildApiUrl(`/api/supplier-categories/${editingCategory.id}`)}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${activeToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
        toast.addToast('Kategori supplier berhasil diperbarui.', 'success');
      } else {
        await fetch(`${buildApiUrl('/api/supplier-categories')}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${activeToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
        toast.addToast('Kategori supplier berhasil ditambahkan.', 'success');
      }

      setModalOpen(false);
      setEditingCategory(null);
      setNama('');
      setBranchId('');
      setErrors({});
      void loadSupplierCategories(1, activeSearch);
    } catch (error) {
      console.error(error);
      toast.addToast(error instanceof Error ? error.message : 'Gagal menyimpan kategori supplier.', 'error');
    }
  };

  const openDeleteConfirm = (category: SupplierCategory) => {
    setDeleteTarget(category);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteTarget(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deleteTarget || !activeToken) {
      toast.addToast('Token tidak tersedia, login ulang.', 'error');
      return;
    }

    try {
      await fetch(`${buildApiUrl(`/api/supplier-categories/${deleteTarget.id}`)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });
      toast.addToast('Kategori supplier berhasil dihapus.', 'success');
      closeDeleteConfirm();
      void loadSupplierCategories(1, activeSearch);
    } catch (error) {
      console.error(error);
      toast.addToast(error instanceof Error ? error.message : 'Gagal menghapus kategori supplier.', 'error');
    }
  };

  const handleRefresh = () => {
    setPage(1);
    setActiveSearch('');
    setSearchQuery('');
    void loadSupplierCategories(1, '');
    toast.addToast('Data kategori supplier disegarkan.', 'success');
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    void loadSupplierCategories(nextPage, activeSearch);
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
    await downloadFile('/api/supplier-categories/excel', 'supplier-categories.xlsx');
  };

  const handleDownloadPDF = async () => {
    await downloadFile('/api/supplier-categories/pdf', 'supplier-categories.pdf');
  };

  const columns: TableColumn<SupplierCategory>[] = [
    { key: 'id', header: 'ID' },
    { key: 'nama', header: 'Nama Kategori' },
    {
      key: 'actions',
      header: 'Aksi',
      render: (row) => (
        <div className="flex gap-2">
          <button type="button" onClick={() => openEditCategory(row)} className="inline-flex items-center justify-center p-2 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded transition-colors" title="Edit">
            <Edit2 size={16} />
          </button>
          <button type="button" onClick={() => openDeleteConfirm(row)} className="inline-flex items-center justify-center p-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors" title="Hapus">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="units-page">
      <div className="units-page__header">
        <div className="units-page__search-group">
          <form className="units-page__search-form" onSubmit={handleSearchSubmit}>
            <Input placeholder="Cari kategori supplier..." className="units-page__search-input" value={searchQuery} onChange={handleSearchInput} aria-label="Cari kategori supplier" />
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
          Tambah +
        </button>
        <div className="units-page__download-group">
          <button type="button" className="units-page__btn-download units-page__btn-download--excel" onClick={handleDownloadExcel} title="Download Excel">
            <Download size={14} />
            Excel
          </button>
          <button type="button" className="units-page__btn-download units-page__btn-download--pdf" onClick={handleDownloadPDF} title="Download PDF">
            <Download size={14} />
            PDF
          </button>
        </div>
      </div>

      <div className="units-page__table-wrapper">
        {error ? <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div> : null}
        <Table columns={columns} data={categories} emptyText={isLoading ? 'Memuat data...' : 'Tidak ada kategori supplier'} />
      </div>

      <Modal open={modalOpen} onClose={closeCategoryModal} title={editingCategory ? 'Ubah Kategori Supplier' : 'Tambah Kategori Supplier'} size="sm">
        <form onSubmit={handleCategorySubmit} className="space-y-4">
          <div>
            <Input placeholder="Nama kategori" value={nama} onChange={(e) => { setNama(e.target.value); setErrors((prev) => ({ ...prev, nama: '' })); }} aria-label="Nama kategori supplier" />
            {errors.nama && <p className="text-sm text-red-600 mt-1">{errors.nama}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeCategoryModal}>Batal</Button>
            <Button type="submit" variant="primary" className={editingCategory ? 'bg-amber-500 hover:bg-amber-600 text-slate-900' : 'bg-green-600 hover:bg-green-700 text-white'}>
              {editingCategory ? 'Simpan' : 'Tambahkan'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={isDeleteConfirmOpen} onClose={closeDeleteConfirm} title="Hapus Kategori Supplier" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-700">Yakin ingin menghapus kategori <strong>{deleteTarget?.nama}</strong>?</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeDeleteConfirm}>Batal</Button>
            <Button type="button" variant="danger" onClick={handleConfirmDeleteCategory}>Hapus</Button>
          </div>
        </div>
      </Modal>

      <Pagination
        page={page}
        total={total}
        perPage={perPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
