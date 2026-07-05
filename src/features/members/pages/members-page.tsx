import { useState, useEffect } from 'react';
import { Edit2, Trash2, RefreshCw, Search } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { useMembers } from '../hooks/useMembers';
import { fetchMemberCategories, createMember, updateMember, deleteMember } from '../api/members-api';
import { useToast, Table, Modal, Button, Input, Pagination, type TableColumn } from '../../../components/ui';
import type { Member } from '../types/members';
import type { MemberCategory } from '../types/member-categories';

interface MemberWithIndex extends Member {
  _index?: number;
}

interface MemberFormData {
  name: string;
  phone: string;
  address: string;
  member_category_id: number;
}

export function MembersPage() {
  const { activeToken } = useAuth();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [memberCategories, setMemberCategories] = useState<MemberCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    phone: '',
    address: '',
    member_category_id: 0,
  });
  const [formErrors, setFormErrors] = useState<Partial<MemberFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const { members, total, page, perPage, isLoading, loadMembers } = useMembers(activeToken || '');

  // Load member categories for modal form
  useEffect(() => {
    if (!activeToken) return;

    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await fetchMemberCategories(activeToken, {});
        const payload = response as any;
        
        // Handle different response formats
        let rawData = [];
        if (Array.isArray(payload)) {
          rawData = payload;
        } else if (Array.isArray(payload?.data)) {
          rawData = payload.data;
        }
        
        // Normalize field names
        const categories = rawData.map((cat: any) => ({
          member_category_id: cat.member_category_id ?? cat.id ?? 0,
          member_category_name: cat.member_category_name ?? cat.name ?? cat.nama ?? '',
        }));
        
        setMemberCategories(categories);
      } catch (err) {
        console.error('Error loading member categories:', err);
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
      loadMembers(1, '');
      return;
    }

    if (normalized.length >= 3) {
      setActiveSearch(normalized);
      loadMembers(1, normalized);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const normalized = searchQuery.trim();
    setActiveSearch(normalized);
    loadMembers(1, normalized);
  };

  const handleRefresh = () => {
    loadMembers(page, activeSearch);
  };

  const handlePageChange = (nextPage: number) => {
    loadMembers(nextPage, activeSearch);
  };

  // CRUD Handlers
  const openAddMember = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      phone: '',
      address: '',
      member_category_id: 0,
    });
    setFormErrors({});
    setIsAddOpen(true);
  };

  const openEditMember = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      phone: member.phone,
      address: member.address,
      member_category_id: memberCategories.find((cat) => cat.member_category_name === member.member_category)?.member_category_id || 0,
    });
    setFormErrors({});
    setIsAddOpen(true);
  };

  const closeAddMember = () => {
    setIsAddOpen(false);
    setEditingMember(null);
    setFormData({
      name: '',
      phone: '',
      address: '',
      member_category_id: 0,
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Partial<MemberFormData> = {};

    if (!formData.name.trim()) {
      errors.name = 'Nama member wajib diisi' as any;
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Nomor telepon wajib diisi' as any;
    }
    if (!formData.address.trim()) {
      errors.address = 'Alamat wajib diisi' as any;
    }
    if (!formData.member_category_id) {
      errors.member_category_id = 'Kategori member wajib dipilih' as any;
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
      if (editingMember?.id) {
        await updateMember(activeToken, editingMember.id, formData);
        toast.addToast('Member berhasil diperbarui.', 'success');
      } else {
        await createMember(activeToken, formData);
        toast.addToast('Member berhasil ditambahkan.', 'success');
      }

      closeAddMember();
      loadMembers(1, activeSearch);
    } catch (error) {
      console.error(error);
      toast.addToast('Gagal menyimpan member. Coba lagi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteConfirm = (member: Member) => {
    setDeleteTarget(member);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteTarget(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleConfirmDeleteMember = async () => {
    if (!deleteTarget?.id || !activeToken) return;

    try {
      await deleteMember(activeToken, deleteTarget.id);
      toast.addToast('Member berhasil dihapus.', 'success');
      closeDeleteConfirm();
      loadMembers(1, activeSearch);
    } catch (error) {
      console.error(error);
      toast.addToast('Gagal menghapus member.', 'error');
    }
  };

  const columns: TableColumn<MemberWithIndex>[] = [
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
    },
    {
      key: 'member_category',
      header: 'Kategori Member',
      render: (row) => row.member_category,
    },
    {
      key: 'points',
      header: 'Poin',
      render: (row) => row.points.toLocaleString('id-ID'),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (row) => (
        <div className="flex gap-1 justify-center">
          <button
            type="button"
            onClick={() => openEditMember(row)}
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

  const dataWithIndex: MemberWithIndex[] = members.map((member, index) => ({
    ...member,
    _index: index,
  }));

  return (
    <div className="members-page">
      {/* Header dengan Search, Category Filter, dan Refresh */}
      <div className="members-page__header">
        <div className="members-page__search-group">
          <form className="members-page__search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Cari..."
              className="members-page__search-input"
              value={searchQuery}
              onChange={handleSearchInput}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
            />
            <button
              className="members-page__search-btn"
              type="submit"
              disabled={isLoading}
              title="Cari"
            >
              <Search size={14} />
              Cari
            </button>
          </form>
          <button
            className="members-page__refresh-btn"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Toolbar - Tombol Tambah */}
      <div className="members-page__toolbar">
        <button className="members-page__btn-tambah" onClick={openAddMember}>
          Tambah +
        </button>
      </div>

      {/* Table */}
      <div className="members-page__table-wrapper">
        {isLoading ? (
          <div className="members-page__loading">
            Memuat data...
          </div>
        ) : (
          <Table<MemberWithIndex>
            columns={columns}
            data={dataWithIndex}
            emptyText="Tidak ada data member"
          />
        )}
      </div>

      {/* Add/Edit Member Modal */}
      <Modal
        open={isAddOpen}
        onClose={closeAddMember}
        title={editingMember ? 'Ubah Member' : 'Tambah Member'}
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Member</label>
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
            <label className="block text-sm font-medium mb-1">Nomor Telepon</label>
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
            <label className="block text-sm font-medium mb-1">Alamat</label>
            <Input
              placeholder="Alamat"
              value={formData.address}
              onChange={(e) => {
                setFormData({ ...formData, address: e.target.value });
                if (formErrors.address) setFormErrors({ ...formErrors, address: undefined });
              }}
              aria-label="Alamat"
            />
            {formErrors.address && <p className="text-sm text-red-600 mt-1">{formErrors.address}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kategori Member</label>
            <select
              value={String(formData.member_category_id)}
              onChange={(e) => {
                setFormData({ ...formData, member_category_id: Number(e.target.value) });
                if (formErrors.member_category_id) setFormErrors({ ...formErrors, member_category_id: undefined });
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="0">Pilih kategori member</option>
              {memberCategories.map((cat) => (
                <option key={cat.member_category_id} value={String(cat.member_category_id)}>
                  {cat.member_category_name}
                </option>
              ))}
            </select>
            {formErrors.member_category_id && <p className="text-sm text-red-600 mt-1">{formErrors.member_category_id}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeAddMember}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className={editingMember ? 'bg-amber-500 hover:bg-amber-600 text-slate-900' : 'bg-green-600 hover:bg-green-700 text-white'}
            >
              {isSubmitting ? 'Menyimpan...' : editingMember ? 'Simpan' : 'Tambahkan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={isDeleteConfirmOpen} onClose={closeDeleteConfirm} title="Hapus Member" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Yakin ingin menghapus member <strong>{deleteTarget?.name}</strong>?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeDeleteConfirm}>
              Batal
            </Button>
            <Button type="button" variant="danger" onClick={handleConfirmDeleteMember}>
              Hapus
            </Button>
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
