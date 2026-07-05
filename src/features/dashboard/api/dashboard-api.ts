import { apiRequest } from '../../../lib/api/client';
import type {
  DailyProfit,
  ProfitSummary,
  NearExpiredProduct,
  ProductSummary,
  MonthlyChartItem,
  ProfitTodayByUserData,
  ProfitTodayByUserItem,
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

// ── Widget: Profit Hari Ini per User ─────────────────────────────────────────
export const fetchProfitTodayByUser = async (token: string) => {
  const res = await apiRequest<{ data: any }>(
    '/api/dashboard/profit-today-by-user',
    { token }
  );
  const raw = res;
  const payload = raw?.data ?? raw;
  const result: ProfitTodayByUserData = { items: [] };

  const parseLocalizedNumber = (value: any) => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return undefined;

    const sanitized = value
      .replace(/Rp|IDR|%|\s/g, '')
      .replace(/,/g, '.')
      .replace(/[^0-9.\-]/g, '');

    if (!sanitized) return undefined;

    const dotCount = (sanitized.match(/\./g) || []).length;
    if (dotCount > 1) {
      const clean = sanitized.replace(/\./g, '');
      const num = Number(clean);
      return Number.isFinite(num) ? num : undefined;
    }

    const num = Number(sanitized);
    return Number.isFinite(num) ? num : undefined;
  };

  const getNumber = (source: any, keys: string[]) => {
    if (!source || typeof source !== 'object') return undefined;
    for (const key of keys) {
      const value = source[key];
      const parsed = parseLocalizedNumber(value);
      if (parsed !== undefined) return parsed;
    }
    return undefined;
  };

  const normalizeItem = (item: any) => {
    if (!item || typeof item !== 'object') return null;
    const container = item?.data ?? item?.payload ?? item;

    return {
      user_name: String(container.user_name ?? container.name ?? container.username ?? container.user ?? '').trim(),
      percentage: getNumber(container, [
        'profit_percentage',
        'percentage',
        'percent',
        'share',
        'contribution_percentage',
      ]) ?? 0,
      profit: getNumber(container, ['profit', 'total_profit', 'sales', 'revenue', 'amount']) ?? 0,
      transactions: getNumber(container, [
        'qty_transactions',
        'transactions',
        'trano',
        'total_transactions',
        'total_trano',
        'transaction_count',
        'count',
      ]) ?? 0,
      abv: getNumber(container, [
        'abv_transactions',
        'abv',
        'ABV',
        'avg_value',
        'average_basket_value',
        'average_basket',
        'basket_value',
      ]) ?? 0,
    } as ProfitTodayByUserItem;
  };

  const itemsSource = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload)
    ? payload
    : [];

  result.items = itemsSource
    .map(normalizeItem)
    .filter((item: ProfitTodayByUserItem | null): item is ProfitTodayByUserItem => item !== null && item.user_name !== '');

  const itemTotalTransactions = result.items.reduce((sum, item) => sum + (item.transactions || 0), 0);
  const itemWeightedAbv = result.items.reduce(
    (sum, item) => sum + (item.abv || 0) * (item.transactions || 0),
    0
  );
  const itemAverageAbv = itemTotalTransactions > 0 ? Math.round(itemWeightedAbv / itemTotalTransactions) : undefined;

  const resolvedTotalTrano = getNumber(payload, [
    'qty_transactions',
    'total_transactions',
    'trano',
    'total_trano',
    'transactions',
    'count',
  ]);
  result.total_trano = resolvedTotalTrano ?? (itemTotalTransactions || undefined);

  const resolvedAbv = getNumber(payload, [
    'abv_transactions',
    'abv',
    'ABV',
    'avg_value',
    'average_basket_value',
    'average_basket',
    'basket_value',
  ]);
  result.abv = resolvedAbv ?? itemAverageAbv ?? undefined;

  return result;
};

// ── Chart: Tren Profit Bulanan ───────────────────────────────────────────
// GET /api/dashboard/monthly-profit-report
// Returns raw data array for dual-line chart (Omset + Profit)
export const fetchMonthlyChart = async (token: string) => {
  const res = await apiRequest<any>(
    '/api/dashboard/monthly-profit-report',
    { token }
  );

  const payload = res?.data ?? res;

  const itemsSource = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload)
    ? payload
    : [];

  return itemsSource.map((item: any) => ({
    report_date: item?.report_date ?? item?.date ?? item?.label ?? String(item?.day ?? ''),
    omset: Number(item?.total_sales ?? item?.omset ?? item?.sales ?? item?.total ?? 0) || 0,
    profit: Number(item?.profit_estimate ?? item?.profit ?? item?.profit_amount ?? 0) || 0,
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
