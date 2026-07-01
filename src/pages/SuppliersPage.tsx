import { useCallback, useEffect, useState } from 'react';
import { Edit2, Trash2, RefreshCw, Download, Search, Plus } from 'lucide-react';
import { useAuth } from '../features/auth/auth-context';
import { Button, Input, Modal, useToast } from '../components/ui';
import { Table, type TableColumn } from '../components/ui/Table';
import { apiRequest } from '../lib/api/client';
import { buildApiUrl } from '../lib/api/env';

interface SupplierCategory {
  id: number;
  nama: string;
  branchId: string;
}

export function SuppliersPage() {
  const { activeToken } = useAuth();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SupplierCategory | null>(null);
  const [nama, setNama] = useState('');
  const [branchId, setBranchId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<SupplierCategory[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(7);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const normalizeSupplierCategory = useCallback((item: any): SupplierCategory => ({
    id: item?.id ?? item?.Id ?? item?.supplier_category_id ?? item?.supplierCategoryId ?? 0,
    nama: item?.nama ?? item?.name ?? item?.supplier_category_name ?? '',
    branchId: item?.branch_id ?? item?.branchId ?? '',
  }), []);

  const loadSupplierCategories = useCallback(
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
        const response = await apiRequest<any>(`/api/supplier-categories?${queryParams.toString()}`, { token: activeToken });
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

        const nextItems = rawData.map(normalizeSupplierCategory);
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
        setApiError(error instanceof Error ? error.message : 'Gagal memuat data kategori supplier.');
      } finally {
        setIsLoading(false);
      }
    },
    [activeToken, normalizeSupplierCategory],
  );

  useEffect(() => {
    void loadSupplierCategories(page, activeSearch);
  }, [activeSearch, loadSupplierCategories, page]);

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
    setNama('');
    setBranchId('');
    setErrors({});
    setModalOpen(true);
  };

  const openEditCategory = (category: SupplierCategory) => {
    setEditingCategory(category);
    setNama(category.nama);
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
      const body = { name: nama, nama, branch_id: branchId, branchId };

      if (editingCategory) {
        await apiRequest<any>(`/api/supplier-categories/${editingCategory.id}`, {
          method: 'PUT',
          token: activeToken,
          body,
        });
        toast.addToast('Kategori supplier berhasil diperbarui.', 'success');
      } else {
        await apiRequest<any>(`/api/supplier-categories`, {
          method: 'POST',
          token: activeToken,
          body,
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

  const [deleteTarget, setDeleteTarget] = useState<SupplierCategory | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const openDeleteConfirm = (category: SupplierCategory) => {
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
      await apiRequest<any>(`/api/supplier-categories/${deleteTarget.id}`, {
        method: 'DELETE',
        token: activeToken,
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
              placeholder="Cari kategori supplier..."
              className="units-page__search-input"
              value={searchQuery}
              onChange={handleSearchInput}
              aria-label="Cari kategori supplier"
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
        <Table columns={columns} data={categories} emptyText={isLoading ? 'Memuat data...' : 'Tidak ada kategori supplier'} />
      </div>

      <Modal open={modalOpen} onClose={closeCategoryModal} title={editingCategory ? 'Ubah Kategori Supplier' : 'Tambah Kategori Supplier'} size="sm">
        <form onSubmit={handleCategorySubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Nama kategori"
              value={nama}
              onChange={(e) => {
                setNama(e.target.value);
                setErrors((prev) => ({ ...prev, nama: '' }));
              }}
              aria-label="Nama kategori supplier"
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

      <Modal open={isDeleteConfirmOpen} onClose={closeDeleteConfirm} title="Hapus Kategori Supplier" size="sm">
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
