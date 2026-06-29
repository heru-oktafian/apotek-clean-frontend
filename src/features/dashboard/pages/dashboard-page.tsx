
import { DollarSign, TrendingUp, BarChart2, Activity, Menu, X } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useEffect, useState } from 'react'
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

function WeeklyProfitCard({ weeklyProfit }: { weeklyProfit: { profit?: number; omset?: number; total_hpp?: number } | null }) {
  const profit = weeklyProfit?.profit ?? 0;
  const omset = weeklyProfit?.omset ?? 0;
  const hpp = weeklyProfit?.total_hpp ?? 0;
  const innerTotal = profit + hpp;
  const profitPct = innerTotal > 0 ? Math.round((profit / innerTotal) * 100) : 0;
  const hppPct = innerTotal > 0 ? Math.round((hpp / innerTotal) * 100) : 0;
  const safeOmset = omset > 0 ? omset : 1;
  const safeProfit = profit > 0 ? profit : 1;
  const safeHpp = hpp > 0 ? hpp : 1;

  const outerData = [{ name: 'Omset', value: safeOmset }];
  const innerData = [
    { name: 'Profit', value: safeProfit },
    { name: 'HPP', value: safeHpp },
  ];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0];
    const value = Number(item.value);
    const pct = item.name === 'Omset' ? 100 : item.name === 'Profit' ? profitPct : hppPct;
    return (
      <div className="weekly-profit-card__tooltip">
        <div className="weekly-profit-card__tooltip-name">{item.name}</div>
        <div className="weekly-profit-card__tooltip-value">{formatNumber(value)} · {pct}%</div>
      </div>
    );
  };

  return (
    <div className="weekly-profit-card">
      <div className="weekly-profit-card__header">
        <span className="weekly-profit-card__label">Omset & Profit Minggu Ini</span>
      </div>
      <div className="weekly-profit-card__body">
        <div className="weekly-profit-card__chart-area">
          <div className="weekly-profit-card__icon-box">
            <Activity size={18} />
          </div>
          <div className="weekly-profit-card__chart-wrapper">
            <ResponsiveContainer width={150} height={150}>
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={outerData}
                  dataKey="value"
                  innerRadius={44}
                  outerRadius={56}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  <Cell fill="#4f46e5" />
                </Pie>
                <Pie
                  data={innerData}
                  dataKey="value"
                  innerRadius={28}
                  outerRadius={40}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#6366f1" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="weekly-profit-card__center-label">{profitPct}%</div>
          </div>
        </div>
        <div className="weekly-profit-card__info-block">
          <div className="weekly-profit-card__info-list">
            <div className="weekly-profit-card__info-item">
              <span>Omset</span>
              <strong>{formatNumber(omset)}</strong>
            </div>
            <div className="weekly-profit-card__info-item">
              <span>Profit</span>
              <strong>{formatNumber(profit)}</strong>
            </div>
            <div className="weekly-profit-card__info-item">
              <span>HPP</span>
              <strong>{formatNumber(hpp)}</strong>
            </div>
          </div>
        </div>
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
  const [hideRefreshFab, setHideRefreshFab] = useState(false)

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

  useEffect(() => {
    const handleToggle = (event: Event) => {
      const customEvent = event as CustomEvent<{ showMore: boolean }>;
      setHideRefreshFab(Boolean(customEvent.detail?.showMore));
    };

    document.addEventListener('mobile-bottom-bar-toggle', handleToggle);
    return () => {
      document.removeEventListener('mobile-bottom-bar-toggle', handleToggle);
    };
  }, []);

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
        <div className="weekly-profit-card-container">
          <WeeklyProfitCard weeklyProfit={weeklyProfit} />
        </div>
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

      <button
        type="button"
        className={`dashboard-refresh-fab${hideRefreshFab ? ' dashboard-refresh-fab--hidden' : ''}`}
        onClick={refresh}
        disabled={loading}
        aria-label={loading ? 'Memuat...' : 'Refresh dashboard'}
      >
        ↻
      </button>

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
