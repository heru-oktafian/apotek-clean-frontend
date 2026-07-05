import { useEffect, useState } from 'react';
import { Edit2, Trash2, RefreshCw, Search, Plus, Download } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { useProducts } from '../hooks/useProducts';
import { downloadProductLabel, downloadProductsPDF, downloadProductsExcel } from '../api/products-api';
import { useToast, Table, Modal, Button, Input, type TableColumn } from '../../../components/ui';
import type { Product } from '../types/products';

interface ProductWithIndex extends Product {
  _index?: number;
}

export function ProductsPage() {
  const { activeToken } = useAuth();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  
  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Download states
  const [isDownloadingLabel, setIsDownloadingLabel] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);

  const { products, total, page, perPage, isLoading, loadProducts } = useProducts();
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const [pageInput, setPageInput] = useState(String(page));

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]*$/.test(value)) {
      setPageInput(value);
    }
  };

  const commitPageInput = () => {
    if (!pageInput) {
      setPageInput(String(page));
      return;
    }

    const requestedPage = Number(pageInput);
    if (Number.isNaN(requestedPage)) {
      setPageInput(String(page));
      return;
    }

    const nextPage = Math.min(Math.max(requestedPage, 1), totalPages);
    if (nextPage !== page) {
      loadProducts(nextPage, activeSearch);
    } else {
      setPageInput(String(page));
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitPageInput();
    }
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    const normalized = value.trim();
    if (!normalized) {
      setActiveSearch('');
      loadProducts(1, '');
      return;
    }

    if (normalized.length >= 3) {
      setActiveSearch(normalized);
      loadProducts(1, normalized);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const normalized = searchQuery.trim();
    setActiveSearch(normalized);
    loadProducts(1, normalized);
  };

  const handleRefresh = () => {
    loadProducts(page, activeSearch);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      loadProducts(page - 1, activeSearch);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      loadProducts(page + 1, activeSearch);
    }
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditOpen(true);
  };

  const closeEditProduct = () => {
    setEditingProduct(null);
    setIsEditOpen(false);
  };

  const openDeleteConfirm = (product: Product) => {
    setDeleteTarget(product);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteTarget(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleConfirmDeleteProduct = async () => {
    if (!deleteTarget?.id || !activeToken) return;

    setIsDeleting(true);
    try {
      // TODO: Implement delete endpoint when available
      toast.addToast('Fitur hapus produk akan diimplementasikan.', 'info');
      closeDeleteConfirm();
      loadProducts(1, activeSearch);
    } catch (error) {
      console.error(error);
      toast.addToast('Gagal menghapus produk.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadLabel = async (product: Product) => {
    if (!activeToken) {
      toast.addToast('Token tidak tersedia, login ulang.', 'error');
      return;
    }

    setIsDownloadingLabel(true);
    try {
      await downloadProductLabel(activeToken, product.id, 1);
      toast.addToast('Label produk berhasil diunduh.', 'success');
    } catch (error) {
      console.error(error);
      toast.addToast(error instanceof Error ? error.message : 'Gagal mengunduh label produk.', 'error');
    } finally {
      setIsDownloadingLabel(false);
    }
  };

  const handleDownloadAllPDF = async () => {
    if (!activeToken) {
      toast.addToast('Token tidak tersedia, login ulang.', 'error');
      return;
    }

    setIsDownloadingPDF(true);
    try {
      await downloadProductsPDF(activeToken);
      toast.addToast('PDF produk berhasil diunduh.', 'success');
    } catch (error) {
      console.error(error);
      toast.addToast(error instanceof Error ? error.message : 'Gagal mengunduh PDF produk.', 'error');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleDownloadAllExcel = async () => {
    if (!activeToken) {
      toast.addToast('Token tidak tersedia, login ulang.', 'error');
      return;
    }

    setIsDownloadingExcel(true);
    try {
      await downloadProductsExcel(activeToken);
      toast.addToast('Excel produk berhasil diunduh.', 'success');
    } catch (error) {
      console.error(error);
      toast.addToast(error instanceof Error ? error.message : 'Gagal mengunduh Excel produk.', 'error');
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const columns: TableColumn<ProductWithIndex>[] = [
    {
      key: 'no',
      header: 'No',
      render: (row) => {
        const index = row._index ?? 0;
        return index + 1 + (page - 1) * perPage;
      },
    },
    {
      key: 'sku',
      header: 'SKU',
      render: (row) => row.sku,
    },
    {
      key: 'name',
      header: 'Nama',
      render: (row) => row.name,
    },
    {
      key: 'product_category_name',
      header: 'Kategori',
      render: (row) => row.product_category_name,
    },
    {
      key: 'unit_name',
      header: 'Satuan',
      render: (row) => row.unit_name,
    },
    {
      key: 'stock',
      header: 'Stok',
      render: (row) => row.stock,
    },
    {
      key: 'purchase_price',
      header: 'Harga Beli',
      render: (row) => formatCurrency(row.purchase_price),
    },
    {
      key: 'sales_price',
      header: 'Harga Jual',
      render: (row) => formatCurrency(row.sales_price),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (row) => (
        <div className="flex gap-1 justify-center">
          <button
            type="button"
            onClick={() => openEditProduct(row)}
            className="inline-flex items-center justify-center p-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded transition-colors"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleDownloadLabel(row)}
            disabled={isDownloadingLabel}
            className="inline-flex items-center justify-center p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors disabled:opacity-50"
            title="Unduh Label"
          >
            <Download size={14} />
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

  const startItem = total === 0 ? 0 : (page - 1) * perPage + 1;
  const endItem = total === 0 ? 0 : Math.min(page * perPage, total);

  const dataWithIndex: ProductWithIndex[] = products.map((product: Product, index: number) => ({
    ...product,
    _index: index,
  }));

  return (
    <div className="products-page">
      {/* Header dengan Search */}
      <div className="products-page__header">
        <div className="products-page__search-group">
          <form className="products-page__search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Cari..."
              className="products-page__search-input"
              value={searchQuery}
              onChange={handleSearchInput}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
            />
            <button
              className="products-page__search-btn"
              type="submit"
              disabled={isLoading}
              title="Cari"
            >
              <Search size={14} />
              Cari
            </button>
          </form>
        </div>
        <div className="products-page__header-actions">
          <button
            className="products-page__refresh-btn"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Toolbar - Tambah dan Download */}
      <div className="products-page__toolbar">
        <button className="products-page__btn-tambah" onClick={() => {}} >
          Tambah +
        </button>
        <div className="products-page__toolbar-downloads">
          <button
            className="products-page__download-btn products-page__download-btn--excel"
            onClick={handleDownloadAllExcel}
            disabled={isDownloadingExcel || isLoading}
            title="Download Excel"
          >
            <Download size={14} />
            Excel
          </button>
          <button
            className="products-page__download-btn products-page__download-btn--pdf"
            onClick={handleDownloadAllPDF}
            disabled={isDownloadingPDF || isLoading}
            title="Download PDF"
          >
            <Download size={14} />
            PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="products-page__table-wrapper">
        {isLoading ? (
          <div className="products-page__loading">
            Memuat data...
          </div>
        ) : (
          <Table<ProductWithIndex>
            columns={columns}
            data={dataWithIndex}
            emptyText="Tidak ada data produk"
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleteConfirmOpen}
        onClose={closeDeleteConfirm}
        title="Hapus Produk"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Yakin ingin menghapus produk <strong>{deleteTarget?.name}</strong>?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeDeleteConfirm}>Batal</Button>
            <Button type="button" variant="danger" onClick={handleConfirmDeleteProduct} disabled={isDeleting}>
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        open={isEditOpen}
        onClose={closeEditProduct}
        title="Edit Produk"
        size="md"
      >
        <div className="space-y-4">
          {editingProduct && (
            <>
              <div>
                <p className="text-sm font-medium text-slate-700">SKU</p>
                <p className="text-slate-900">{editingProduct.sku}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Nama</p>
                <p className="text-slate-900">{editingProduct.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Kategori</p>
                <p className="text-slate-900">{editingProduct.product_category_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Satuan</p>
                <p className="text-slate-900">{editingProduct.unit_name}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-700">Harga Beli</p>
                  <p className="text-slate-900">{formatCurrency(editingProduct.purchase_price)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Harga Jual</p>
                  <p className="text-slate-900">{formatCurrency(editingProduct.sales_price)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Stok</p>
                  <p className="text-slate-900">{editingProduct.stock}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeEditProduct}>Tutup</Button>
                <Button type="button">Ubah</Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Pagination */}
      <div className="products-page__pagination">
        <div className="products-page__pagination-info">
          {total === 0 ? 'Tidak ada data' : `Menampilkan ${startItem}-${endItem} dari ${total}`}
        </div>
        <div className="products-page__pagination-controls">
          <button
            className="products-page__pagination-btn"
            onClick={handlePreviousPage}
            disabled={page === 1}
          >
            ←
          </button>
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={pageInput}
            onChange={handlePageInputChange}
            onBlur={commitPageInput}
            onKeyDown={handlePageInputKeyDown}
            className="products-page__pagination-input"
            aria-label="Halaman"
          />
          <button
            className="products-page__pagination-btn"
            onClick={handleNextPage}
            disabled={page >= totalPages}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
