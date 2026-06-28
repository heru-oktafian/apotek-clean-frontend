import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/auth-context';
import type {
  DailyProfit,
  ProfitSummary,
  NearExpiredProduct,
  ProductSummary,
  MonthlyChartItem,
} from '../types/dashboard';
import {
  fetchDailyProfit,
  fetchWeeklyProfit,
  fetchMonthlyProfit,
  fetchMonthlyChart,
  fetchNearExpired,
  fetchTopSelling,
  fetchLeastSelling,
  fetchPurchases,
  fetchSales,
} from '../api/dashboard-api';

interface DashboardData {
  dailyProfit: DailyProfit | null;
  weeklyProfit: ProfitSummary | null;
  monthlyProfit: any | null;
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
        fetchMonthlyChart(activeToken),
        fetchNearExpired(activeToken),
        fetchTopSelling(activeToken),
        fetchLeastSelling(activeToken),
        fetchPurchases(activeToken, 1, 5),
        fetchSales(activeToken, 1, 5),
      ]).then((results) => results.map((r) => (r.status === 'fulfilled' ? r.value : null)));

      setData({
        dailyProfit: dailyProfit ?? null,
        weeklyProfit: weeklyProfit ?? null,
        monthlyProfit: monthlyProfit ?? null,
        monthlyChart: monthlyChart ?? [],
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
