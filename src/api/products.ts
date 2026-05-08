import { api } from "./client";
import type { Product } from "@/types/models";

export type Pagination = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
};

export type CreateProductRequest = {
  name: string;
  price: number;
  quantity: number;
  barcode?: string | null;
  category: string;
  image_url?: string | null;
};

export type CreateProductMultipart = CreateProductRequest & {
  image?: File | null;
};

function toFormData(body: CreateProductMultipart) {
  const fd = new FormData();
  fd.append("name", body.name);
  fd.append("price", String(body.price));
  fd.append("quantity", String(body.quantity));
  fd.append("category", body.category);
  if (body.barcode) fd.append("barcode", body.barcode);
  if (body.image_url) fd.append("image_url", body.image_url);
  if (body.image) fd.append("image", body.image);
  return fd;
}

export async function listProducts() {
  return api<{ products: Product[] } | Product[]>("/api/products", { method: "GET" });
}

export async function searchProducts(q: string) {
  return api<{ products: Product[] } | Product[]>(`/api/products/search?q=${encodeURIComponent(q)}`, { method: "GET" });
}

export async function listProductsPaged(params: { page: number; per_page: number }) {
  const qs = new URLSearchParams({
    page: String(params.page),
    per_page: String(params.per_page),
  });
  return api<{ data?: { products?: Product[]; pagination?: Pagination } } | any>(`/api/products?${qs.toString()}`, { method: "GET" });
}

export async function searchProductsPaged(params: { q: string; page: number; per_page: number }) {
  const qs = new URLSearchParams({
    q: params.q,
    page: String(params.page),
    per_page: String(params.per_page),
  });
  return api<{ data?: { products?: Product[]; pagination?: Pagination } } | any>(`/api/products/search?${qs.toString()}`, { method: "GET" });
}

export async function getProduct(id: string | number) {
  return api<{ product: Product } | Product>(`/api/products/${id}`, { method: "GET" });
}

export async function createProduct(body: CreateProductRequest | CreateProductMultipart) {
  const b: any = body as any;
  const hasFile = typeof File !== "undefined" && b?.image instanceof File;
  return api<{ product: Product } | Product>("/api/products", {
    method: "POST",
    body: hasFile ? toFormData(b) : body,
  });
}

export async function updateProduct(id: string | number, body: Partial<CreateProductRequest> | Partial<CreateProductMultipart>) {
  const b: any = body as any;
  const hasFile = typeof File !== "undefined" && b?.image instanceof File;
  return api<{ product: Product } | Product>(`/api/products/${id}`, {
    method: "PUT",
    body: hasFile ? toFormData(b as any) : body,
  });
}

export async function stockIn(id: string | number, quantity: number) {
  return api<{ product: Product } | Product>(`/api/products/${id}/stock-in`, { method: "POST", body: { quantity } });
}

export async function stockOut(id: string | number, quantity: number) {
  return api<{ product: Product } | Product>(`/api/products/${id}/stock-out`, { method: "POST", body: { quantity } });
}

export async function deleteProduct(id: string | number) {
  return api<{ success: boolean } | unknown>(`/api/products/${id}`, { method: "DELETE" });
}

