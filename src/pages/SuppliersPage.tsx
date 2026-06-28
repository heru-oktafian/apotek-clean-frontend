import { useState } from 'react';
import { Package } from 'lucide-react';
import { Button, Input, Modal } from '../components/ui';
import { Table, type TableColumn } from '../components/ui';

interface Supplier {
  id: number;
  kode: string;
  nama: string;
  telepon: string;
  alamat: string;
  status: 'active' | 'inactive';
}

const mockSuppliers: Supplier[] = [
  { id: 1, kode: 'SUP001', nama: 'PT Sehat Sentosa', telepon: '081234567890', alamat: 'Jl. Merdeka No. 10', status: 'active' },
  { id: 2, kode: 'SUP002', nama: 'CV Pharma Jaya', telepon: '081298765432', alamat: 'Jl. Sudirman No. 25', status: 'active' },
];

export function SuppliersPage() {
  const [suppliers] = useState<Supplier[]>(mockSuppliers);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ kode: '', nama: '', telepon: '', alamat: '' });

  const handleSave = () => {
    console.log('Save supplier:', form);
    setShowModal(false);
    setForm({ kode: '', nama: '', telepon: '', alamat: '' });
  };

  const columns: TableColumn<Supplier>[] = [
    { key: 'kode', header: 'Kode' },
    { key: 'nama', header: 'Nama Supplier' },
    { key: 'telepon', header: 'Telepon' },
    { key: 'alamat', header: 'Alamat' },
    {
      key: 'status',
      header: 'Status',
      render: (row: Supplier) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
          {row.status === 'active' ? 'Aktif' : 'Nonaktif'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: () => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline">Edit</Button>
          <Button size="sm" variant="danger">Hapus</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Supplier</h1>
        </div>
        <Button onClick={() => setShowModal(true)}>+ Tambah Supplier</Button>
      </div>

      <Table columns={columns} data={suppliers} />

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Tambah Supplier" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kode</label>
            <Input value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama</label>
            <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Telepon</label>
            <Input value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Alamat</label>
            <Input value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>Batal</Button>
            <Button onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
