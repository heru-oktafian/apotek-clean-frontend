// ── Daily Profit ───────────────────────────────────────────────────────────
// GET /api/dashboard/daily-profit-report
// Response: { data: { report_date, total_sales, profit_estimate } }
export interface DailyProfit {
  report_date: string;
  total_sales: number;
  profit_estimate: number;
  qty_transactions?: number;
  profit_percentage?: number;
}

// ── Weekly Profit ───────────────────────────────────────────────────────────
// GET /api/dashboard/weekly-profit-report
// Response: { data: [{ omset, profit, total_hpp, profit_percentage }] }
export interface ProfitSummary {
  omset?: number;
  profit: number;
  total_hpp?: number;
  profit_percentage?: number;
  hpp_percentage?: number;
  qty_transactions?: number;
}

// ── Monthly Profit ──────────────────────────────────────────────────────────
// GET /api/dashboard/monthly-profit-report
// Response: { data: { data: [...daily items], month_sales, month_profit } }
export interface MonthlyProfit {
  data: MonthlyChartItem[];
  month_sales: number;
  month_profit: number;
  qty_transactions?: number;
}

export interface ProfitTodayByUserItem {
  user_name: string;
  percentage: number;
  profit?: number;
  transactions?: number;
  abv?: number;
}

export interface ProfitTodayByUserData {
  items: ProfitTodayByUserItem[];
  total_trano?: number;
  abv?: number;
}

// ── Monthly Chart Item ──────────────────────────────────────────────────────
// Each item from /api/dashboard/monthly-profit-report → data array
export interface MonthlyChartItem {
  report_date: string;  // "02", "03", etc.
  total_sales: number;  // Omset
  profit_estimate: number; // Profit
  label?: string;       // computed: "02"
  omset?: number;       // alias for total_sales
  profit?: number;      // alias for profit_estimate
}

// ── Near Expired Products ───────────────────────────────────────────────────
export interface NearExpiredProduct {
  id: string;
  sku: string;
  name: string;
  unit: string;
  expired_date: string;
  stock: number;
}

// ── Top Selling ─────────────────────────────────────────────────────────────
export interface TopSellingProduct {
  product_id: string;
  name: string;
  qty_sold: number;
  sku?: string;
}

// ── Least Selling ───────────────────────────────────────────────────────────
export interface LeastSellingProduct {
  product_id: string;
  name: string;
  qty_sold: number;
  stock?: number;
  sku?: string;
}

export type ProductSummary = TopSellingProduct | LeastSellingProduct;

// ── Purchases ───────────────────────────────────────────────────────────────
export interface PurchaseRecord {
  id: string;
  invoice: string;
  supplier_name?: string;
  supplier?: string;
  total: number;
  created_at: string;
}

// ── Sales ───────────────────────────────────────────────────────────────────
export interface SaleRecord {
  id: string;
  invoice: string;
  customer_name?: string;
  total: number;
  created_at: string;
}
