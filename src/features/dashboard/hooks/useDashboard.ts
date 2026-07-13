/**
 * @module dashboard/useDashboard
 * @description Hook untuk mengambil dan mengelola data dashboard.
 */
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/auth-context";
import {
  fetchDailyProfit,
  fetchWeeklyProfit,
  fetchMonthlyProfit,
  fetchMonthlyChart,
  fetchNearExpired,
  fetchTopSelling,
  fetchLeastSelling,
} from "../api/dashboard-api";
import type {
  DailyProfit,
  ProfitSummary,
  MonthlyProfit,
  MonthlyChartItem,
  NearExpiredProduct,
  TopSellingProduct,
  LeastSellingProduct,
} from "../types/dashboard";

/** Shape consumed by dashboard-page.tsx */
export interface DashboardData {
  dailyProfit: { omset: number; profit: number } | null;
  weeklyProfit: { omset: number; profit: number } | null;
  monthlyProfit: { omet: number; profit: number; data: MonthlyChartItem[] } | null;
  monthlyChart: MonthlyChartItem[];
  nearExpired: NearExpiredProduct[];
  topSelling: TopSellingProduct[];
  leastSelling: LeastSellingProduct[];
  profitByUser: ProfitByUserCardProps['data'];
}

/** ProfitByUserCard props type (replicated to avoid circular dep) */
type ProfitByUserCardProps = {
  data: {
    items: { user_name: string; percentage: number; profit?: number; transactions?: number; abv?: number }[];
    total_trano?: number;
    abv?: number;
  } | null;
};

interface UseDashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
}

export function useDashboard(): {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  loadDashboard: () => Promise<void>;
} {
  const { activeToken } = useAuth();

  const [state, setState] = useState<UseDashboardState>({
    data: null,
    isLoading: true,
    error: null,
  });

  const loadDashboard = useCallback(async () => {
    if (!activeToken) {
      setState((prev) => ({ ...prev, isLoading: false, error: "Token tidak tersedia." }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const [dailyRes, weeklyRes, monthlyRes, chartRes, nearExpiredRes, topSellingRes, leastSellingRes] =
        await Promise.allSettled([
          fetchDailyProfit(activeToken),
          fetchWeeklyProfit(activeToken),
          fetchMonthlyProfit(activeToken),
          fetchMonthlyChart(activeToken),
          fetchNearExpired(activeToken),
          fetchTopSelling(activeToken),
          fetchLeastSelling(activeToken),
        ]);

      const ok = <T,>(r: PromiseSettledResult<T>): r is PromiseFulfilledResult<T> => r.status === "fulfilled";
      const val = <T,>(r: PromiseSettledResult<T>, fallback: T) =>
        ok(r) ? (r.value as T) : fallback;

      const daily = val(dailyRes, null as DailyProfit | null);
      const weekly = val(weeklyRes, null as ProfitSummary | null);
      const monthly = val(monthlyRes, null as MonthlyProfit | null);
      const chart = val(chartRes, null as { data: MonthlyChartItem[] } | null);
      const nearExpired = val(nearExpiredRes, null as NearExpiredProduct[] | null);
      const topSelling = val(topSellingRes, null as TopSellingProduct[] | null);
      const leastSelling = val(leastSellingRes, null as LeastSellingProduct[] | null);

      setState({
        data: {
          dailyProfit:
            daily !== null
              ? { omset: daily.total_sales, profit: daily.profit_estimate }
              : null,
          weeklyProfit:
            weekly !== null
              ? { omset: weekly.omset ?? 0, profit: weekly.profit }
              : null,
          monthlyProfit:
            monthly !== null
              ? { omet: monthly.month_sales, profit: monthly.month_profit, data: monthly.data }
              : null,
          monthlyChart: chart?.data ?? [],
          nearExpired: nearExpired ?? [],
          topSelling: topSelling ?? [],
          leastSelling: leastSelling ?? [],
          profitByUser: null,
        },
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error("[useDashboard] Error:", err);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Gagal memuat data dashboard.",
      }));
    }
  }, [activeToken]);

  useEffect(() => {
    if (!activeToken) return;
    void loadDashboard();
  }, [activeToken, loadDashboard]);

  return { data: state.data, isLoading: state.isLoading, error: state.error, loadDashboard };
}
