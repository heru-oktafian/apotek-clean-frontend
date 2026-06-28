import { Package, ShoppingCart, ShoppingBag, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const stats = [
  { label: 'Total Produk', value: '1,248', icon: Package, trend: '+12', up: true, color: 'text-primary' },
  { label: 'Penjualan Hari Ini', value: 'Rp 2.5M', icon: ShoppingBag, trend: '+8%', up: true, color: 'text-blue-500' },
  { label: 'Pembelian', value: 'Rp 1.8M', icon: ShoppingCart, trend: '-3%', up: false, color: 'text-yellow-500' },
  { label: 'Stok Minim', value: '14 Item', icon: AlertTriangle, trend: '', up: true, color: 'text-danger' },
];

const recentSales = [
  { id: 'TRX001', customer: 'Budi Santoso', total: 'Rp 125,000', time: '10:30', status: 'success' },
  { id: 'TRX002', customer: 'Siti Aminah', total: 'Rp 89,500', time: '10:15', status: 'success' },
  { id: 'TRX003', customer: 'Andi Wijaya', total: 'Rp 234,000', time: '09:58', status: 'success' },
  { id: 'TRX004', customer: 'Dewi Lestari', total: 'Rp 67,000', time: '09:45', status: 'pending' },
  { id: 'TRX005', customer: 'Rudi Hermawan', total: 'Rp 312,000', time: '09:30', status: 'success' },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Selamat datang kembali!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl bg-slate-50 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              {s.trend && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${s.up ? 'text-green-600' : 'text-red-500'}`}>
                  {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {s.trend}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-secondary">{s.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent sales */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-secondary">Penjualan Terbaru</h2>
          <a href="/penjualan" className="text-sm text-primary font-medium hover:underline">Lihat semua</a>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">ID</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Pelanggan</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Total</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Waktu</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentSales.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-700">{s.id}</td>
                <td className="px-5 py-3 text-slate-600">{s.customer}</td>
                <td className="px-5 py-3 font-medium text-secondary">{s.total}</td>
                <td className="px-5 py-3 text-slate-500">{s.time}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    s.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {s.status === 'success' ? 'Berhasil' : 'Tertunda'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
