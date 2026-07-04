import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/auth-context';
import type {
  DailyProfit,
  ProfitSummary,
  NearExpiredProduct,
  ProductSummary,
  MonthlyChartItem,
  ProfitTodayByUserData,
} from '../types/dashboard';
import {
  fetchDailyProfit,
  fetchWeeklyProfit,
  fetchMonthlyProfit,
  fetchMonthlyChart,
  fetchNearExpired,
  fetchTopSelling,
  fetchLeastSelling,
  fetchProfitTodayByUser,
  fetchPurchases,
  fetchSales,
} from '../api/dashboard-api';

// ═══════════════════════════════════════════════════════════════════════════
// Dashboard Data Fetching Hook
// ═══════════════════════════════════════════════════════════════════════════
// Fetch 9 endpoint API secara paralel untuk dashboard:
// 1. Daily profit (omset + profit hari ini)
// 2. Weekly profit (profit minggu ini)
// 3. Monthly profit (profit bulan ini)
// 4. Monthly chart (data tren 30 hari)
// 5. Near expired products
// 6. Top selling products
// 7. Least selling products
// 8. Recent purchases (5 terakhir)
// 9. Recent sales (5 terakhir)
//
// Error Handling:
// - Gunakan Promise.allSettled (bukan Promise.all)
// - Jika 1 endpoint error, yang lain tetap diproses
// - Error hanya ditampilkan jika SEMUA endpoint gagal
//
// Refresh:
// - User bisa trigger refetch manual dengan tombol Refresh
// - Semua 9 endpoint di-fetch ulang bersamaan
// ═══════════════════════════════════════════════════════════════════════════

interface DashboardData {
  dailyProfit: DailyProfit | null;
  weeklyProfit: ProfitSummary | null;
  monthlyProfit: any | null;
  profitByUser: ProfitTodayByUserData | null;
  monthlyChart: MonthlyChartItem[];
  nearExpired: NearExpiredProduct[];
  topSelling: ProductSummary[];
  leastSelling: ProductSummary[];
  purchases: any[];
  sales: any[];
}

interface UseDashboardReturn extends DashboardData {
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDashboard(): UseDashboardReturn {
  const { activeToken } = useAuth();
  const [data, setData] = useState<DashboardData>({
    dailyProfit: null,
    weeklyProfit: null,
    monthlyProfit: null,
    profitByUser: null,
    monthlyChart: [],
    nearExpired: [],
    topSelling: [],
    leastSelling: [],
    purchases: [],
    sales: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!activeToken) return;
    setLoading(true);
    setError(null);

    try {
      const [
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
      ] = await Promise.allSettled([
        fetchDailyProfit(activeToken),
        fetchWeeklyProfit(activeToken),
        fetchMonthlyProfit(activeToken),
        fetchProfitTodayByUser(activeToken),
        fetchMonthlyChart(activeToken),
        fetchNearExpired(activeToken),
        fetchTopSelling(activeToken),
        fetchLeastSelling(activeToken),
        fetchPurchases(activeToken, 1, 5),
        fetchSales(activeToken, 1, 5),
      ]).then((results) => results.map((r) => (r.status === 'fulfilled' ? r.value : null)));

      const resolvedMonthlyChart = Array.isArray(monthlyChart)
        ? monthlyChart
        : Array.isArray(monthlyProfit?.data)
        ? (monthlyProfit?.data ?? []).map((item: any) => ({
            report_date: item?.report_date ?? item?.date ?? item?.label ?? String(item?.day ?? ''),
            omset: Number(item?.total_sales ?? item?.omset ?? item?.sales ?? item?.total ?? 0) || 0,
            profit: Number(item?.profit_estimate ?? item?.profit ?? item?.profit_amount ?? 0) || 0,
          }))
        : [];

      setData({
        dailyProfit: dailyProfit ?? null,
        weeklyProfit: weeklyProfit ?? null,
        monthlyProfit: monthlyProfit ?? null,
        profitByUser: profitByUser ?? null,
        monthlyChart: resolvedMonthlyChart,
        nearExpired: nearExpired ?? [],
        topSelling: topSelling ?? [],
        leastSelling: leastSelling ?? [],
        purchases: Array.isArray(purchases) ? purchases : (purchases?.data ?? []),
        sales: Array.isArray(sales) ? sales : (sales?.data ?? []),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  }, [activeToken]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...data, loading, error, refresh: load };
}
