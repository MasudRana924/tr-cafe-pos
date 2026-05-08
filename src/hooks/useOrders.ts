import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ordersApi from "@/api/orders";
import type { Order } from "@/types/models";
import { PaymentMethod } from "@/types/enums";

function unwrapOrders(res: any) {
  // Backend responses may wrap as { data: { orders: [...] } }
  return res?.data?.orders ?? res?.orders ?? res ?? [];
}

function unwrapOrder(res: any) {
  return res?.data?.order ?? res?.order ?? res;
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

  return {
    id: o?.id ?? o?.order_id,
    items,
    subtotal,
    discount,
    total,
    payment,
    seller,
    createdAt,
  };
}

export function useOrdersQuery(opts?: { refetchOnMount?: "always" | boolean }) {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => unwrapOrders(await ordersApi.listOrders()).map(normalizeOrder),
    staleTime: 0,
    refetchOnMount: opts?.refetchOnMount ?? true,
    // avoid "duplicate" feeling; still refetches on mount (page enter)
    refetchOnWindowFocus: false,
  });
}

export function useOrderQuery(id: string | number, enabled = true) {
  return useQuery({
    queryKey: ["orders", "detail", id],
    enabled,
    queryFn: async () => normalizeOrder(await unwrapOrder(await ordersApi.getOrder(id))),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useCreateOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.createOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

