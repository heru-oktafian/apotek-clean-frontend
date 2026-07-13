import { useState } from 'react';
import { Edit2, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { useMembers } from '../hooks/useMembers';
import { useMemberCategories } from '../../member-categories/hooks/useMemberCategories';
import { createMember, updateMember, deleteMember } from '../api/members-api';
import { buildApiUrl } from '../../../lib/api/env';
import { toast, Table, Modal, Button, Input, Pagination, type TableColumn } from '../../../components/ui';
import { ListSearchBar } from '../../../components/list/ListSearchBar';
import { ActionToolbar } from '../../../components/list/ActionToolbar';
import { useListSearch } from '../../../hooks/useListSearch';

interface MemberRow {
  _index?: number;
  id?: number | string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  member_category?: string;
  member_category_id?: number;
  joinDate?: string;
}

interface MemberFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  categoryId: string;
}

export function MembersPage() {
  const { activeToken } = useAuth();

  // Search
  const { searchInput, handleSearchInputChange, handleSearch } = useListSearch({
    onSearch: (_search) => loadMembers(1, _search),
  });
  const activeSearch = searchInput.trim().toLowerCase();

  const { members, total, page, perPage, isLoading, loadMembers } = useMembers();
  const { categories } = useMemberCategories();

  // Modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberRow | null>(null);
  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    categoryId: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof MemberFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<MemberRow | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Download state
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);

  // ── Refresh ──────────────────────────────────────
  const handleRefresh = () => {
    loadMembers(page, activeSearch);
  };

  // ── Add / Edit ─────────────────────────────────
  const openAdd = () => {
    setEditingMember(null);
    setFormData({ name: '', phone: '', email: '', address: '', categoryId: '' });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const openEdit = (m: MemberRow) => {
    setEditingMember(m);
    setFormData({
      name: m.name,
      phone: m.phone ?? '',
      email: m.email ?? '',
      address: m.address ?? '',
      categoryId: String(m.member_category_id ?? ''),
    });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setEditingMember(null);
    setIsEditOpen(false);
    setFormData({ name: '', phone: '', email: '', address: '', categoryId: '' });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Partial<Record<keyof MemberFormData, string>> = {};
    if (!formData.name.trim()) errors.name = 'Nama member wajib diisi.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Periksa kembali form member.');
      return;
    }
    if (!activeToken) {
      toast.error('Token tidak tersedia, login ulang.');
      return;
    }
    if (!formData.categoryId) {
      toast.error('Kategori member wajib dipilih.');
      return;
    }

    setIsSubmitting(true);
    try {
      const body = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        member_category_id: Number(formData.categoryId),
      };
      if (editingMember?.id) {
        await updateMember(activeToken, String(editingMember.id), body);
        toast.success('Member berhasil diperbarui.');
      } else {
        await createMember(activeToken, body);
        toast.success('Member berhasil ditambahkan.');
      }
      closeEdit();
      loadMembers(1, activeSearch);
    } catch {
      toast.error('Gagal menyimpan member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ──────────────────────────────────────
  const openDeleteConfirm = (m: MemberRow) => {
    setDeleteTarget(m);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteTarget(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id || !activeToken) return;

    setIsDeleting(true);
    try {
      await deleteMember(activeToken, String(deleteTarget.id));
      toast.success('Member berhasil dihapus.');
      closeDeleteConfirm();
      loadMembers(page, activeSearch);
    } catch {
      toast.error('Gagal menghapus member.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Download ────────────────────────────────────
  const handleDownloadExcel = async () => {
    if (!activeToken) { toast.error('Token tidak tersedia.'); return; }
    setIsDownloadingExcel(true);
    try {
      const res = await fetch(buildApiUrl('/api/members/excel'), {
        headers: { Authorization: `Bearer ${activeToken}`, Accept: '*/*' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'members.xlsx';
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success('Excel berhasil diunduh.');
    } catch {
      toast.error('Gagal mengunduh Excel.');
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  // ── Columns ────────────────────────────────────
  const dataWithIndex: MemberRow[] = members.map((m, i) => ({ ...m, _index: i }));
  const columns: TableColumn<MemberRow>[] = [
    {
      key: 'no',
      header: 'No',
      align: 'center',
      width: '60px',
      render: (row) => (row._index ?? 0) + 1 + (page - 1) * perPage,
    },
    { key: 'name', header: 'Nama Member' },
    { key: 'phone', header: 'Telepon' },
    { key: 'address', header: 'Alamat' },
    { key: 'member_category', header: 'Kategori' },
    { key: 'points', header: 'Poin', align: 'center', width: '80px' },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'center',
      width: '120px',
      render: (row) => (
        <div className="flex justify-center gap-1">
          <button
            type="button"
            onClick={() => openEdit(row)}
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

  return (
    <div className="list-page">
      {/* Header dengan Search */}
      <div className="list-page__header">
        <ListSearchBar
          value={searchInput}
          onChange={handleSearchInputChange}
          onSearch={handleSearch}
          placeholder="Cari member..."
          disabled={isLoading}
        />
        <button
          className="list-page__refresh-btn"
          onClick={handleRefresh}
          disabled={isLoading}
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Toolbar */}
      <ActionToolbar
        addLabel="Tambah"
        onAddClick={openAdd}
        showExportExcel
        onExportExcel={handleDownloadExcel}
        isLoading={isLoading || isDownloadingExcel}
      />

      {/* Table */}
      <div className="list-page__table-wrapper">
        {isLoading ? (
          <div className="list-page__loading">Memuat data...</div>
        ) : (
          <Table<MemberRow>
            columns={columns}
            data={dataWithIndex}
            emptyText="Tidak ada data member"
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleteConfirmOpen}
        onClose={closeDeleteConfirm}
        title="Hapus Member"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Yakin menghapus member <strong>{deleteTarget?.name}</strong>?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeDeleteConfirm}>Batal</Button>
            <Button type="button" variant="danger" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit / Add Modal */}
      <Modal
        open={isEditOpen}
        onClose={closeEdit}
        title={editingMember ? 'Ubah Member' : 'Tambah Member'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-left text-xs text-slate-600 mb-1">Nama Member</label>
              <Input
                placeholder="Nama member"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                }}
                aria-label="Nama member"
              />
              {formErrors.name && <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>}
            </div>
            <div>
              <label className="block text-left text-xs text-slate-600 mb-1">Telepon</label>
              <Input
                placeholder="Nomor telepon"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                aria-label="Telepon"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-left text-xs text-slate-600 mb-1">Email</label>
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                aria-label="Email"
              />
            </div>
            <div>
              <label className="block text-left text-xs text-slate-600 mb-1">Kategori</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Pilih kategori...</option>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.nama}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-left text-xs text-slate-600 mb-1">Alamat</label>
            <Input
              placeholder="Alamat"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              aria-label="Alamat"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeEdit}>Batal</Button>
            <Button
              type="submit"
              variant={editingMember ? 'outline' : 'primary'}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Menyimpan...' : editingMember ? 'Simpan' : 'Tambahkan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Pagination */}
      <Pagination
        page={page}
        total={total}
        perPage={perPage}
        onPageChange={(p) => loadMembers(p, activeSearch)}
      />
    </div>
  );
}
