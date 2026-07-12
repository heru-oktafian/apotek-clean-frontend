import { useState } from 'react';
import { Edit2, Trash2, Plus, Download } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { useToast, Input, FormField } from '../../../components/ui';
import { buildApiUrl } from '../../../lib/api/env';
import { useMemberCategories } from '../hooks/useMemberCategories';
import { createMemberCategory, updateMemberCategory, deleteMemberCategory } from '../api/member-categories-api';
import { ListTablePage, type Column } from '../../../components/ListTablePage';
import { FormModal } from '../../../components/common/FormModal';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';

interface MemberCategoryRow {
  _index: number;
  id?: number;
  name: string;
  discountPercentage?: number;
}

export function MemberCategoriesPage() {
  const { activeToken } = useAuth();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { categories, total, perPage, isLoading, loadMemberCategories } = useMemberCategories(activeToken || '');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MemberCategoryRow | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<MemberCategoryRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Load ────────────────────────────────────────
  const handleSearch = (s: string) => {
    setSearch(s);
    setPage(1);
    loadMemberCategories(1, s);
  };

  // ── Add / Edit ─────────────────────────────────
  const openAdd = () => {
    setEditingCategory(null);
    setCategoryName('');
    setDiscountPercentage('');
    setModalOpen(true);
  };

  const openEdit = (cat: MemberCategoryRow) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setDiscountPercentage(cat.discountPercentage !== undefined ? String(cat.discountPercentage) : '');
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
      const body = {
        name: categoryName,
        discountPercentage: discountPercentage ? parseFloat(discountPercentage) : undefined,
      };
      if (editingCategory?.id) {
        await updateMemberCategory(activeToken, editingCategory.id, body);
        toast.addToast('Kategori member berhasil diperbarui.', 'success');
      } else {
        await createMemberCategory(activeToken, body);
        toast.addToast('Kategori member berhasil ditambahkan.', 'success');
      }
      setModalOpen(false);
      loadMemberCategories(page, search);
    } catch {
      toast.addToast('Gagal menyimpan kategori.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ──────────────────────────────────────
  const handleDelete = (cat: MemberCategoryRow) => setDeleteTarget(cat);
  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id || !activeToken) return;
    setIsDeleting(true);
    try {
      await deleteMemberCategory(activeToken, deleteTarget.id);
      toast.addToast('Kategori member berhasil dihapus.', 'success');
      setDeleteTarget(null);
      loadMemberCategories(page, search);
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
  const dataWithIndex: MemberCategoryRow[] = categories.map((c, i) => ({ ...c, _index: i }));
  const columns: Column<MemberCategoryRow>[] = [
    {
      key: 'no',
      header: 'No',
      align: 'center',
      width: '60px',
      render: (_, row) => (row._index ?? 0) + 1 + (page - 1) * perPage,
    },
    { key: 'name', header: 'Nama Kategori' },
    {
      key: 'discountPercentage',
      header: 'Diskon (%)',
      align: 'center',
      render: (val) => (val !== undefined && val !== null ? `${val}%` : '-'),
    },
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
        breadcrumbs={['Membership', 'Kategori Member']}
        subtitle="Kelola Kategori Member"
        columns={columns}
        data={dataWithIndex}
        loading={isLoading}
        emptyMessage="Tidak ada data kategori member"
        pageSize={perPage}
        currentPage={page}
        totalData={total}
        onPageChange={(p) => { setPage(p); loadMemberCategories(p, search); }}
        onRefresh={() => loadMemberCategories(page, search)}
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
            <button onClick={() => downloadFile('/api/member-categories/excel', 'kategori-member.xlsx')} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm transition-colors">
              <Download size={14} />
            </button>
          </div>
        }
      />

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Ubah Kategori Member' : 'Tambah Kategori Member'}
        submitLabel={editingCategory ? 'Simpan' : 'Tambahkan'}
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
        <FormField label="Diskon (%)">
          <Input
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="Contoh: 10"
            value={discountPercentage}
            onChange={(e) => setDiscountPercentage(e.target.value)}
          />
          <p className="text-xs text-slate-400">Opsional. Persentase diskon untuk kategori ini.</p>
        </FormField>
      </FormModal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Kategori Member"
        message={`Yakin menghapus kategori "${deleteTarget?.name}"?`}
        isLoading={isDeleting}
      />
    </>
  );
}
