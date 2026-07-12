import { useState } from 'react';
import { FormField } from '../../../components/ui';
import { Edit2, Trash2, Plus, Download } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { useToast, Input } from '../../../components/ui';
import { buildApiUrl } from '../../../lib/api/env';
import { useSupplierCategories } from '../hooks/useSupplierCategories';
import { createSupplierCategory, updateSupplierCategory, deleteSupplierCategory } from '../api/supplier-categories-api';
import { ListTablePage, type Column } from '../../../components/ListTablePage';
import { FormModal } from '../../../components/common/FormModal';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';

interface SupplierCategoryRow {
  _index: number;
  id?: number;
  nama: string;
}

export function SupplierCategoriesPage() {
  const { activeToken } = useAuth();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { categories, total, perPage, isLoading, loadSupplierCategories } = useSupplierCategories(activeToken || '');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SupplierCategoryRow | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<SupplierCategoryRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Load ────────────────────────────────────────
  const handleSearch = (s: string) => {
    setSearch(s);
    setPage(1);
    loadSupplierCategories(1, s);
  };

  // ── Add / Edit ─────────────────────────────────
  const openAdd = () => {
    setEditingCategory(null);
    setCategoryName('');
    setModalOpen(true);
  };

  const openEdit = (cat: SupplierCategoryRow) => {
    setEditingCategory(cat);
    setCategoryName(cat.nama);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      toast.addToast('Nama kategori wajib diisi.', 'error');
      return;
    }
    if (!activeToken) {
      toast.addToast('Token tidak tersedia, login ulang.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory?.id) {
        await updateSupplierCategory(activeToken, editingCategory.id, { name: categoryName });
        toast.addToast('Kategori supplier berhasil diperbarui.', 'success');
      } else {
        await createSupplierCategory(activeToken, { name: categoryName });
        toast.addToast('Kategori supplier berhasil ditambahkan.', 'success');
      }
      setModalOpen(false);
      loadSupplierCategories(page, search);
    } catch {
      toast.addToast('Gagal menyimpan kategori.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ──────────────────────────────────────
  const handleDelete = (cat: SupplierCategoryRow) => setDeleteTarget(cat);
  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id || !activeToken) return;
    setIsDeleting(true);
    try {
      await deleteSupplierCategory(activeToken, deleteTarget.id);
      toast.addToast('Kategori supplier berhasil dihapus.', 'success');
      setDeleteTarget(null);
      loadSupplierCategories(page, search);
    } catch {
      toast.addToast('Gagal menghapus kategori.', 'error');
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
  const dataWithIndex: SupplierCategoryRow[] = categories.map((c, i) => ({ ...c, _index: i }));
  const columns: Column<SupplierCategoryRow>[] = [
    {
      key: 'no',
      header: 'No',
      align: 'center',
      width: '60px',
      render: (_, row) => (row._index ?? 0) + 1 + (page - 1) * perPage,
    },
    { key: 'nama', header: 'Nama Kategori Supplier' },
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
        breadcrumbs={['Master', 'Kategori Supplier']}
        subtitle="Kelola Kategori Supplier"
        columns={columns}
        data={dataWithIndex}
        loading={isLoading}
        emptyMessage="Tidak ada data kategori supplier"
        pageSize={perPage}
        currentPage={page}
        totalData={total}
        onPageChange={(p) => { setPage(p); loadSupplierCategories(p, search); }}
        onRefresh={() => loadSupplierCategories(page, search)}
        toolbarLeft={
          <Input
            placeholder="Cari kategori..."
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
            <button onClick={() => downloadFile('/api/supplier-categories/excel', 'kategori-supplier.xlsx')} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm transition-colors">
              <Download size={14} />
            </button>
          </div>
        }
      />

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Ubah Kategori Supplier' : 'Tambah Kategori Supplier'}
        submitLabel={editingCategory ? 'Simpan' : 'Tambahkan'}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        size="sm"
      >
        <FormField label="Nama Kategori">
          <Input
            placeholder="Masukkan nama kategori supplier"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            autoFocus
          />
        </FormField>
      </FormModal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Kategori Supplier"
        message={`Yakin menghapus kategori "${deleteTarget?.nama}"?`}
        isLoading={isDeleting}
      />
    </>
  );
}
