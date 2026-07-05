import { useState } from 'react';
import { Edit2, Trash2, RefreshCw, Download, Search } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { Button, Input, Modal, Pagination, useToast, Table, type TableColumn } from '../../../components/ui';
import { buildApiUrl } from '../../../lib/api/env';
import { useCategories, type Category } from '../hooks/useCategories';
import { createCategory, updateCategory, deleteCategory } from '../api/categories-api';

export function CategoriesPage() {
  const { activeToken } = useAuth();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const { categories, page, setPage, perPage, total, isLoading, apiError, loadCategories } = useCategories();

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setActiveSearch(searchQuery.trim());
    setPage(1);
    void loadCategories(1, searchQuery.trim());
  };

  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryName('');
    setErrors({});
    setModalOpen(true);
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.nama);
    setErrors({});
    setModalOpen(true);
  };

  const closeCategoryModal = () => {
    setModalOpen(false);
  };

  const validateCategory = () => {
    const e: Record<string, string> = {};
    if (!categoryName.trim()) e.nama = 'Wajib diisi.';
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
      const body = { name: categoryName, nama: categoryName, product_category_name: categoryName };

      if (editingCategory) {
        await updateCategory(activeToken, editingCategory.id, body);
        toast.addToast('Kategori produk berhasil diperbarui.', 'success');
      } else {
        await createCategory(activeToken, body);
        toast.addToast('Kategori produk berhasil ditambahkan.', 'success');
      }

      setModalOpen(false);
      setEditingCategory(null);
      setCategoryName('');
      setErrors({});

      void loadCategories(1, activeSearch);
    } catch (error) {
      console.error(error);
      toast.addToast(error instanceof Error ? error.message : 'Gagal menyimpan kategori.', 'error');
    }
  };

  const openDeleteConfirm = (category: Category) => {
    setDeleteTarget(category);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteTarget(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deleteTarget) return;

    if (!activeToken) {
      toast.addToast('Token tidak tersedia, login ulang.', 'error');
      return;
    }

    try {
      await deleteCategory(activeToken, deleteTarget.id);
      toast.addToast('Kategori produk berhasil dihapus.', 'success');
      closeDeleteConfirm();
      void loadCategories(1, activeSearch);
    } catch (error) {
      console.error(error);
      toast.addToast(error instanceof Error ? error.message : 'Gagal menghapus kategori.', 'error');
    }
  };

  const handleRefresh = () => {
    setPage(1);
    setActiveSearch('');
    setSearchQuery('');
    void loadCategories(1, '');
    toast.addToast('Data kategori disegarkan.', 'success');
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    void loadCategories(nextPage, activeSearch);
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
    await downloadFile('/api/categories/excel', 'categories.xlsx');
  };

  const handleDownloadPDF = async () => {
    await downloadFile('/api/categories/pdf', 'categories.pdf');
  };

  const columns: TableColumn<Category>[] = [
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
            <Input placeholder="Cari kategori..." className="units-page__search-input" value={searchQuery} onChange={handleSearchInput} aria-label="Cari kategori" />
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
        {apiError ? <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{apiError}</div> : null}
        <Table columns={columns} data={categories} emptyText={isLoading ? 'Memuat data...' : 'Tidak ada kategori produk'} />
      </div>

      <Modal open={modalOpen} onClose={closeCategoryModal} title={editingCategory ? 'Ubah Kategori Produk' : 'Tambah Kategori Produk'} size="sm">
        <form onSubmit={handleCategorySubmit} className="space-y-4">
          <div>
            <Input placeholder="Nama kategori" value={categoryName} onChange={(e) => { setCategoryName(e.target.value); setErrors((prev) => ({ ...prev, nama: '' })); }} aria-label="Nama kategori" />
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

      <Modal open={isDeleteConfirmOpen} onClose={closeDeleteConfirm} title="Hapus Kategori Produk" size="sm">
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
