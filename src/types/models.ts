import type { PaymentMethodUi, Role } from "./enums";

export type AuthUser = {
  id: string | number;
  name: string;
  email: string;
  role: Role;
};

export type Product = {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  barcode?: string | null;
  category: string;
  image_url?: string | null;
};

export type OrderItem = {
  product_id: string | number;
  name?: string;
  price?: number;
  quantity: number;
};

export type Order = {
  id: string | number;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    qty: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  payment: PaymentMethodUi;
  seller: string;
  createdAt: string;
};

