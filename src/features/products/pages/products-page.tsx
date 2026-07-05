import { useEffect, useState } from 'react';
import { Edit2, Trash2, RefreshCw, Search, Plus, Download } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { useProducts } from '../hooks/useProducts';
import {
  createProduct,
  fetchProductCategoriesCombo,
  fetchUnitsCombo,
  downloadProductLabel,
  downloadProductsExcel,
  downloadProductsPDF,
  updateProduct,
} from '../api/products-api';
import { useToast, Table, Modal, Button, Input, type TableColumn } from '../../../components/ui';
import type { Product, ProductCategory, Unit } from '../types/products';

interface ProductWithIndex extends Product {
  _index?: number;
}

interface ProductFormData {
  sku: string;
  name: string;
  alias: string;
  description: string;
  ingredient: string;
  dosage: string;
  side_affection: string;
  product_category_id: number;
  unit_id: string;
  purchase_price: number;
  sales_price: number;
  alternate_price: number;
  expired_date: string;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    sku: '',
    name: '',
    alias: '',
    description: '',
    ingredient: '',
    dosage: '',
    side_affection: '',
    product_category_id: 0,
    unit_id: '',
    purchase_price: 0,
    sales_price: 0,
    alternate_price: 0,
    expired_date: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  // Download states
  const [isDownloadingLabel, setIsDownloadingLabel] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);

  const { products, total, page, perPage, isLoading, loadProducts } = useProducts();
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const [pageInput, setPageInput] = useState(String(page));

  useEffect(() => {
    if (!activeToken) return;

    const loadCombos = async () => {
      try {
        const [categoriesResponse, unitsResponse] = await Promise.all([
          fetchProductCategoriesCombo(activeToken, {}),
          fetchUnitsCombo(activeToken, {}),
        ]);

        setProductCategories(categoriesResponse.data || []);
        setUnits(unitsResponse.data || []);
      } catch (error) {
        console.error('Failed to load product combos:', error);
        setProductCategories([]);
        setUnits([]);
      }
    };

    void loadCombos();
  }, [activeToken]);

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

  const resetForm = () => {
    setFormData({
      sku: '',
      name: '',
      alias: '',
      description: '',
      ingredient: '',
      dosage: '',
      side_affection: '',
      product_category_id: 0,
      unit_id: '',
      purchase_price: 0,
      sales_price: 0,
      alternate_price: 0,
      expired_date: '',
    });
    setFormErrors({});
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    resetForm();
    setIsEditOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      alias: product.alias ?? '',
      description: product.description ?? '',
      ingredient: product.ingredient ?? '',
      dosage: product.dosage ?? '',
      side_affection: product.side_affection ?? '',
      product_category_id: product.product_category_id,
      unit_id: product.unit_id,
      purchase_price: product.purchase_price,
      sales_price: product.sales_price,
      alternate_price: product.alternate_price,
      expired_date: product.expired_date ? product.expired_date.split('T')[0] : '',
    });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const closeEditProduct = () => {
    setEditingProduct(null);
    setIsEditOpen(false);
    resetForm();
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

  const validateForm = () => {
    const errors: Partial<Record<keyof ProductFormData, string>> = {};

    if (!formData.sku.trim()) errors.sku = 'SKU wajib diisi';
    if (!formData.name.trim()) errors.name = 'Nama produk wajib diisi';
    if (!formData.product_category_id) errors.product_category_id = 'Kategori wajib dipilih';
    if (!formData.unit_id.trim()) errors.unit_id = 'Satuan wajib dipilih';
    if (formData.purchase_price <= 0) errors.purchase_price = 'Harga beli harus lebih besar dari 0';
    if (formData.sales_price <= 0) errors.sales_price = 'Harga jual harus lebih besar dari 0';
    if (formData.expired_date && isNaN(Date.parse(formData.expired_date))) errors.expired_date = 'Tanggal kedaluwarsa tidak valid';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProductFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.addToast('Periksa kembali form produk.', 'error');
      return;
    }

    if (!activeToken) {
      toast.addToast('Token tidak tersedia, login ulang.', 'error');
      return;
    }

    try {
      const payload = { ...formData };

      if (editingProduct?.id) {
        await updateProduct(activeToken, editingProduct.id, payload);
        toast.addToast('Produk berhasil diperbarui.', 'success');
      } else {
        await createProduct(activeToken, payload);
        toast.addToast('Produk berhasil ditambahkan.', 'success');
      }

      closeEditProduct();
      loadProducts(1, activeSearch);
    } catch (error) {
      console.error(error);
      toast.addToast(error instanceof Error ? error.message : 'Gagal menyimpan produk.', 'error');
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
      align: 'left',
    },
    {
      key: 'alias',
      header: 'Alias',
      render: (row) => row.alias || '-',
      align: 'left',
    },
    {
      key: 'product_category_name',
      header: 'Kategori',
      render: (row) => row.product_category_name,
      align: 'left',
    },
    {
      key: 'unit_name',
      header: 'Satuan',
      render: (row) => row.unit_name,
      align: 'left',
    },
    {
      key: 'stock',
      header: 'Stok',
      render: (row) => row.stock,
      align: 'right',
    },
    {
      key: 'expired_date',
      header: 'Kadaluwarsa',
      render: (row) => row.expired_date ? new Date(row.expired_date).toLocaleDateString('id-ID') : '-',
      align: 'center',
    },
    {
      key: 'purchase_price',
      header: 'Harga Beli',
      render: (row) => formatCurrency(row.purchase_price),
      align: 'right',
    },
    {
      key: 'sales_price',
      header: 'Harga Jual',
      render: (row) => formatCurrency(row.sales_price),
      align: 'right',
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
        <button className="products-page__btn-tambah" onClick={openAddProduct}>
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
        title={editingProduct ? 'Ubah Produk' : 'Tambah Produk'}
        size="xl"
      >
        <form onSubmit={handleProductFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                placeholder="SKU"
                value={formData.sku}
                onChange={(e) => {
                  setFormData({ ...formData, sku: e.target.value });
                  if (formErrors.sku) setFormErrors({ ...formErrors, sku: undefined });
                }}
                aria-label="SKU"
              />
              {formErrors.sku && <p className="text-sm text-red-600 mt-1">{formErrors.sku}</p>}
            </div>
            <div>
              <Input
                placeholder="Nama produk"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                }}
                aria-label="Nama produk"
              />
              {formErrors.name && <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <select
                value={String(formData.product_category_id)}
                onChange={(e) => {
                  setFormData({ ...formData, product_category_id: Number(e.target.value) });
                  if (formErrors.product_category_id) setFormErrors({ ...formErrors, product_category_id: undefined });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Kategori produk"
              >
                <option value="0">Pilih Kategori Produk</option>
                {productCategories.map((category) => (
                  <option key={category.product_category_id} value={String(category.product_category_id)}>
                    {category.product_category_name}
                  </option>
                ))}
              </select>
              {formErrors.product_category_id && <p className="text-sm text-red-600 mt-1">{formErrors.product_category_id}</p>}
            </div>
            <div>
              <select
                value={formData.unit_id}
                onChange={(e) => {
                  setFormData({ ...formData, unit_id: e.target.value });
                  if (formErrors.unit_id) setFormErrors({ ...formErrors, unit_id: undefined });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Satuan produk"
              >
                <option value="">Pilih Satuan</option>
                {units.map((unit) => (
                  <option key={unit.unit_id} value={unit.unit_id}>
                    {unit.unit_name}
                  </option>
                ))}
              </select>
              {formErrors.unit_id && <p className="text-sm text-red-600 mt-1">{formErrors.unit_id}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-left text-xs text-slate-600 mb-1">Alias</label>
              <Input
                placeholder="Alias"
                value={formData.alias}
                onChange={(e) => {
                  setFormData({ ...formData, alias: e.target.value });
                }}
                aria-label="Alias"
              />
            </div>
            <div>
              <label className="block text-left text-xs text-slate-600 mb-1">Expired Date</label>
              <Input
                type="date"
                value={formData.expired_date}
                onChange={(e) => setFormData({ ...formData, expired_date: e.target.value })}
                aria-label="Tanggal kedaluwarsa"
              />
              {formErrors.expired_date && <p className="text-sm text-red-600 mt-1">{formErrors.expired_date}</p>}
            </div>
          </div>

          <div>
            <textarea
              placeholder="Deskripsi"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              rows={2}
              aria-label="Deskripsi produk"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <textarea
              placeholder="Bahan aktif"
              value={formData.ingredient}
              onChange={(e) => setFormData({ ...formData, ingredient: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              rows={2}
              aria-label="Bahan aktif"
            />
            <textarea
              placeholder="Dosis"
              value={formData.dosage}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              rows={2}
              aria-label="Dosis"
            />
          </div>

          <div>
            <textarea
              placeholder="Efek samping"
              value={formData.side_affection}
              onChange={(e) => setFormData({ ...formData, side_affection: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              rows={2}
              aria-label="Efek samping"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-left text-xs text-slate-600 mb-1">Beli</label>
              <Input
                type="number"
                className="text-right"
                placeholder="Beli"
                value={String(formData.purchase_price)}
                onChange={(e) => {
                  setFormData({ ...formData, purchase_price: Number(e.target.value) });
                  if (formErrors.purchase_price) setFormErrors({ ...formErrors, purchase_price: undefined });
                }}
                aria-label="Harga beli"
              />
              {formErrors.purchase_price && <p className="text-sm text-red-600 mt-1">{formErrors.purchase_price}</p>}
            </div>
            <div>
              <label className="block text-left text-xs text-slate-600 mb-1">Jual</label>
              <Input
                type="number"
                className="text-right"
                placeholder="Jual"
                value={String(formData.sales_price)}
                onChange={(e) => {
                  setFormData({ ...formData, sales_price: Number(e.target.value) });
                  if (formErrors.sales_price) setFormErrors({ ...formErrors, sales_price: undefined });
                }}
                aria-label="Harga jual"
              />
              {formErrors.sales_price && <p className="text-sm text-red-600 mt-1">{formErrors.sales_price}</p>}
            </div>
            <div>
              <label className="block text-left text-xs text-slate-600 mb-1">Harga Alternatif</label>
              <Input
                type="number"
                className="text-right"
                placeholder="Harga Alternatif"
                value={String(formData.alternate_price)}
                onChange={(e) => setFormData({ ...formData, alternate_price: Number(e.target.value) })}
                aria-label="Harga alternatif"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeEditProduct}>Batal</Button>
            <Button
              type="submit"
              variant="primary"
              className={editingProduct ? 'bg-amber-500 hover:bg-amber-600 text-slate-900' : 'bg-green-600 hover:bg-green-700 text-white'}
            >
              {editingProduct ? 'Simpan' : 'Tambahkan'}
            </Button>
          </div>
        </form>
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
