import { useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { Button, Input, Modal, Badge } from '../components/ui';
import { Table, type TableColumn } from '../components/ui';

interface Product {
  id: number;
  kode: string;
  nama: string;
  kategori: string;
  harga_beli: number;
  harga_jual: number;
  stok: number;
  status: 'active' | 'inactive';
}

const mockProducts: Product[] = [
  { id: 1, kode: 'P001', nama: 'Paracetamol 500mg', kategori: 'Obat', harga_beli: 5000, harga_jual: 7500, stok: 100, status: 'active' },
  { id: 2, kode: 'P002', nama: 'Amoxicillin 250mg', kategori: 'Antibiotik', harga_beli: 15000, harga_jual: 22000, stok: 50, status: 'active' },
  { id: 3, kode: 'P003', nama: 'OBH Combi', kategori: 'Obat Batuk', harga_beli: 12000, harga_jual: 18000, stok: 75, status: 'active' },
];

export function ProductsPage() {
  const [products] = useState<Product[]>(mockProducts);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<Product | null>(null);
  const [form, setForm] = useState({ kode: '', nama: '', kategori: '', harga_beli: '', harga_jual: '', stok: '' });

  const filtered = products.filter(p =>
    p.nama.toLowerCase().includes(search.toLowerCase()) ||
    p.kode.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpen = (p?: Product) => {
    if (p) {
      setEditData(p);
      setForm({ kode: p.kode, nama: p.nama, kategori: p.kategori, harga_beli: String(p.harga_beli), harga_jual: String(p.harga_jual), stok: String(p.stok) });
    } else {
      setEditData(null);
      setForm({ kode: '', nama: '', kategori: '', harga_beli: '', harga_jual: '', stok: '' });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    setShowModal(false);
    console.log('Save:', editData ? 'update' : 'create', form);
  };

  const handleDelete = async (_id: number) => {
    if (confirm('Yakin hapus?')) {
      console.log('Delete:', _id);
    }
  };

  const columns: TableColumn<Product>[] = [
    { key: 'kode', header: 'Kode' },
    { key: 'nama', header: 'Nama Produk' },
    { key: 'kategori', header: 'Kategori' },
    {
      key: 'harga_beli',
      header: 'Harga Beli',
      render: (row: Product) => `Rp ${row.harga_beli.toLocaleString('id-ID')}`,
    },
    {
      key: 'harga_jual',
      header: 'Harga Jual',
      render: (row: Product) => `Rp ${row.harga_jual.toLocaleString('id-ID')}`,
    },
    {
      key: 'stok',
      header: 'Stok',
      render: (row: Product) => (
        <Badge variant={row.stok > 20 ? 'success' : row.stok > 5 ? 'warning' : 'danger'}>
          {row.stok}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Product) => (
        <Badge variant={row.status === 'active' ? 'success' : 'default'}>
          {row.status === 'active' ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (row: Product) => (
        <div className="flex gap-2">
          <button onClick={() => handleOpen(row)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(row.id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Produk</h1>
        </div>
        <Button onClick={() => handleOpen()}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Produk
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Table columns={columns} data={filtered} />

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit Produk' : 'Tambah Produk'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kode</label>
              <Input value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama</label>
              <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
            <Input value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Harga Beli</label>
              <Input type="number" value={form.harga_beli} onChange={(e) => setForm({ ...form, harga_beli: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Harga Jual</label>
              <Input type="number" value={form.harga_jual} onChange={(e) => setForm({ ...form, harga_jual: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stok</label>
              <Input type="number" value={form.stok} onChange={(e) => setForm({ ...form, stok: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>Batal</Button>
            <Button onClick={handleSave}>{editData ? 'Update' : 'Simpan'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
