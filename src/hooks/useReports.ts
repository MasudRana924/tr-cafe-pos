import { useQuery } from "@tanstack/react-query";
import * as reportsApi from "@/api/reports";

function toNumber(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export type SummaryAnalytics = {
  total_revenue: number;
  total_products_sold: number;
  total_orders: number;
};

export type BestSellingRowUi = { name: string; qty: number };

export type SalesSummary = {
  today_sales: number;
  weekly_sales: number;
  monthly_sales: number;
};

function unwrapSummary(res: any): SummaryAnalytics {
  const a = res?.data?.analytics ?? res?.analytics ?? res?.data ?? res;
  return {
    total_revenue: toNumber(a?.total_revenue),
    total_products_sold: toNumber(a?.total_products_sold),
    total_orders: toNumber(a?.total_orders),
  };
}

function unwrapBestSelling(res: any): BestSellingRowUi[] {
  const rows = res?.data?.best_selling ?? res?.best_selling ?? res?.data ?? res ?? [];
  if (!Array.isArray(rows)) return [];
  return rows.map((r: any) => ({
    name: String(r?.name ?? "Item"),
    qty: toNumber(r?.total_sold ?? r?.qty),
  }));
}

function unwrapSalesSummary(res: any): SalesSummary {
  const s = res?.data?.sales ?? res?.sales ?? res?.data ?? res ?? {};
  return {
    today_sales: toNumber(s?.today_sales),
    weekly_sales: toNumber(s?.weekly_sales),
    monthly_sales: toNumber(s?.monthly_sales),
  };
}

export type SalesHistoryChartRow = { date: string; sales: number };

/** Full `/api/reports/sales-history` parse: `data.sales` KPIs + optional time-series rows if backend sends them. */
function unwrapSalesHistoryFull(res: any): { summary: SalesSummary; chartRows: SalesHistoryChartRow[] } {
  const summary = unwrapSalesSummary(res);
  const d = res?.data;
  let rowsRaw: any[] = [];
  if (Array.isArray(d)) {
    rowsRaw = d;
  } else if (d && typeof d === "object") {
    if (Array.isArray(d.history)) rowsRaw = d.history;
    else if (Array.isArray(d.chart)) rowsRaw = d.chart;
    else if (Array.isArray(d.rows)) rowsRaw = d.rows;
    else if (Array.isArray(d.series)) rowsRaw = d.series;
  }
  const chartRows: SalesHistoryChartRow[] = rowsRaw
    .map((r: any) => ({
      date: String(r?.date ?? r?.day ?? ""),
      sales: toNumber(r?.sales ?? r?.amount),
    }))
    .filter((r) => r.date.length > 0);
  return { summary, chartRows };
}

export function useBestSellingQuery(opts?: { refetchOnMount?: "always" | boolean }) {
  return useQuery({
    queryKey: ["reports", "best-selling"],
    queryFn: async () => unwrapBestSelling(await reportsApi.bestSelling()),
    staleTime: 0,
    refetchOnMount: opts?.refetchOnMount ?? true,
    refetchOnWindowFocus: false,
  });
}

export function useSummaryQuery(opts?: { refetchOnMount?: "always" | boolean }) {
  return useQuery({
    queryKey: ["reports", "summary"],
    queryFn: async () => unwrapSummary(await reportsApi.summary()),
    staleTime: 0,
    refetchOnMount: opts?.refetchOnMount ?? true,
    refetchOnWindowFocus: false,
  });
}

export function useSalesHistoryQuery(opts?: { refetchOnMount?: "always" | boolean }) {
  return useQuery({
    queryKey: ["reports", "sales-history"],
    queryFn: async () => unwrapSalesHistoryFull(await reportsApi.salesHistory()),
    staleTime: 0,
    refetchOnMount: opts?.refetchOnMount ?? true,
    refetchOnWindowFocus: false,
  });
}

