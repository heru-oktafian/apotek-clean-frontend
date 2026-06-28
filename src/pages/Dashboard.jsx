import React, { useEffect, useState } from 'react';
import { Card, CardTitle } from '../components/ui';
import { transactions, products, stock } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, transactions: 0, revenue: 0, lowStock: 0 });
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      products.list({ limit: 100 }),
      transactions.list({ limit: 5, type: 'sale' }),
    ])
      .then(([pData, tData]) => {
        const today = new Date().toDateString();
        const todayTx = (tData.data || []).filter(
          (t) => new Date(t.created_at).toDateString() === today
        );
        setStats({
          products: pData.total || pData.data?.length || 0,
          transactions: todayTx.length,
          revenue: todayTx.reduce((s, t) => s + (t.total || 0), 0),
          lowStock: 0,
        });
        setRecentSales(tData.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Produk', value: stats.products, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', color: 'text-blue-600 bg-blue-50' },
    { label: 'Transaksi Hari Ini', value: stats.transactions, icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z', color: 'text-green-600 bg-green-50' },
    { label: 'Pendapatan Hari Ini', value: `Rp ${stats.revenue.toLocaleString('id-ID')}`, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Stok Rendah', value: stats.lowStock, icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', color: 'text-red-600 bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${c.color}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={c.icon} />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{loading ? '-' : c.value}</p>
              <p className="text-sm text-gray-500">{c.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardTitle className="mb-4">Transaksi Terbaru</CardTitle>
        {recentSales.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">Belum ada transaksi hari ini</p>
        ) : (
          <div className="space-y-3">
            {recentSales.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">#{tx.id}</p>
                  <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleString('id-ID')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">Rp {(tx.total || 0).toLocaleString('id-ID')}</p>
                  <p className="text-xs text-gray-500 capitalize">{tx.status || 'completed'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
