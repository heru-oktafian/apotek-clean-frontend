import { apiRequest } from '../../../lib/api/client';
import type {
  DailyProfit,
  ProfitSummary,
  NearExpiredProduct,
  ProductSummary,
  MonthlyChartItem,
  PurchaseRecord,
  SaleRecord,
} from '../types/dashboard';

// ── Widget: Omset + Profit Harian ────────────────────────────────────────
// GET /api/dashboard/daily-profit-report
export const fetchDailyProfit = async (token: string) => {
  const res = await apiRequest<{ data: DailyProfit }>(
    '/api/dashboard/daily-profit-report',
    { token }
  );
  return res.data;
};

// ── Widget: Profit Mingguan ──────────────────────────────────────────────
// GET /api/dashboard/weekly-profit-report
export const fetchWeeklyProfit = async (token: string) => {
  const res = await apiRequest<{ data: ProfitSummary[] }>(
    '/api/dashboard/weekly-profit-report',
    { token }
  );
  return Array.isArray(res.data) ? res.data[0] : res.data;
};

// ── Widget: Profit Bulanan ────────────────────────────────────────────────
// GET /api/dashboard/monthly-profit-report
export const fetchMonthlyProfit = async (token: string) => {
  const res = await apiRequest<{ data: any }>(
    '/api/dashboard/monthly-profit-report',
    { token }
  );
  return res.data;
};

// ── Chart: Tren Profit Bulanan ───────────────────────────────────────────
// GET /api/dashboard/monthly-profit-report
// Returns raw data array for dual-line chart (Omset + Profit)
export const fetchMonthlyChart = async (token: string) => {
  const res = await apiRequest<{ data: { data: MonthlyChartItem[] } }>(
    '/api/dashboard/monthly-profit-report',
    { token }
  );
  // Transform: total_sales → omset, profit_estimate → profit
  return (res.data?.data ?? []).map((item) => ({
    report_date: item.report_date,
    omset: item.total_sales,
    profit: item.profit_estimate,
  }));
};

// ── Widget: Near Expired Products ─────────────────────────────────────────
export const fetchNearExpired = async (token: string) => {
  const res = await apiRequest<{ data: NearExpiredProduct[] }>(
    '/api/dashboard/neared-report',
    { token }
  );
  return res.data ?? [];
};

// ── Widget: Fast Moving ───────────────────────────────────────────────────
export const fetchTopSelling = async (token: string) => {
  const res = await apiRequest<{ data: Array<{ ProductID: string; Name: string; TotalQty: number }> }>(
    '/api/dashboard/top-selling-report',
    { token }
  );
  return (res.data ?? []).map((item) => ({
    product_id: item.ProductID,
    name: item.Name,
    qty_sold: item.TotalQty,
  })) as ProductSummary[];
};

// ── Widget: Slow Moving ───────────────────────────────────────────────────
export const fetchLeastSelling = async (token: string) => {
  const res = await apiRequest<{ data: Array<{ product_id: string; product_name: string; stock: number; total_sold: number }> }>(
    '/api/dashboard/least-selling-report',
    { token }
  );
  return (res.data ?? []).map((item) => ({
    product_id: item.product_id,
    name: item.product_name,
    qty_sold: item.total_sold,
    stock: item.stock,
  })) as ProductSummary[];
};

// ── Pembelian Terbaru ──────────────────────────────────────────────────────
export const fetchPurchases = async (token: string, page = 1, perPage = 5) => {
  const res = await apiRequest<{ data: PurchaseRecord[] }>(
    `/api/purchases?page=${page}&per_page=${perPage}`,
    { token }
  );
  return res.data ?? [];
};

// ── Penjualan Terbaru ──────────────────────────────────────────────────────
export const fetchSales = async (token: string, page = 1, perPage = 5) => {
  const res = await apiRequest<{ data: SaleRecord[] }>(
    `/api/sales?page=${page}&per_page=${perPage}`,
    { token }
  );
  return res.data ?? [];
};
