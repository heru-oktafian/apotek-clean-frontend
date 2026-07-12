import { useMemo, useState } from 'react';
import { Search, RefreshCw, ShoppingCart } from 'lucide-react';
import { Input, useToast } from '../../../components/ui';
import { Table, type TableColumn } from '../../../components/ui/Table';

interface SaleTransaction {
  id: number;
  nomor: string;
  pelanggan: string;
  tanggal: string;
  total: string;
  status: string;
}

const seedTransactions: SaleTransaction[] = [
  { id: 1, nomor: 'POS-001', pelanggan: 'Andi', tanggal: '2026-07-03', total: 'Rp 540.000', status: 'Lunas' },
  { id: 2, nomor: 'POS-002', pelanggan: 'Dina', tanggal: '2026-07-03', total: 'Rp 280.000', status: 'Pending' },
];

export function SalePosPage() {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions] = useState<SaleTransaction[]>(seedTransactions);

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return transactions;
    return transactions.filter((item) => [item.nomor, item.pelanggan, item.status].some((value) => value.toLowerCase().includes(query)));
  }, [searchQuery, transactions]);

  const columns: TableColumn<SaleTransaction>[] = [
    { key: 'nomor', header: 'Nomor' },
    { key: 'pelanggan', header: 'Pelanggan' },
    { key: 'tanggal', header: 'Tanggal' },
    { key: 'total', header: 'Total' },
    { key: 'status', header: 'Status' },
    {
      key: 'actions',
      header: 'Aksi',
      render: () => (
        <button type="button" className="inline-flex items-center justify-center p-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors" title="Lihat transaksi">
          <ShoppingCart size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="units-page">
      <div className="list-page__header">
        <div className="list-page__search-group">
          <div className="list-page__search-form">
            <Input placeholder="Cari penjualan..." className="list-page__search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} aria-label="Cari penjualan" />
            <button className="list-page__search-btn" type="button">
              <Search size={14} />
              Cari
            </button>
          </div>
          <button type="button" className="list-page__refresh-btn" title="Refresh" onClick={() => toast.addToast('Data transaksi disegarkan.', 'success')}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="list-page__table-wrapper">
        <Table columns={columns} data={filteredTransactions} emptyText="Tidak ada transaksi" />
      </div>
    </div>
  );
}
