import { api } from "./client";
import type { Pagination } from "./products";

export type BestSellingRow = { name: string; qty: number };
export type SummaryResponse = {
  total_sales?: number;
  total_orders?: number;
  total_products?: number;
  low_stock?: number;
};
export type SalesHistoryRow = { date: string; sales: number };

export async function bestSelling() {
  return api<{ data: BestSellingRow[] } | BestSellingRow[]>("/api/reports/best-selling", { method: "GET" });
}

export async function summary() {
  return api<SummaryResponse | { summary: SummaryResponse }>("/api/reports/summary", { method: "GET" });
}

export async function salesHistory() {
  return api<{ data: SalesHistoryRow[] } | SalesHistoryRow[]>("/api/reports/sales-history", { method: "GET" });
}

export type SellerSalesSummary = {
  today_sales: number | string;
  weekly_sales: number | string;
  monthly_sales: number | string;
  total_orders: number | string;
};

export async function sellerSales(sellerId: string | number) {
  return api<any>(`/api/reports/seller/${sellerId}/sales`, { method: "GET" });
}

export async function salesList(params: { page: number; per_page: number; seller_id?: string | number }) {
  const qs = new URLSearchParams({
    page: String(params.page),
    per_page: String(params.per_page),
  });
  if (params.seller_id !== undefined) qs.set("seller_id", String(params.seller_id));
  return api<{ data?: { orders?: any[]; pagination?: Pagination } } | any>(`/api/reports/sales?${qs.toString()}`, { method: "GET" });
}

