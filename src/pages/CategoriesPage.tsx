import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button, Input, Modal, Table } from '../components/ui';

interface Category { id: number; kode: string; nama: string; deskripsi: string; jumlah_produk: number; }

export function CategoriesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ kode: '', nama: '', deskripsi: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const data: Category[] = [
    { id: 1, kode: 'KAT001', nama: 'Analgesik', deskripsi: 'Obat pereda nyeri', jumlah_produk: 12 },
    { id: 2, kode: 'KAT002', nama: 'Antibiotik', deskripsi: 'Obat anti bakteri', jumlah_produk: 8 },
    { id: 3, kode: 'KAT003', nama: 'Batuk & Flu', deskripsi: 'Obat batuk dan flu', jumlah_produk: 15 },
    { id: 4, kode: 'KAT004', nama: 'Maag', deskripsi: 'Obat asam lambung', jumlah_produk: 6 },
    { id: 5, kode: 'KAT005', nama: 'Vitamin', deskripsi: 'Suplemen dan vitamin', jumlah_produk: 20 },
  ];

  const openAdd = () => { setEditing(null); setForm({ kode: '', nama: '', deskripsi: '' }); setErrors({}); setModalOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ kode: c.kode, nama: c.nama, deskripsi: c.deskripsi }); setErrors({}); setModalOpen(true); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.kode) e.kode = 'Wajib diisi';
    if (!form.nama) e.nama = 'Wajib diisi';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setModalOpen(false);
  };

  const columns = [
    { key: 'kode', header: 'Kode' },
    { key: 'nama', header: 'Nama Kategori' },
    { key: 'deskripsi', header: 'Deskripsi' },
    { key: 'jumlah_produk', header: 'Jumlah Produk' },
    {
      key: 'actions', header: '',
      render: (r: Category) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => { if (confirm('Hapus?')) {} }} className="p-1.5 rounded-lg text-slate-400 hover:text-danger hover:bg-danger/10"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-secondary">Kategori</h1><p className="text-sm text-slate-500 mt-0.5">Kelola kategori produk</p></div>
        <Button onClick={openAdd}><Plus className="w-4 h-4" /> Tambah</Button>
      </div>
      <Table columns={columns} data={data} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Kategori' : 'Tambah Kategori'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Kode" value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} error={errors.kode} />
          <Input label="Nama" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} error={errors.nama} />
          <Input label="Deskripsi" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2"><Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button><Button type="submit">{editing ? 'Simpan' : 'Tambah'}</Button></div>
        </form>
      </Modal>
    </div>
  );
}
