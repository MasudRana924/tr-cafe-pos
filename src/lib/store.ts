import { useSyncExternalStore } from "react";

export type Role = "admin" | "salesman";
export type User = { id: string; name: string; email: string; role: Role };
export type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image: string;
};
export type CartItem = { productId: string; qty: number };
export type PaymentMethod = "Cash" | "bKash" | "Nagad";
export type Order = {
  id: string;
  items: { productId: string; name: string; price: number; qty: number }[];
  subtotal: number;
  discount: number;
  total: number;
  payment: PaymentMethod;
  seller: string;
  createdAt: string;
};

type State = {
  user: User | null;
  users: User[];
  products: Product[];
  orders: Order[];
  cart: CartItem[];
};

const KEY = "hcpos_state_v1";

const seedProducts: Product[] = [
  { id: "p1", name: "Chicken Burger", price: 180, quantity: 24, category: "Fast Food", image: "🍔" },
  { id: "p2", name: "Veg Sandwich", price: 90, quantity: 40, category: "Snacks", image: "🥪" },
  { id: "p3", name: "Cold Coffee", price: 120, quantity: 30, category: "Beverages", image: "☕" },
  { id: "p4", name: "French Fries", price: 100, quantity: 50, category: "Snacks", image: "🍟" },
  { id: "p5", name: "Cheese Pizza", price: 250, quantity: 12, category: "Fast Food", image: "🍕" },
  { id: "p6", name: "Mineral Water", price: 25, quantity: 100, category: "Beverages", image: "💧" },
  { id: "p7", name: "Chocolate Cake", price: 80, quantity: 6, category: "Desserts", image: "🍰" },
  { id: "p8", name: "Ice Cream", price: 70, quantity: 4, category: "Desserts", image: "🍦" },
  { id: "p9", name: "Chicken Roll", price: 110, quantity: 18, category: "Fast Food", image: "🌯" },
  { id: "p10", name: "Mango Juice", price: 60, quantity: 35, category: "Beverages", image: "🥭" },
  { id: "p11", name: "Samosa", price: 20, quantity: 80, category: "Snacks", image: "🥟" },
  { id: "p12", name: "Pasta", price: 160, quantity: 20, category: "Fast Food", image: "🍝" },
];

const seedUsers: User[] = [
  { id: "u1", name: "Admin User", email: "admin@canteen.com", role: "admin" },
  { id: "u2", name: "Rahim Salesman", email: "rahim@canteen.com", role: "salesman" },
  { id: "u3", name: "Karim Salesman", email: "karim@canteen.com", role: "salesman" },
];

function seedOrders(): Order[] {
  const now = Date.now();
  const orders: Order[] = [];
  const pays: PaymentMethod[] = ["Cash", "bKash", "Nagad"];
  for (let i = 0; i < 14; i++) {
    const day = new Date(now - i * 86400000);
    const count = 1 + Math.floor(Math.random() * 3);
    for (let j = 0; j < count; j++) {
      const items = [];
      const n = 1 + Math.floor(Math.random() * 3);
      let subtotal = 0;
      for (let k = 0; k < n; k++) {
        const p = seedProducts[Math.floor(Math.random() * seedProducts.length)];
        const q = 1 + Math.floor(Math.random() * 3);
        subtotal += p.price * q;
        items.push({ productId: p.id, name: p.name, price: p.price, qty: q });
      }
      orders.push({
        id: `ORD-${1000 + orders.length}`,
        items,
        subtotal,
        discount: 0,
        total: subtotal,
        payment: pays[Math.floor(Math.random() * 3)],
        seller: Math.random() > 0.5 ? "Rahim Salesman" : "Karim Salesman",
        createdAt: new Date(day.getTime() - j * 3600000).toISOString(),
      });
    }
  }
  return orders;
}

function load(): State {
  if (typeof window === "undefined") {
    return { user: null, users: seedUsers, products: seedProducts, orders: [], cart: [] };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const init: State = {
    user: null,
    users: seedUsers,
    products: seedProducts,
    orders: seedOrders(),
    cart: [],
  };
  localStorage.setItem(KEY, JSON.stringify(init));
  return init;
}

let state: State = load();
const listeners = new Set<() => void>();

function setState(updater: (s: State) => State) {
  state = updater(state);
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(state));
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}

export const store = {
  get: () => state,
  login(email: string, role: Role): User | null {
    const u = state.users.find((x) => x.email.toLowerCase() === email.toLowerCase() && x.role === role);
    if (u) setState((s) => ({ ...s, user: u }));
    return u ?? null;
  },
  logout() {
    setState((s) => ({ ...s, user: null, cart: [] }));
  },
  addProduct(p: Omit<Product, "id">) {
    setState((s) => ({ ...s, products: [...s.products, { ...p, id: `p${Date.now()}` }] }));
  },
  updateProduct(id: string, p: Partial<Product>) {
    setState((s) => ({ ...s, products: s.products.map((x) => (x.id === id ? { ...x, ...p } : x)) }));
  },
  deleteProduct(id: string) {
    setState((s) => ({ ...s, products: s.products.filter((x) => x.id !== id) }));
  },
  addUser(u: Omit<User, "id">) {
    setState((s) => ({ ...s, users: [...s.users, { ...u, id: `u${Date.now()}` }] }));
  },
  deleteUser(id: string) {
    setState((s) => ({ ...s, users: s.users.filter((x) => x.id !== id) }));
  },
  addToCart(productId: string) {
    setState((s) => {
      const existing = s.cart.find((c) => c.productId === productId);
      const cart = existing
        ? s.cart.map((c) => (c.productId === productId ? { ...c, qty: c.qty + 1 } : c))
        : [...s.cart, { productId, qty: 1 }];
      return { ...s, cart };
    });
  },
  setCartQty(productId: string, qty: number) {
    setState((s) => ({
      ...s,
      cart: qty <= 0 ? s.cart.filter((c) => c.productId !== productId) : s.cart.map((c) => (c.productId === productId ? { ...c, qty } : c)),
    }));
  },
  removeFromCart(productId: string) {
    setState((s) => ({ ...s, cart: s.cart.filter((c) => c.productId !== productId) }));
  },
  clearCart() {
    setState((s) => ({ ...s, cart: [] }));
  },
  checkout(discount: number, payment: PaymentMethod): Order {
    const s = state;
    const items = s.cart.map((c) => {
      const p = s.products.find((x) => x.id === c.productId)!;
      return { productId: p.id, name: p.name, price: p.price, qty: c.qty };
    });
    const subtotal = items.reduce((a, b) => a + b.price * b.qty, 0);
    const total = Math.max(0, subtotal - discount);
    const order: Order = {
      id: `ORD-${1000 + s.orders.length + 1}`,
      items,
      subtotal,
      discount,
      total,
      payment,
      seller: s.user?.name ?? "Unknown",
      createdAt: new Date().toISOString(),
    };
    setState((st) => ({
      ...st,
      orders: [order, ...st.orders],
      cart: [],
      products: st.products.map((p) => {
        const it = items.find((i) => i.productId === p.id);
        return it ? { ...p, quantity: Math.max(0, p.quantity - it.qty) } : p;
      }),
    }));
    return order;
  },
};
