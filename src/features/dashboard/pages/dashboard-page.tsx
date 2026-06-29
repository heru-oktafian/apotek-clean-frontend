
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
  topHeading,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  topHeading?: boolean;
}) {
  const rawValue = value;
  const needsRp = topHeading;
  // if value already contains Rp prefix, don't add
  const displayValue = (() => {
    if (!needsRp) return rawValue;
    if (typeof rawValue === 'string' && rawValue.trim().toLowerCase().startsWith('rp')) return rawValue;
    return `Rp. ${rawValue}`;
  })();

  return (
    <div className={`stat-card ${topHeading ? 'stat-card--top-heading' : ''}`}>
      <div className={`stat-card__body ${topHeading ? 'stat-card__body--centered' : ''}`}>
        <span className={`stat-card__label ${topHeading ? 'stat-card__title-top' : ''}`}>{label}</span>
        {topHeading ? (
          <div className="stat-card__top-heading-row">
            <div className="stat-card__icon stat-card__icon--centered" style={{ background: color }}>
              <Icon size={20} />
            </div>
            <strong className="stat-card__value stat-card__value--inline stat-card__value--large">{displayValue}</strong>
          </div>
        ) : (
          <>
            <strong className="stat-card__value">{rawValue}</strong>
            {sub && <span className="stat-card__sub">{sub}</span>}
          </>
        )}
        {topHeading && sub && <span className="stat-card__sub">{sub}</span>}
      </div>
      {!topHeading && (
        <div className="stat-card__icon" style={{ background: color }}>
          <Icon size={20} />
        </div>
      )}
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
        <span className="stat-card__label">Omset & Profit Minggu Ini</span>
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

function ProfitByUserCard({
  data,
}: {
  data: { items: { user_name: string; percentage: number; profit?: number; transactions?: number; abv?: number }[]; total_trano?: number; abv?: number } | null;
}) {
  if (!data || data.items.length === 0) {
    return (
      <div className="stat-card">
        <div className="stat-card__body" style={{ width: '100%' }}>
          <span className="stat-card__label">Profit Hari Ini per User</span>
          <div style={{ padding: '1rem 0' }}>Belum ada data</div>
        </div>
      </div>
    );
  }

  const derivedTotalTrano = data.items.reduce((sum, item) => sum + (item.transactions ?? 0), 0);
  const derivedAbv = (() => {
    const totalTrano = data.items.reduce((sum, item) => sum + (item.transactions ?? 0), 0);
    if (totalTrano === 0) return undefined;
    const weightedAbv = data.items.reduce(
      (sum, item) => sum + (item.abv ?? 0) * (item.transactions ?? 0),
      0
    );
    return Math.round(weightedAbv / totalTrano);
  })();

  const displayTrano =
    typeof data.total_trano === 'number' && data.total_trano > 0 ? data.total_trano : derivedTotalTrano || undefined;
  const displayAbv =
    typeof data.abv === 'number' && data.abv > 0 ? data.abv : derivedAbv;

  return (
    <div className="profit-by-user-card">
      <div className="profit-by-user-card__header">
        <span className="stat-card__label">Profit Hari Ini per User</span>
      </div>
      <div className="profit-by-user-card__content">
        <div className="profit-by-user-card__chart-area">
          {data.items.slice(0, 4).map((item) => (
            <div key={item.user_name} className="profit-by-user-card__row">
              <div className="profit-by-user-card__row-main">
                <span className="profit-by-user-card__user">{item.user_name}</span>
                <span className="profit-by-user-card__percentage">{item.percentage}%</span>
              </div>
              <div className="profit-by-user-card__bar-wrapper">
                <div
                  className="profit-by-user-card__bar"
                  style={{ width: `${Math.min(Math.max(item.percentage, 0), 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="profit-by-user-card__info-panel">
          <div className="profit-by-user-card__info-item">
            <span>Trano</span>
            <strong>{displayTrano ?? '-'}</strong>
          </div>
          <div className="profit-by-user-card__info-item">
            <span>ABV</span>
            <strong>{displayAbv ? `Rp ${formatNumber(displayAbv)}` : '-'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [hideRefreshFab, setHideRefreshFab] = useState(false)

  const {
    dailyProfit,
    weeklyProfit,
    monthlyProfit,
    profitByUser,
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
          color="#3b82f6"
          topHeading
        />
        <StatCard
          icon={TrendingUp}
          label="Profit Hari Ini"
          value={loading ? '—' : formatNumber(dailyProfit?.profit_estimate ?? 0)}
          color="#10b981"
          topHeading
        />
        <div className="weekly-profit-card-container">
          <WeeklyProfitCard weeklyProfit={weeklyProfit} />
        </div>
        <ProfitByUserCard data={profitByUser} />
      </div>

      {/* Chart */}
      {!loading && chartData.length > 0 && (
        <div className="chart-card">
          <h2 className="chart-card__title stat-card__label">Tren Bulanan</h2>
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
