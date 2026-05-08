import { useQuery } from "@tanstack/react-query";
import * as ordersApi from "@/api/orders";
import type { Pagination } from "@/api/products";
import type { Order } from "@/types/models";
import { PaymentMethod } from "@/types/enums";

export type PagedResult<T> = { items: T[]; pagination: Pagination | null };

function unwrap(res: any) {
  const items = (res?.data?.orders ?? res?.orders ?? []) as any[];
  const pagination = (res?.data?.pagination ?? res?.pagination ?? null) as Pagination | null;
  return { items: Array.isArray(items) ? items : [], pagination };
}

function normalizeOrder(o: any): Order {
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
  const discount = Number(o?.discount ?? 0);
  const total = Number(o?.total ?? o?.total_amount ?? Math.max(0, subtotal - discount));
  const payment = PaymentMethod.fromApi(String(o?.payment_method ?? o?.payment ?? "cash"));
  const seller = String(o?.seller ?? o?.seller_name ?? "Unknown");

  return { id: o?.id ?? o?.order_id, items, subtotal, discount, total, payment, seller, createdAt };
}

export function useOrdersPagedQuery(input: { page: number; per_page: number }) {
  return useQuery({
    queryKey: ["orders", "paged", { page: input.page, per_page: input.per_page }],
    queryFn: async () => {
      const res = await ordersApi.listOrdersPaged({ page: input.page, per_page: input.per_page });
      const { items, pagination } = unwrap(res);
      return { items: items.map(normalizeOrder), pagination } as PagedResult<Order>;
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
}

