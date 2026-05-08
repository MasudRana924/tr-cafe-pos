import { api } from "./client";
import type { PaymentMethodApi } from "@/types/enums";
import type { Pagination } from "./products";

export type CreateOrderRequest = {
  payment_method: PaymentMethodApi;
  discount: number;
  items: { product_id: string | number; quantity: number }[];
};

export type InvoiceResponse = {
  order_id: string | number;
  total?: number;
};

export type OrderResponse = {
  id: string | number;
  items: Array<{
    product_id: string | number;
    name?: string;
    price?: number;
    quantity: number;
  }>;
  subtotal?: number;
  discount?: number;
  total?: number;
  payment_method?: string;
  seller?: string;
  created_at?: string;
  createdAt?: string;
};

export async function createOrder(body: CreateOrderRequest) {
  return api<{ invoice?: InvoiceResponse; order?: OrderResponse } | InvoiceResponse | OrderResponse>("/api/orders", {
    method: "POST",
    body,
  });
}

export async function listOrders() {
  return api<{ orders: OrderResponse[] } | OrderResponse[]>("/api/orders", { method: "GET" });
}

export async function listOrdersPaged(params: { page: number; per_page: number }) {
  const qs = new URLSearchParams({
    page: String(params.page),
    per_page: String(params.per_page),
  });
  return api<{ data?: { orders?: OrderResponse[]; pagination?: Pagination } } | any>(`/api/orders?${qs.toString()}`, { method: "GET" });
}

export async function getOrder(id: string | number) {
  return api<{ order: OrderResponse } | OrderResponse>(`/api/orders/${id}`, { method: "GET" });
}

