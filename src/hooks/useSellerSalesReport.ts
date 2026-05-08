import { useQuery } from "@tanstack/react-query";
import * as reportsApi from "@/api/reports";
import type { Pagination } from "@/api/products";
import type { Order } from "@/types/models";
import { PaymentMethod } from "@/types/enums";

function toNumber(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export type SellerSalesCards = {
  today_sales: number;
  weekly_sales: number;
  monthly_sales: number;
  total_orders: number;
};

export function useSellerSalesCardsQuery(input: { sellerId: string | number | ""; enabled?: boolean }) {
  const sid = input.sellerId === "" ? "" : String(input.sellerId);
  const enabled = input.enabled ?? Boolean(sid);
  return useQuery({
    queryKey: ["reports", "seller-sales", sid],
    enabled,
    queryFn: async () => {
      const res = await reportsApi.sellerSales(sid);
      // Backend: { data: { sales: { today_sales, weekly_sales, ... } } }
      const s = res?.data?.sales ?? res?.sales ?? res?.data ?? res;
      return {
        today_sales: toNumber(s?.today_sales),
        weekly_sales: toNumber(s?.weekly_sales),
        monthly_sales: toNumber(s?.monthly_sales),
        total_orders: toNumber(s?.total_orders),
      } as SellerSalesCards;
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
}

function normalizeOrderRow(o: any): Order {
  const createdAt = o?.createdAt ?? o?.created_at ?? new Date().toISOString();
  const itemsRaw = o?.items ?? [];
  const items = itemsRaw.map((it: any) => ({
    productId: String(it.product_id ?? it.productId ?? it.id ?? ""),
    name: String(it.name ?? "Item"),
    price: Number(it.price ?? 0),
    qty: Number(it.quantity ?? it.qty ?? 0),
  }));

  const subtotalFromItems = items.reduce((a: number, b: any) => a + Number(b.price ?? 0) * Number(b.qty ?? 0), 0);
  const subtotal = Number(o?.total_before_discount ?? o?.subtotal ?? subtotalFromItems);
  const discount = toNumber(o?.discount ?? 0);
  const total = Number(o?.total ?? o?.total_amount ?? Math.max(0, subtotal - discount));
  const payment = PaymentMethod.fromApi(String(o?.payment_method ?? o?.payment ?? "cash"));
  const seller = String(o?.seller ?? o?.seller_name ?? "Unknown");

  return { id: o?.id ?? o?.order_id, items, subtotal, discount, total, payment, seller, createdAt };
}

export type SalesListResult = { orders: Order[]; pagination: Pagination | null };

export function useSalesListQuery(input: { page: number; per_page: number; seller_id?: string | number }) {
  return useQuery({
    queryKey: ["reports", "sales-list", { page: input.page, per_page: input.per_page, seller_id: input.seller_id ?? "" }],
    queryFn: async () => {
      const res = await reportsApi.salesList(input);
      const ordersRaw = (res?.data?.orders ?? res?.orders ?? []) as any[];
      const pagination = (res?.data?.pagination ?? res?.pagination ?? null) as Pagination | null;
      return {
        orders: Array.isArray(ordersRaw) ? ordersRaw.map(normalizeOrderRow) : [],
        pagination,
      } as SalesListResult;
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
}

