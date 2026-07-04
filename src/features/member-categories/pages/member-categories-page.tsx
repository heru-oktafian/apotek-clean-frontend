import { useMemo, useState } from 'react';
import { Edit2, Trash2, RefreshCw, Search } from 'lucide-react';
import { Button, Input, Modal, useToast } from '../../../components/ui';
import { Table, type TableColumn } from '../../../components/ui/Table';

interface MemberCategory {
  id: number;
  name: string;
}

const seedCategories: MemberCategory[] = [
  { id: 1, name: 'UMUM' },
  { id: 2, name: 'VIP' },
  { id: 3, name: 'KARYAWAN' },
];

export function MemberCategoriesPage() {
  const toast = useToast();
  const [categories, setCategories] = useState<MemberCategory[]>(seedCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MemberCategory | null>(null);
  const [name, setName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<MemberCategory | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((item) => item.name.toLowerCase().includes(query));
  }, [categories, searchQuery]);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setModalOpen(true);
  };

  const openEditModal = (category: MemberCategory) => {
    setEditingCategory(category);
    setName(category.name);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    setName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.addToast('Nama kategori wajib diisi.', 'error');
      return;
    }

    if (editingCategory) {
      setCategories((current) => current.map((item) => item.id === editingCategory.id ? { ...item, name: name.trim() } : item));
      toast.addToast('Kategori anggota berhasil diperbarui.', 'success');
    } else {
      setCategories((current) => [...current, { id: Date.now(), name: name.trim() }]);
      toast.addToast('Kategori anggota berhasil ditambahkan.', 'success');
    }

    closeModal();
  };

  const openDeleteConfirm = (category: MemberCategory) => {
    setDeleteTarget(category);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteTarget(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setCategories((current) => current.filter((item) => item.id !== deleteTarget.id));
    toast.addToast('Kategori anggota berhasil dihapus.', 'success');
    closeDeleteConfirm();
  };

  const columns: TableColumn<MemberCategory>[] = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Nama Kategori' },
    {
      key: 'actions',
      header: 'Aksi',
      render: (row) => (
        <div className="flex gap-2">
          <button type="button" onClick={() => openEditModal(row)} className="inline-flex items-center justify-center p-2 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded transition-colors" title="Edit">
            <Edit2 size={16} />
          </button>
          <button type="button" onClick={() => openDeleteConfirm(row)} className="inline-flex items-center justify-center p-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors" title="Hapus">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="units-page">
      <div className="units-page__header">
        <div className="units-page__search-group">
          <div className="units-page__search-form">
            <Input placeholder="Cari kategori anggota..." className="units-page__search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} aria-label="Cari kategori anggota" />
            <button className="units-page__search-btn" type="button">
              <Search size={14} />
              Cari
            </button>
          </div>
          <button type="button" className="units-page__refresh-btn" title="Refresh" onClick={() => setSearchQuery('')}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="units-page__toolbar">
        <button type="button" className="units-page__btn-tambah" onClick={openAddModal}>
          Tambah +
        </button>
      </div>

      <div className="units-page__table-wrapper">
        <Table columns={columns} data={filteredCategories} emptyText="Tidak ada kategori anggota" />
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editingCategory ? 'Ubah Kategori Anggota' : 'Tambah Kategori Anggota'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input placeholder="Nama kategori" value={name} onChange={(e) => setName(e.target.value)} aria-label="Nama kategori" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>Batal</Button>
            <Button type="submit" variant="primary">{editingCategory ? 'Simpan' : 'Tambahkan'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={isDeleteConfirmOpen} onClose={closeDeleteConfirm} title="Hapus Kategori Anggota" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-700">Yakin ingin menghapus kategori <strong>{deleteTarget?.name}</strong>?</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeDeleteConfirm}>Batal</Button>
            <Button type="button" variant="danger" onClick={handleConfirmDelete}>Hapus</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
