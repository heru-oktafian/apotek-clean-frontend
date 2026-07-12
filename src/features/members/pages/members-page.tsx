import { useState } from 'react';
import { Edit2, Trash2, Plus, Download } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { useToast, Input, Select } from '../../../components/ui';
import { buildApiUrl } from '../../../lib/api/env';
import { useMembers } from '../hooks/useMembers';
import { useMemberCategories } from '../../member-categories/hooks/useMemberCategories';
import { createMember, updateMember, deleteMember } from '../api/members-api';
import { ListTablePage, type Column } from '../../../components/ListTablePage';
import { FormModal } from '../../../components/common/FormModal';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';

interface MemberRow {
  _index: number;
  id?: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  categoryName?: string;
  categoryId?: number;
  joinDate?: string;
}

interface MemberFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  categoryId: string;
}

const initialForm: MemberFormData = { name: '', phone: '', email: '', address: '', categoryId: '' };

export function MembersPage() {
  const { activeToken } = useAuth();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { members, total, perPage, isLoading, loadMembers } = useMembers(activeToken || '');
  const { categories } = useMemberCategories(activeToken || '');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberRow | null>(null);
  const [form, setForm] = useState<MemberFormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<MemberRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const setField = (field: keyof MemberFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  // ── Load ────────────────────────────────────────
  const handleSearch = (s: string) => {
    setSearch(s);
    setPage(1);
    loadMembers(1, s);
  };

  // ── Add / Edit ─────────────────────────────────
  const openAdd = () => {
    setEditingMember(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (m: MemberRow) => {
    setEditingMember(m);
    setForm({
      name: m.name,
      phone: m.phone ?? '',
      email: m.email ?? '',
      address: m.address ?? '',
      categoryId: String(m.categoryId ?? ''),
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.addToast('Nama member wajib diisi.', 'error');
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
        email: form.email,
        address: form.address,
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      };
      if (editingMember?.id) {
        await updateMember(activeToken, editingMember.id, body);
        toast.addToast('Member berhasil diperbarui.', 'success');
      } else {
        await createMember(activeToken, body);
        toast.addToast('Member berhasil ditambahkan.', 'success');
      }
      setModalOpen(false);
      loadMembers(page, search);
    } catch {
      toast.addToast('Gagal menyimpan member.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ──────────────────────────────────────
  const handleDelete = (m: MemberRow) => setDeleteTarget(m);
  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id || !activeToken) return;
    setIsDeleting(true);
    try {
      await deleteMember(activeToken, deleteTarget.id);
      toast.addToast('Member berhasil dihapus.', 'success');
      setDeleteTarget(null);
      loadMembers(page, search);
    } catch {
      toast.addToast('Gagal menghapus member.', 'error');
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
  const dataWithIndex: MemberRow[] = members.map((m, i) => ({ ...m, _index: i }));
  const columns: Column<MemberRow>[] = [
    {
      key: 'no',
      header: 'No',
      align: 'center',
      width: '60px',
      render: (_, row) => (row._index ?? 0) + 1 + (page - 1) * perPage,
    },
    { key: 'name', header: 'Nama Member' },
    { key: 'phone', header: 'Telepon' },
    { key: 'email', header: 'Email' },
    { key: 'categoryName', header: 'Kategori' },
    {
      key: 'joinDate',
      header: 'Tanggal Gabung',
      render: (val) => val ? String(val).split('T')[0] : '-',
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
        breadcrumbs={['Membership', 'Members']}
        subtitle="Kelola Data Member"
        columns={columns}
        data={dataWithIndex}
        loading={isLoading}
        emptyMessage="Tidak ada data member"
        pageSize={perPage}
        currentPage={page}
        totalData={total}
        onPageChange={(p) => { setPage(p); loadMembers(p, search); }}
        onRefresh={() => loadMembers(page, search)}
        toolbarLeft={
          <Input
            placeholder="Cari member..."
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
            <button onClick={() => downloadFile('/api/members/excel', 'members.xlsx')} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm transition-colors">
              <Download size={14} />
            </button>
          </div>
        }
      />

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMember ? 'Ubah Member' : 'Tambah Member'}
        submitLabel={editingMember ? 'Simpan' : 'Tambahkan'}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        size="md"
      >
        <Input
          label="Nama Member"
          placeholder="Masukkan nama member"
          value={form.name}
          onChange={setField('name')}
          autoFocus
        />
        <Input
          label="Telepon"
          placeholder="Masukkan nomor telepon"
          value={form.phone}
          onChange={setField('phone')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="Masukkan email"
          value={form.email}
          onChange={setField('email')}
        />
        <Input
          label="Alamat"
          placeholder="Masukkan alamat"
          value={form.address}
          onChange={setField('address')}
        />
        <Select
          label="Kategori"
          value={form.categoryId}
          onChange={setField('categoryId')}
        >
          <option value="">Pilih kategori...</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      </FormModal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Member"
        message={`Yakin menghapus member "${deleteTarget?.name}"?`}
        isLoading={isDeleting}
      />
    </>
  );
}
