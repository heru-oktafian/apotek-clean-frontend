import { useEffect, useState } from 'react';
import { Edit2, Trash2, RefreshCw, Search, Plus } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { useSuppliers } from '../hooks/useSuppliers';
import { fetchSupplierCategories, createSupplier, updateSupplier, deleteSupplier } from '../api/suppliers-api';
import { useToast, Table, Modal, Button, Input, Pagination, type TableColumn } from '../../../components/ui';
import type { Supplier } from '../types/suppliers';
import type { SupplierCategory } from '../types/supplier-categories';

interface SupplierWithIndex extends Supplier {
  _index?: number;
}

interface SupplierFormData {
  name: string;
  phone: string;
  address: string;
  supplier_category_id: number;
  pic?: string;
}

export function SuppliersPage() {
  const { activeToken } = useAuth();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [supplierCategories, setSupplierCategories] = useState<SupplierCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    phone: '',
    address: '',
    supplier_category_id: 0,
    pic: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<SupplierFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const { suppliers, total, page, perPage, isLoading, loadSuppliers } = useSuppliers(activeToken || '');

  const handlePageChange = (nextPage: number) => {
    loadSuppliers(nextPage, activeSearch);
  };

  // Load supplier categories for modal form
  useEffect(() => {
    if (!activeToken) return;

    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await fetchSupplierCategories(activeToken, {});
        const payload = response as any;
        
        // Handle different response formats
        let rawData = [];
        if (Array.isArray(payload)) {
          // Response is array directly
          rawData = payload;
        } else if (Array.isArray(payload?.data)) {
          // Response is { data: [...] }
          rawData = payload.data;
        }
        
        // Normalize field names to match SupplierCategory interface
        const categories = rawData.map((cat: any) => ({
          id: cat.id ?? cat.supplier_category_id ?? cat.supplierCategoryId ?? 0,
          nama: cat.nama ?? cat.name ?? cat.supplier_category_name ?? '',
          branchId: cat.branchId ?? cat.branch_id ?? undefined,
        }));
        
        console.log('Supplier categories loaded:', categories, 'from response:', payload);
        setSupplierCategories(categories);
      } catch (err) {
        console.error('Error loading supplier categories:', err);
        setSupplierCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, [activeToken]);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    const normalized = value.trim();
    if (!normalized) {
      setActiveSearch('');
      loadSuppliers(1, '');
      return;
    }

    if (normalized.length >= 3) {
      setActiveSearch(normalized);
      loadSuppliers(1, normalized);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const normalized = searchQuery.trim();
    setActiveSearch(normalized);
    loadSuppliers(1, normalized);
  };

  const handleRefresh = () => {
    loadSuppliers(page, activeSearch);
  };

  // CRUD Handlers
  const openAddSupplier = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      phone: '',
      address: '',
      supplier_category_id: 0,
      pic: '',
    });
    setFormErrors({});
    setIsAddOpen(true);
  };

  const openEditSupplier = (supplier: Supplier) => {
    console.log('Opening edit supplier:', supplier);
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      address: supplier.address,
      supplier_category_id: supplier.supplier_category_id || supplierCategories.find((cat) => cat.nama === supplier.supplier_category)?.id || 0,
      pic: supplier.pic ?? '',
    });
    setFormErrors({});
    setIsAddOpen(true);
  };

  const closeAddSupplier = () => {
    setIsAddOpen(false);
    setEditingSupplier(null);
    setFormData({
      name: '',
      phone: '',
      address: '',
      supplier_category_id: 0,
      pic: '',
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Partial<SupplierFormData> = {};

    if (!formData.name.trim()) {
      errors.name = 'Nama supplier wajib diisi' as any;
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Nomor telepon wajib diisi' as any;
    }
    if (!formData.address.trim()) {
      errors.address = 'Alamat wajib diisi' as any;
    }
    if (!formData.supplier_category_id) {
      errors.supplier_category_id = 'Kategori supplier wajib dipilih' as any;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.addToast('Periksa kembali form Anda.', 'error');
      return;
    }

    if (!activeToken) {
      toast.addToast('Token tidak tersedia, login ulang.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingSupplier?.id) {
        await updateSupplier(activeToken, editingSupplier.id, formData);
        toast.addToast('Supplier berhasil diperbarui.', 'success');
      } else {
        await createSupplier(activeToken, formData);
        toast.addToast('Supplier berhasil ditambahkan.', 'success');
      }

      closeAddSupplier();
      loadSuppliers(1, activeSearch);
    } catch (error) {
      console.error(error);
      toast.addToast('Gagal menyimpan supplier. Coba lagi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteConfirm = (supplier: Supplier) => {
    setDeleteTarget(supplier);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteTarget(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleConfirmDeleteSupplier = async () => {
    if (!deleteTarget?.id || !activeToken) return;

    try {
      await deleteSupplier(activeToken, deleteTarget.id);
      toast.addToast('Supplier berhasil dihapus.', 'success');
      closeDeleteConfirm();
      loadSuppliers(1, activeSearch);
    } catch (error) {
      console.error(error);
      toast.addToast('Gagal menghapus supplier.', 'error');
    }
  };

  const columns: TableColumn<SupplierWithIndex>[] = [
    {
      key: 'no',
      header: 'No',
      render: (row) => {
        const index = row._index ?? 0;
        return index + 1 + (page - 1) * perPage;
      },
    },
    {
      key: 'id',
      header: 'ID',
      render: (row) => row.id,
    },
    {
      key: 'name',
      header: 'Nama',
      render: (row) => row.name,
      align: 'left',
    },
    {
      key: 'phone',
      header: 'Nomor Telepon',
      render: (row) => row.phone,
    },
    {
      key: 'address',
      header: 'Alamat',
      render: (row) => row.address,
      align: 'left',
    },
    {
      key: 'supplier_category',
      header: 'Kategori Supplier',
      render: (row) => row.supplier_category,
      align: 'left',
    },
    {
      key: 'pic',
      header: 'PIC',
      render: (row) => row.pic || '-',
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (row) => (
        <div className="flex gap-1 justify-center">
          <button
            type="button"
            onClick={() => openEditSupplier(row)}
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

  const startItem = total === 0 ? 0 : (page - 1) * perPage + 1;
  const endItem = total === 0 ? 0 : Math.min(page * perPage, total);

  const dataWithIndex: SupplierWithIndex[] = suppliers.map((supplier, index) => ({
    ...supplier,
    _index: index,
  }));

  return (
    <div className="suppliers-page">
      {/* Header dengan Search, Category Filter, dan Refresh */}
      <div className="suppliers-page__header">
        <div className="suppliers-page__search-group">
          <form className="suppliers-page__search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Cari..."
              className="suppliers-page__search-input"
              value={searchQuery}
              onChange={handleSearchInput}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
            />
            <button
              className="suppliers-page__search-btn"
              type="submit"
              disabled={isLoading}
              title="Cari"
            >
              <Search size={14} />
              Cari
            </button>
          </form>
          <button
            className="suppliers-page__refresh-btn"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Toolbar - Tombol Tambah */}
      <div className="suppliers-page__toolbar">
        <button className="suppliers-page__btn-tambah" onClick={openAddSupplier}>
          Tambah +
        </button>
      </div>

      {/* Table */}
      <div className="suppliers-page__table-wrapper">
        {isLoading ? (
          <div className="suppliers-page__loading">
            Memuat data...
          </div>
        ) : (
          <Table<SupplierWithIndex>
            columns={columns}
            data={dataWithIndex}
            emptyText="Tidak ada data supplier"
          />
        )}
      </div>

      {/* Add/Edit Supplier Modal */}
      <Modal
        open={isAddOpen}
        onClose={closeAddSupplier}
        title={editingSupplier ? 'Ubah Supplier' : 'Tambah Supplier'}
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Nama supplier"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
              }}
              aria-label="Nama supplier"
            />
            {formErrors.name && <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <Input
              placeholder="Nomor telepon"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                if (formErrors.phone) setFormErrors({ ...formErrors, phone: undefined });
              }}
              aria-label="Nomor telepon"
            />
            {formErrors.phone && <p className="text-sm text-red-600 mt-1">{formErrors.phone}</p>}
          </div>

          <div>
            <textarea
              placeholder="Alamat"
              value={formData.address}
              onChange={(e) => {
                setFormData({ ...formData, address: e.target.value });
                if (formErrors.address) setFormErrors({ ...formErrors, address: undefined });
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              rows={3}
              aria-label="Alamat"
            />
            {formErrors.address && <p className="text-sm text-red-600 mt-1">{formErrors.address}</p>}
          </div>

          <div>
            <select
              value={String(formData.supplier_category_id)}
              onChange={(e) => {
                setFormData({ ...formData, supplier_category_id: Number(e.target.value) });
                if (formErrors.supplier_category_id) setFormErrors({ ...formErrors, supplier_category_id: undefined });
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Kategori supplier"
            >
              <option value="0">Pilih Kategori Supplier</option>
              {supplierCategories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.nama}
                </option>
              ))}
            </select>
            {formErrors.supplier_category_id && <p className="text-sm text-red-600 mt-1">{formErrors.supplier_category_id}</p>}
          </div>

          <div>
            <Input
              placeholder="Nama PIC"
              value={formData.pic ?? ''}
              onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
              aria-label="Nama PIC"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeAddSupplier}>Batal</Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className={editingSupplier ? 'bg-amber-500 hover:bg-amber-600 text-slate-900' : 'bg-green-600 hover:bg-green-700 text-white'}
            >
              {isSubmitting ? 'Memproses...' : editingSupplier ? 'Simpan' : 'Tambahkan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleteConfirmOpen}
        onClose={closeDeleteConfirm}
        title="Hapus Supplier"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Yakin ingin menghapus supplier <strong>{deleteTarget?.name}</strong>?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeDeleteConfirm}>Batal</Button>
            <Button type="button" variant="danger" onClick={handleConfirmDeleteSupplier}>Hapus</Button>
          </div>
        </div>
      </Modal>

      <Pagination
        page={page}
        total={total}
        perPage={perPage}
        onPageChange={handlePageChange}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
