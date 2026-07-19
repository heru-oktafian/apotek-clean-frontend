import { useEffect, useState } from 'react';
import { Edit2, Trash2, RefreshCw, Download, Loader2 } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { useProducts } from '../hooks/useProducts';
import {
  createProduct,
  fetchProductCategoriesCombo,
  fetchProductById,
  fetchUnitsCombo,
  downloadProductLabel,
  downloadProductsExcel,
  downloadProductsPDF,
  updateProduct,
  deleteProduct,
} from '../api/products-api';
import { toast, Table, Button, Input, Pagination, Select, FormField, type TableColumn } from '../../../components/ui';
import { ListSearchBar } from '../../../components/list/ListSearchBar';
import { ActionToolbar } from '../../../components/list/ActionToolbar';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { FormModal } from '../../../components/common/FormModal';
import { useListSearch } from '../../../hooks/useListSearch';
import type { Product, ProductDetail, ProductDetailResponse, ProductCategory, Unit } from '../types/products';

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
  // Search
  const { searchInput, handleSearchInputChange, handleSearch, handleReset } = useListSearch({
    onSearch: (_search) => loadProducts(1, _search),
  });
  const activeSearch = searchInput.trim().toLowerCase();

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
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
  const [downloadingLabelIds, setDownloadingLabelIds] = useState<Set<string>>(new Set());
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

  const handleRefresh = () => {
    loadProducts(page, activeSearch);
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

  const openEditProduct = async (product: Product) => {
    if (!activeToken) {
      toast.error('Token tidak tersedia, login ulang.');
      return;
    }
    setEditingProduct(product);
    setIsFetchingDetail(true);
    try {
      const detail = await fetchProductById(activeToken, product.id);
      setFormData({
        sku: detail.sku,
        name: detail.name,
        alias: detail.alias ?? '',
        description: detail.description ?? '',
        ingredient: detail.ingredient ?? '',
        dosage: detail.dosage ?? '',
        side_affection: detail.side_affection ?? '',
        product_category_id: detail.product_category_id,
        unit_id: detail.unit_id,
        purchase_price: detail.purchase_price,
        sales_price: detail.sales_price,
        alternate_price: detail.alternate_price,
        expired_date: detail.expired_date ? detail.expired_date.split('T')[0] : '',
      });
    } catch (error) {
      console.error('Gagal mengambil detail produk:', error);
      toast.error('Gagal mengambil data produk untuk diedit.');
      setEditingProduct(null);
      return;
    } finally {
      setIsFetchingDetail(false);
    }
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
      await deleteProduct(activeToken, deleteTarget.id);
      toast.success('Produk berhasil dihapus.');
      closeDeleteConfirm();
      loadProducts(1, activeSearch);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus produk.');
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
      toast.error('Periksa kembali form produk.');
      return;
    }

    if (!activeToken) {
      toast.error('Token tidak tersedia, login ulang.');
      return;
    }

    try {
      const payload = { ...formData };

      if (editingProduct?.id) {
        await updateProduct(activeToken, editingProduct.id, payload);
        toast.success('Produk berhasil diperbarui.');
      } else {
        await createProduct(activeToken, payload);
        toast.success('Produk berhasil ditambahkan.');
      }

      closeEditProduct();
      loadProducts(1, activeSearch);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan produk.');
    }
  };

  const handleDownloadLabel = async (product: Product) => {
    if (!activeToken) {
      toast.error('Token tidak tersedia, login ulang.');
      return;
    }

    setDownloadingLabelIds((prev) => {
      const next = new Set(prev);
      next.add(product.id);
      return next;
    });
    try {
      await downloadProductLabel(activeToken, product.id, 1);
      toast.success('Label produk berhasil diunduh.');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Gagal mengunduh label produk.');
    } finally {
      setDownloadingLabelIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  const handleDownloadAllPDF = async () => {
    if (!activeToken) {
      toast.error('Token tidak tersedia, login ulang.');
      return;
    }

    setIsDownloadingPDF(true);
    try {
      await downloadProductsPDF(activeToken);
      toast.success('PDF produk berhasil diunduh.');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Gagal mengunduh PDF produk.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleDownloadAllExcel = async () => {
    if (!activeToken) {
      toast.error('Token tidak tersedia, login ulang.');
      return;
    }

    setIsDownloadingExcel(true);
    try {
      await downloadProductsExcel(activeToken);
      toast.success('Excel produk berhasil diunduh.');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Gagal mengunduh Excel produk.');
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
      align: 'center',
      width: '120px',
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
            disabled={downloadingLabelIds.has(row.id)}
            className="inline-flex items-center justify-center p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors disabled:opacity-50"
            title={downloadingLabelIds.has(row.id) ? 'Mengunduh label...' : 'Unduh Label'}
          >
            {downloadingLabelIds.has(row.id) ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
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
    <div className="list-page">
      {/* Header dengan Search */}
      <div className="list-page__header">
        <ListSearchBar
          value={searchInput}
          onChange={handleSearchInputChange}
          onSearch={handleSearch}
          placeholder="Cari produk..."
          disabled={isLoading}
        />
        <div className="list-page__header-actions">
          <button
            className="list-page__refresh-btn"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Toolbar - Tambah dan Download */}
      <ActionToolbar
        addLabel="Tambah"
        onAddClick={openAddProduct}
        showExportExcel
        showExportPdf
        onExportExcel={handleDownloadAllExcel}
        onExportPdf={handleDownloadAllPDF}
        isLoading={isLoading || isDownloadingExcel || isDownloadingPDF}
      />

      {/* Table */}
      <div className="list-page__table-wrapper">
        {isLoading ? (
          <div className="list-page__loading">
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onClose={closeDeleteConfirm}
        onConfirm={handleConfirmDeleteProduct}
        title="Hapus Produk"
        message={<>Yakin ingin menghapus produk <strong>{deleteTarget?.name}</strong>?</>}
        confirmLabel="Hapus"
        isLoading={isDeleting}
      />

      {/* Edit / Add Product Modal */}
      <FormModal
        open={isEditOpen}
        onClose={closeEditProduct}
        title={editingProduct ? 'Ubah Produk' : 'Tambah Produk'}
        size="xl"
        onSubmit={handleProductFormSubmit}
        isSubmitting={isSubmitting}
        footer={
          <>
            <Button type="button" variant="outline" onClick={closeEditProduct} disabled={isSubmitting}>Batal</Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => { void handleProductFormSubmit({ preventDefault: () => {} } as unknown as React.FormEvent); }}
              className={
                editingProduct
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-900'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }
            >
              {isSubmitting ? 'Menyimpan...' : (editingProduct ? 'Simpan' : 'Tambahkan')}
            </Button>
          </>
        }
      >
        {isFetchingDetail ? (
          <div className="flex items-center justify-center py-12 text-slate-500 text-sm">
            Memuat data produk...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <FormField error={formErrors.sku}>
                <Input
                  placeholder="SKU"
                  value={formData.sku}
                  onChange={(e) => {
                    setFormData({ ...formData, sku: e.target.value });
                    if (formErrors.sku) setFormErrors({ ...formErrors, sku: undefined });
                  }}
                  aria-label="SKU"
                />
              </FormField>
              <FormField error={formErrors.name}>
                <Input
                  placeholder="Nama produk"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                  }}
                  aria-label="Nama produk"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField error={formErrors.product_category_id}>
                <Select
                  value={String(formData.product_category_id)}
                  onChange={(e) => {
                    setFormData({ ...formData, product_category_id: Number(e.target.value) });
                    if (formErrors.product_category_id) setFormErrors({ ...formErrors, product_category_id: undefined });
                  }}
                  aria-label="Kategori produk"
                  error={Boolean(formErrors.product_category_id)}
                >
                  <option value="0">Pilih Kategori Produk</option>
                  {productCategories.map((category) => (
                    <option key={category.product_category_id} value={String(category.product_category_id)}>
                      {category.product_category_name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField error={formErrors.unit_id}>
                <Select
                  value={formData.unit_id}
                  onChange={(e) => {
                    setFormData({ ...formData, unit_id: e.target.value });
                    if (formErrors.unit_id) setFormErrors({ ...formErrors, unit_id: undefined });
                  }}
                  aria-label="Satuan produk"
                  error={Boolean(formErrors.unit_id)}
                >
                  <option value="">Pilih Satuan</option>
                  {units.map((unit) => (
                    <option key={unit.unit_id} value={unit.unit_id}>
                      {unit.unit_name}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Alias">
                <Input
                  placeholder="Alias"
                  value={formData.alias}
                  onChange={(e) => {
                    setFormData({ ...formData, alias: e.target.value });
                  }}
                  aria-label="Alias"
                />
              </FormField>
              <FormField label="Expired Date" error={formErrors.expired_date}>
                <Input
                  type="date"
                  value={formData.expired_date}
                  onChange={(e) => setFormData({ ...formData, expired_date: e.target.value })}
                  aria-label="Tanggal kedaluwarsa"
                />
              </FormField>
            </div>

            <FormField>
              <textarea
                placeholder="Deskripsi"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                rows={2}
                aria-label="Deskripsi produk"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField>
                <textarea
                  placeholder="Bahan aktif"
                  value={formData.ingredient}
                  onChange={(e) => setFormData({ ...formData, ingredient: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  rows={2}
                  aria-label="Bahan aktif"
                />
              </FormField>
              <FormField>
                <textarea
                  placeholder="Dosis"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  rows={2}
                  aria-label="Dosis"
                />
              </FormField>
            </div>

            <FormField>
              <textarea
                placeholder="Efek samping"
                value={formData.side_affection}
                onChange={(e) => setFormData({ ...formData, side_affection: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                rows={2}
                aria-label="Efek samping"
              />
            </FormField>

            <div className="grid grid-cols-3 gap-3">
              <FormField label="Beli" error={formErrors.purchase_price}>
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
              </FormField>
              <FormField label="Jual" error={formErrors.sales_price}>
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
              </FormField>
              <FormField label="Harga Alternatif">
                <Input
                  type="number"
                  className="text-right"
                  placeholder="Harga Alternatif"
                  value={String(formData.alternate_price)}
                  onChange={(e) => setFormData({ ...formData, alternate_price: Number(e.target.value) })}
                  aria-label="Harga alternatif"
                />
              </FormField>
            </div>
          </>
        )}
      </FormModal>

      {/* Pagination */}
      <Pagination
        page={page}
        total={total}
        perPage={perPage}
        onPageChange={(p) => loadProducts(p, activeSearch)}
      />
    </div>
  );
}
