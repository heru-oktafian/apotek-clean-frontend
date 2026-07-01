import { useCallback, useEffect, useState } from 'react';
import { Edit2, Trash2, RefreshCw, Download, Search, Plus } from 'lucide-react';
import { useAuth } from '../features/auth/auth-context';
import { Button, Input, Modal, useToast } from '../components/ui';
import { Table, type TableColumn } from '../components/ui/Table';
import { apiRequest } from '../lib/api/client';
import { buildApiUrl } from '../lib/api/env';

interface Category {
  id: number;
  nama: string;
}

export function CategoriesPage() {
  const { activeToken } = useAuth();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(7);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const normalizeCategory = useCallback((item: any): Category => ({
    id: item?.product_category_id ?? item?.productCategoryId ?? item?.id ?? item?.category_id ?? item?.categoryId ?? 0,
    nama: item?.product_category_name ?? item?.productCategoryName ?? item?.name ?? item?.nama ?? '',
  }), []);

  const loadCategories = useCallback(
    async (requestedPage = 1, search = '') => {
      if (!activeToken) {
        setCategories([]);
        setTotal(0);
        setPage(1);
        setPerPage(7);
        setApiError(null);
        return;
      }

      setIsLoading(true);
      setApiError(null);

      try {
        const queryParams = new URLSearchParams({ page: String(requestedPage), search: search.trim() });
        const response = await apiRequest<any>(`/api/product-categories?${queryParams.toString()}`, { token: activeToken });
        const payload = response as any;
        const rawData = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.data?.data)
          ? payload.data.data
          : Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload?.rows)
          ? payload.rows
          : Array.isArray(payload)
          ? payload
          : [];

        const nextItems = rawData.map(normalizeCategory);
        const totalItems = payload?.total_items ?? payload?.pagination?.total ?? payload?.total ?? payload?.meta?.total ?? payload?.data?.total ?? nextItems.length;
        const currentPage = payload?.current_page ?? payload?.pagination?.page ?? payload?.page ?? payload?.meta?.current_page ?? requestedPage;
        const nextPerPage = payload?.per_page ?? payload?.pagination?.per_page ?? payload?.meta?.per_page ?? 7;

        setCategories(nextItems);
        setTotal(Number(totalItems ?? nextItems.length));
        setPage(Number(currentPage ?? requestedPage));
        setPerPage(Number(nextPerPage ?? 7));
      } catch (error) {
        console.error(error);
        setCategories([]);
        setTotal(0);
        setApiError(error instanceof Error ? error.message : 'Gagal memuat data kategori produk.');
      } finally {
        setIsLoading(false);
      }
    },
    [activeToken, normalizeCategory],
  );

  useEffect(() => {
    void loadCategories(page, activeSearch);
  }, [activeSearch, loadCategories, page]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setActiveSearch(searchQuery.trim());
    setPage(1);
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
      if (editingCategory) {
        await apiRequest<any>(`/api/product-categories/${editingCategory.id}`, {
          method: 'PUT',
          token: activeToken,
          body: { name: categoryName, nama: categoryName, product_category_name: categoryName },
        });
        toast.addToast('Kategori produk berhasil diperbarui.', 'success');
      } else {
        await apiRequest<any>(`/api/product-categories`, {
          method: 'POST',
          token: activeToken,
          body: { name: categoryName, nama: categoryName, product_category_name: categoryName },
        });
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

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

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
      await apiRequest<any>(`/api/product-categories/${deleteTarget.id}`, {
        method: 'DELETE',
        token: activeToken,
      });
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

  const downloadFile = async (path: string, defaultName: string) => {
    if (!activeToken) {
      toast.addToast('Token tidak tersedia, login ulang.', 'error');
      return;
    }

    try {
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

  return (
    <div className="units-page">
      <div className="units-page__header">
        <div className="units-page__search-group">
          <form className="units-page__search-form" onSubmit={handleSearchSubmit}>
            <Input
              placeholder="Cari kategori..."
              className="units-page__search-input"
              value={searchQuery}
              onChange={handleSearchInput}
              aria-label="Cari kategori"
            />
            <button className="units-page__search-btn" type="submit">
              <Search size={14} />
              Cari
            </button>
          </form>
          <button
            type="button"
            className="units-page__refresh-btn"
            onClick={handleRefresh}
            title="Refresh"
          >
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
        <Table columns={columns} data={categories} emptyText={isLoading ? 'Memuat data...' : 'Tidak ada kategori produk'} />
      </div>

      <Modal open={modalOpen} onClose={closeCategoryModal} title={editingCategory ? 'Ubah Kategori Produk' : 'Tambah Kategori Produk'} size="sm">
        <form onSubmit={handleCategorySubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Nama kategori"
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value);
                setErrors((prev) => ({ ...prev, nama: '' }));
              }}
              aria-label="Nama kategori"
            />
            {errors.nama && <p className="text-sm text-red-600 mt-1">{errors.nama}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeCategoryModal}>Batal</Button>
            <Button
              type="submit"
              variant="primary"
              className={editingCategory ? 'bg-amber-500 hover:bg-amber-600 text-slate-900' : 'bg-green-600 hover:bg-green-700 text-white'}
            >
              {editingCategory ? 'Simpan' : 'Tambahkan'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={isDeleteConfirmOpen} onClose={closeDeleteConfirm} title="Hapus Kategori Produk" size="sm">
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

      <div className="units-page__pagination">
        <div className="units-page__pagination-info">
          {total === 0 ? 'Tidak ada data' : `Menampilkan ${Math.min((page - 1) * perPage + 1, total)}-${Math.min(page * perPage, total)} dari ${total}`}
        </div>
        <div className="units-page__pagination-controls">
          <button
            className="units-page__pagination-btn"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            ←
          </button>
          <span className="units-page__pagination-number">{page}</span>
          <button
            className="units-page__pagination-btn"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page >= totalPages}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
