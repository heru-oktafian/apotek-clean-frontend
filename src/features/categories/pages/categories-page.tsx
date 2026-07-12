import { useState } from 'react';
import { Edit2, Trash2, Plus, Download } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { useToast, Input, FormField } from '../../../components/ui';
import { buildApiUrl } from '../../../lib/api/env';
import { useCategories, type Category } from '../hooks/useCategories';
import { createCategory, updateCategory, deleteCategory } from '../api/categories-api';
import { ListTablePage, type Column, formatCurrency } from '../../../components/ListTablePage';
import { FormModal } from '../../../components/common/FormModal';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { EmptyState } from '../../../components/common/EmptyState';

export function CategoriesPage() {
  const { activeToken } = useAuth();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { categories, total, perPage, isLoading, loadCategories } = useCategories();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Load ────────────────────────────────────────
  const handleSearch = (s: string) => {
    setSearch(s);
    setPage(1);
    loadCategories(1, s);
  };

  // ── Add / Edit ─────────────────────────────────
  const openAdd = () => {
    setEditingCategory(null);
    setCategoryName('');
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
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
      const body = { name: categoryName, nama: categoryName, product_category_name: categoryName };
      if (editingCategory) {
        await updateCategory(activeToken, editingCategory.id, body);
        toast.addToast('Kategori berhasil diperbarui.', 'success');
      } else {
        await createCategory(activeToken, body);
        toast.addToast('Kategori berhasil ditambahkan.', 'success');
      }
      setModalOpen(false);
      loadCategories(page, search);
    } catch (err) {
      toast.addToast(err instanceof Error ? err.message : 'Gagal menyimpan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ──────────────────────────────────────
  const handleDelete = (cat: Category) => setDeleteTarget(cat);
  const handleConfirmDelete = async () => {
    if (!deleteTarget || !activeToken) return;
    setIsDeleting(true);
    try {
      await deleteCategory(activeToken, deleteTarget.id);
      toast.addToast('Kategori berhasil dihapus.', 'success');
      setDeleteTarget(null);
      loadCategories(page, search);
    } catch (err) {
      toast.addToast(err instanceof Error ? err.message : 'Gagal menghapus.', 'error');
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
  const columns: Column<Category>[] = [
    { key: 'id', header: 'ID', width: '80px' },
    { key: 'nama', header: 'Nama Kategori' },
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

  const totalPages = Math.ceil(total / perPage);

  return (
    <>
      <ListTablePage
        breadcrumbs={['Master', 'Kategori']}
        subtitle="Kelola Kategori Produk"
        columns={columns}
        data={categories}
        loading={isLoading}
        emptyMessage="Tidak ada kategori produk"
        pageSize={perPage}
        currentPage={page}
        totalData={total}
        onPageChange={(p) => { setPage(p); loadCategories(p, search); }}
        onRefresh={() => loadCategories(page, search)}
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
            <button onClick={() => downloadFile('/api/categories/excel', 'kategori.xlsx')} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm transition-colors">
              <Download size={14} />
            </button>
            <button onClick={() => downloadFile('/api/categories/pdf', 'kategori.pdf')} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm transition-colors">
              PDF
            </button>
          </div>
        }
      />

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Ubah Kategori' : 'Tambah Kategori'}
        submitLabel={editingCategory ? 'Simpan' : 'Tambahkan'}
        submitVariant={editingCategory ? 'primary' : 'primary'}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        size="sm"
      >
        <FormField label="Nama Kategori">
          <Input
            placeholder="Masukkan nama kategori"
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
        title="Hapus Kategori"
        message={`Yakin menghapus kategori "${deleteTarget?.nama}"?`}
        isLoading={isDeleting}
      />
    </>
  );
}
