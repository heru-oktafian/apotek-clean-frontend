import { useState } from 'react';
import { Edit2, Trash2, Plus, Download } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { useToast, Input, Select } from '../../../components/ui';
import { buildApiUrl } from '../../../lib/api/env';
import { useSuppliers } from '../hooks/useSuppliers';
import { useSupplierCategories } from '../hooks/useSupplierCategories';
import { FormField } from '../../../components/ui';
import { createSupplier, updateSupplier, deleteSupplier } from '../api/suppliers-api';
import { ListTablePage, type Column, formatCurrency } from '../../../components/ListTablePage';
import { FormModal } from '../../../components/common/FormModal';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';

interface SupplierRow {
  _index: number;
  id: number;
  name: string;
  phone?: string;
  address?: string;
  supplier_category?: string;
  supplier_category_id?: number;
}

interface SupplierFormData {
  name: string;
  phone: string;
  address: string;
  categoryId: string;
}

const initialForm: SupplierFormData = { name: '', phone: '', address: '', categoryId: '' };

export function SuppliersPage() {
  const { activeToken } = useAuth();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { suppliers, total, perPage, isLoading, loadSuppliers } = useSuppliers(activeToken || '');
  const { categories } = useSupplierCategories(activeToken || '');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierRow | null>(null);
  const [form, setForm] = useState<SupplierFormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<SupplierRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const setField = (field: keyof SupplierFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  // ── Load ────────────────────────────────────────
  const handleSearch = (s: string) => {
    setSearch(s);
    setPage(1);
    loadSuppliers(1, s);
  };

  // ── Add / Edit ─────────────────────────────────
  const openAdd = () => {
    setEditingSupplier(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (sup: SupplierRow) => {
    setEditingSupplier(sup);
    setForm({
      name: sup.name,
      phone: sup.phone ?? '',
      address: sup.address ?? '',
      categoryId: String(sup.supplier_category_id ?? ''),
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.addToast('Nama supplier wajib diisi.', 'error');
      return;
    }
    if (!activeToken) {
      toast.addToast('Token tidak tersedia, login ulang.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const body = {
        name: form.name,
        phone: form.phone,
        address: form.address,
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      };
      if (editingSupplier?.id) {
        await updateSupplier(activeToken, editingSupplier.id, body);
        toast.addToast('Supplier berhasil diperbarui.', 'success');
      } else {
        await createSupplier(activeToken, body);
        toast.addToast('Supplier berhasil ditambahkan.', 'success');
      }
      setModalOpen(false);
      loadSuppliers(page, search);
    } catch {
      toast.addToast('Gagal menyimpan supplier.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ──────────────────────────────────────
  const handleDelete = (sup: SupplierRow) => setDeleteTarget(sup);
  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id || !activeToken) return;
    setIsDeleting(true);
    try {
      await deleteSupplier(activeToken, deleteTarget.id);
      toast.addToast('Supplier berhasil dihapus.', 'success');
      setDeleteTarget(null);
      loadSuppliers(page, search);
    } catch {
      toast.addToast('Gagal menghapus supplier.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Download ────────────────────────────────────
  const downloadFile = async (path: string, defaultName: string) => {
    if (!activeToken) { toast.addToast('Token tidak tersedia.', 'error'); return; }
    try {
      const res = await fetch(buildApiUrl(path), {
        headers: { Authorization: `Bearer ${activeToken}`, Accept: '*/*' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = defaultName;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      toast.addToast('Gagal mengunduh file.', 'error');
    }
  };

  // ── Columns ────────────────────────────────────
  const dataWithIndex: SupplierRow[] = suppliers.map((s, i) => ({ ...s, _index: i }));
  const columns: Column<SupplierRow>[] = [
    {
      key: 'no',
      header: 'No',
      align: 'center',
      width: '60px',
      render: (_, row) => (row._index ?? 0) + 1 + (page - 1) * perPage,
    },
    { key: 'name', header: 'Nama Supplier' },
    { key: 'phone', header: 'Telepon' },
    { key: 'address', header: 'Alamat' },
    { key: 'supplier_category', header: 'Kategori' },
    {
      key: 'actions', header: 'Aksi', align: 'center', width: '120px',
      render: (_, row) => (
        <div className="flex justify-center gap-2">
          <button onClick={() => openEdit(row)} className="p-2 rounded bg-amber-500 hover:bg-amber-600 text-slate-900 transition-colors" title="Edit"><Edit2 size={14} /></button>
          <button onClick={() => handleDelete(row)} className="p-1.5 rounded bg-red-500 hover:bg-red-600 text-white transition-colors" title="Hapus"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <>
      <ListTablePage
        breadcrumbs={['Master', 'Supplier']}
        subtitle="Kelola Data Supplier"
        columns={columns}
        data={dataWithIndex}
        loading={isLoading}
        emptyMessage="Tidak ada data supplier"
        pageSize={perPage}
        currentPage={page}
        totalData={total}
        onPageChange={(p) => { setPage(p); loadSuppliers(p, search); }}
        onRefresh={() => loadSuppliers(page, search)}
        toolbarLeft={
          <Input
            placeholder="Cari supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(search)}
            className="w-64"
          />
        }
        toolbarRight={
          <div className="flex gap-2">
            <button onClick={openAdd} className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors">
              Tambah +
            </button>
            <button onClick={() => downloadFile('/api/suppliers/excel', 'supplier.xlsx')} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm transition-colors">
              <Download size={14} />
            </button>
          </div>
        }
      />

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSupplier ? 'Ubah Supplier' : 'Tambah Supplier'}
        submitLabel={editingSupplier ? 'Simpan' : 'Tambahkan'}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        size="md"
      >
        <FormField label="Nama Supplier">
          <Input
            placeholder="Masukkan nama supplier"
            value={form.name}
            onChange={setField('name')}
            autoFocus
          />
        </FormField>
        <FormField label="Telepon">
          <Input
            placeholder="Masukkan nomor telepon"
            value={form.phone}
            onChange={setField('phone')}
          />
        </FormField>
        <FormField label="Alamat">
          <Input
            placeholder="Masukkan alamat"
            value={form.address}
            onChange={setField('address')}
          />
        </FormField>
        <FormField label="Kategori">
          <Select
            value={form.categoryId}
            onChange={setField('categoryId')}
          >
            <option value="">Pilih kategori...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </FormField>
      </FormModal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Supplier"
        message={`Yakin menghapus supplier "${deleteTarget?.name}"?`}
        isLoading={isDeleting}
      />
    </>
  );
}
