import { useSyncExternalStore } from "react";

export type CartItem = { productId: string; qty: number };

type CartState = { cart: CartItem[] };

const KEY = "hcpos_cart_v1";

function readStorage(): CartState {
  if (typeof window === "undefined") return { cart: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { cart: [] };
    const parsed = JSON.parse(raw) as Partial<CartState>;
    return { cart: Array.isArray(parsed.cart) ? (parsed.cart as CartItem[]) : [] };
  } catch {
    return { cart: [] };
  }
}

let state: CartState = readStorage();
const listeners = new Set<() => void>();

function writeStorage(next: CartState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(next));
}

function setState(updater: (s: CartState) => CartState) {
  state = updater(state);
  writeStorage(state);
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useCartStore<T>(selector: (s: CartState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}

export const cartStore = {
  get: () => state,
  add(productId: string) {
    setState((s) => {
      const existing = s.cart.find((c) => c.productId === productId);
      const cart = existing
        ? s.cart.map((c) => (c.productId === productId ? { ...c, qty: c.qty + 1 } : c))
        : [...s.cart, { productId, qty: 1 }];
      return { cart };
    });
  },
  setQty(productId: string, qty: number) {
    setState((s) => ({
      cart: qty <= 0 ? s.cart.filter((c) => c.productId !== productId) : s.cart.map((c) => (c.productId === productId ? { ...c, qty } : c)),
    }));
  },
  remove(productId: string) {
    setState((s) => ({ cart: s.cart.filter((c) => c.productId !== productId) }));
  },
  clear() {
    setState(() => ({ cart: [] }));
  },
};

