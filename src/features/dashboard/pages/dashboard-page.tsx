
import { DollarSign, TrendingUp, BarChart2, Activity, Menu, X } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useDashboard } from '../hooks/useDashboard';
import { formatNumber } from '../../../lib/format-currency';

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-card__icon" style={{ background: color }}>
        <Icon size={20} />
      </div>
      <div className="stat-card__body">
        <span className="stat-card__label">{label}</span>
        <strong className="stat-card__value">{value}</strong>
        {sub && <span className="stat-card__sub">{sub}</span>}
      </div>
    </div>
  );
}

function fmtDate(dateStr: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function DashboardPage() {

  const {
    dailyProfit,
    weeklyProfit,
    monthlyProfit,
    monthlyChart,
    nearExpired,
    topSelling,
    leastSelling,
    purchases,
    sales,
    loading,
    error,
    refresh,
  } = useDashboard();

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
        <p>{error}</p>
        <button onClick={refresh}>Coba lagi</button>
      </div>
    );
  }

  const chartData = (monthlyChart ?? []).map((item) => ({
    date: item.report_date,
    omset: item.omset,
    profit: item.profit,
  }));

  return (
    <div className="dashboard-shell__main">
      {/* Content Header */}
      <div className="content-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h1 className="page-header__title">Dashboard</h1>
            <p className="page-header__subtitle">Ringkasan performa apotek</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-h)' }}>Apotek Vimedika</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cabang Utama</div>
          </div>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: '#22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: 700,
            flexShrink: 0,
          }}>A</div>
          <button
            className="btn btn--secondary"
            onClick={refresh}
            disabled={loading}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
          >
            {loading ? 'Memuat...' : '↻ Refresh'}
          </button>
        </div>
      </div>


      {/* Stat Cards */}
      <div className="stat-cards">
        <StatCard
          icon={DollarSign}
          label="Omset Hari Ini"
          value={loading ? '—' : formatNumber(dailyProfit?.total_sales ?? 0)}
          sub={`${dailyProfit?.qty_transactions ?? 0} transaksi`}
          color="#3b82f6"
        />
        <StatCard
          icon={TrendingUp}
          label="Profit Hari Ini"
          value={loading ? '—' : formatNumber(dailyProfit?.profit_estimate ?? 0)}
          sub={`Margin ${dailyProfit?.profit_percentage ?? 0}%`}
          color="#10b981"
        />
        <StatCard
          icon={Activity}
          label="Profit Minggu Ini"
          value={loading ? '—' : formatNumber(weeklyProfit?.profit ?? 0)}
          sub={`${weeklyProfit?.qty_transactions ?? 0} transaksi`}
          color="#8b5cf6"
        />
        <StatCard
          icon={BarChart2}
          label="Profit Bulan Ini"
          value={loading ? '—' : formatNumber(monthlyProfit?.month_profit ?? 0)}
          sub={`${monthlyProfit?.qty_transactions ?? 0} transaksi`}
          color="#f59e0b"
        />
      </div>

      {/* Chart */}
      {!loading && chartData.length > 0 && (
        <div className="chart-card">
          <h2 className="chart-card__title">Tren Bulanan</h2>
          <div className="chart-card__body">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => formatNumber(v)} />
                <Tooltip
                  formatter={(v: any, name: any) => [
                    formatNumber(Number(v)),
                    name === 'omset' ? 'Omset' : 'Profit',
                  ]}
                  contentStyle={{
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-h)',
                  }}
                  labelStyle={{ color: 'var(--text-h)' }}
                />
                <Line
                  type="monotone"
                  dataKey="omset"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="omset"
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="profit"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tables Grid */}
      <div className="tables-grid">
        {/* Pembelian */}
        <div className="table-card">
          <h2 className="table-card__title">Pembelian Terbaru</h2>
          {loading ? (
            <div className="table-card__empty">Memuat...</div>
          ) : purchases.length === 0 ? (
            <div className="table-card__empty">Belum ada data</div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Supplier</th>
                    <th>Total</th>
                    <th>Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((p: any) => (
                    <tr key={p.id}>
                      <td><span className="invoice-badge">{p.invoice}</span></td>
                      <td>{p.supplier_name || p.supplier || '—'}</td>
                      <td>{formatNumber(p.total ?? 0)}</td>
                      <td>{fmtDate(p.created_at ?? p.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Penjualan */}
        <div className="table-card">
          <h2 className="table-card__title">Penjualan Terbaru</h2>
          {loading ? (
            <div className="table-card__empty">Memuat...</div>
          ) : sales.length === 0 ? (
            <div className="table-card__empty">Belum ada data</div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Pelanggan</th>
                    <th>Total</th>
                    <th>Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s: any) => (
                    <tr key={s.id}>
                      <td><span className="invoice-badge">{s.invoice}</span></td>
                      <td>{s.customer_name || '—'}</td>
                      <td>{formatNumber(s.total ?? 0)}</td>
                      <td>{fmtDate(s.created_at ?? s.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Bottom 3 Cards */}
      <div className="tables-grid tables-grid--3">
        {/* Fast Moving */}
        <div className="table-card">
          <h2 className="table-card__title">🔥 Fast Moving</h2>
          {loading ? (
            <div className="table-card__empty">Memuat...</div>
          ) : topSelling.length === 0 ? (
            <div className="table-card__empty">Belum ada data</div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>Terjual</th>
                  </tr>
                </thead>
                <tbody>
                  {topSelling.map((p: any, i: number) => (
                    <tr key={p.product_id || i}>
                      <td>{p.name}</td>
                      <td><strong>{p.qty_sold ?? 0}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Slow Moving */}
        <div className="table-card">
          <h2 className="table-card__title">🐌 Slow Moving</h2>
          {loading ? (
            <div className="table-card__empty">Memuat...</div>
          ) : leastSelling.length === 0 ? (
            <div className="table-card__empty">Belum ada data</div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>Terjual</th>
                  </tr>
                </thead>
                <tbody>
                  {leastSelling.map((p: any, i: number) => (
                    <tr key={p.product_id || i}>
                      <td>{p.name}</td>
                      <td><strong>{p.qty_sold ?? 0}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Near Expired */}
        <div className="table-card">
          <h2 className="table-card__title">⚠️ Near Expired</h2>
          {loading ? (
            <div className="table-card__empty">Memuat...</div>
          ) : nearExpired.length === 0 ? (
            <div className="table-card__empty">Tidak ada</div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>Exp</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {nearExpired.map((p: any) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td style={{ color: '#f59e0b' }}>{fmtDate(p.expired_date)}</td>
                      <td>{p.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
