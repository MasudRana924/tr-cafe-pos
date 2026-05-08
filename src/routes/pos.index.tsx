import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Plus, Minus, Trash2, ShoppingBag, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { cartStore, useCartStore } from "@/lib/cartStore";
import type { PaymentMethodUi } from "@/types/enums";
import { PaymentMethod } from "@/types/enums";
import { useProductsPagedQuery } from "@/hooks/useProductsPaged";
import { useCreateOrderMutation } from "@/hooks/useOrders";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const Route = createFileRoute("/pos/")({
  validateSearch: (s: Record<string, unknown>) => ({
    page: typeof s.page === "string" ? Number(s.page) : typeof s.page === "number" ? s.page : 1,
    per_page: typeof s.per_page === "string" ? Number(s.per_page) : typeof s.per_page === "number" ? s.per_page : 12,
    q: typeof s.q === "string" ? s.q : "",
  }),
  component: POSPage,
});

function getPageItems(page: number, totalPages: number): Array<number | "…"> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const set = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const pages = Array.from(set)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
  const out: Array<number | "…"> = [];
  for (let i = 0; i < pages.length; i++) {
    const cur = pages[i];
    const prev = pages[i - 1];
    if (i > 0 && cur - prev! > 1) out.push("…");
    out.push(cur);
  }
  return out;
}

function isEmoji(val: unknown) {
  return typeof val === "string" && val.trim().length > 0 && val.trim().length <= 4;
}

function productFallbackEmoji(p: any) {
  const cat = String(p?.category ?? "").toLowerCase();
  if (cat.includes("drink") || cat.includes("beverage")) return "🥤";
  if (cat.includes("dessert")) return "🍰";
  if (cat.includes("snack")) return "🥪";
  return "🍔";
}

function POSPage() {
  const search = Route.useSearch();
  const nav = Route.useNavigate();
  const page = Number.isFinite(search.page) && search.page > 0 ? search.page : 1;
  const perPage = Number.isFinite(search.per_page) && search.per_page > 0 ? search.per_page : 12;
  const q = search.q ?? "";

  const productsQ = useProductsPagedQuery({ page, per_page: perPage, q });
  const products = productsQ.data?.items ?? [];
  const pagination = productsQ.data?.pagination;
  const cart = useCartStore((s) => s.cart);
  const navigate = useNavigate();
  const createOrder = useCreateOrderMutation();
  const [cat, setCat] = useState("All");
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState<PaymentMethodUi>("Cash");

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered = products.filter(
    (p) => (cat === "All" || p.category === cat),
  );

  const cartItems = cart
    .map((c) => {
      const p = products.find((x) => String(x.id) === String(c.productId));
      if (!p) return null;
      return { ...p, qty: c.qty };
    })
    .filter(Boolean) as Array<any>;
  const subtotal = cartItems.reduce((a, b) => a + b.price * b.qty, 0);
  const total = Math.max(0, subtotal - discount);

  const checkout = async () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    try {
      const res = await createOrder.mutateAsync({
        payment_method: PaymentMethod.toApi(payment),
        discount,
        items: cart.map((c) => ({ product_id: c.productId, quantity: c.qty })),
      });

      const invoiceOrderId =
        (res as any)?.data?.invoice?.order_id ??
        (res as any)?.invoice?.order_id ??
        (res as any)?.data?.order_id ??
        (res as any)?.order_id ??
        (res as any)?.data?.id ??
        (res as any)?.id;
      if (!invoiceOrderId) throw new Error("Order created but missing order id");

      cartStore.clear();
      setDiscount(0);
      navigate({ to: "/pos/order/$id", params: { id: String(invoiceOrderId) } });
    } catch (e: any) {
      toast.error(e?.message ?? "Checkout failed");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
      {/* Products */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => nav({ search: (prev) => ({ ...prev, q: e.target.value, page: 1 }), replace: true })}
              placeholder="Search products..."
              className="pl-9"
              style={{ width: "510px", height: "50px", borderRadius: "16px", backgroundColor: "#F5F5F5", border: "1px solid #F5F5F5", boxShadow: "none" }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                cat === c ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card border-border hover:border-primary/40",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {productsQ.isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={`sk-${i}`} className="card-soft p-4 text-left relative">
                  <Skeleton className="aspect-square rounded-xl mb-3" />
                  <Skeleton className="h-4 w-28 mb-2" />
                  <div className="flex items-center justify-between mt-1">
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <div className="absolute top-2 right-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                  </div>
                </div>
              ))
            : filtered.map((p, i) => (
                <button
                  key={p.id}
                  disabled={p.quantity === 0}
                  onClick={() => { cartStore.add(String(p.id)); toast.success(`${p.name} added`); }}
                  className="card-soft p-4 text-left hover-lift disabled:opacity-50 disabled:cursor-not-allowed animate-scale-in relative"
                  style={{ animationDelay: `${i * 25}ms` }}
                >
                  <div className="aspect-square rounded-xl bg-gradient-to-br from-accent to-muted overflow-hidden grid place-items-center mb-3">
                    {p.image_url ? (
                      isEmoji(p.image_url) ? (
                        <div className="text-5xl">{p.image_url}</div>
                      ) : (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="text-5xl">{productFallbackEmoji(p)}</div>
                    )}
                  </div>
                  <div className="font-semibold text-sm truncate">{p.name}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-primary font-display font-bold">৳{p.price}</span>
                    <span className={`text-xs ${p.quantity <= 10 ? "text-destructive" : "text-muted-foreground"}`}>{p.quantity}</span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full grid place-items-center shadow-lg">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              ))}
        </div>

        {pagination?.total_pages && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-sm text-muted-foreground">
              Page <span className="font-medium text-foreground">{page}</span> of{" "}
              <span className="font-medium text-foreground">{pagination.total_pages}</span>
            </div>
            <Pagination className="mx-0 justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      if (page <= 1) return;
                      nav({ search: (prev) => ({ ...prev, page: page - 1 }) });
                    }}
                  />
                </PaginationItem>
                {getPageItems(page, pagination.total_pages).map((it, idx) =>
                  it === "…" ? (
                    <PaginationItem key={`el-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={it}>
                      <PaginationLink
                        href="#"
                        isActive={it === page}
                        onClick={(e) => {
                          e.preventDefault();
                          nav({ search: (prev) => ({ ...prev, page: it }) });
                        }}
                      >
                        {it}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    className={page >= pagination.total_pages ? "pointer-events-none opacity-50" : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      if (page >= pagination.total_pages) return;
                      nav({ search: (prev) => ({ ...prev, page: page + 1 }) });
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Cart */}
      <aside className="bg-white border border-gray-200 rounded-xl p-5 xl:sticky xl:top-6 self-start max-h-[calc(100vh-3rem)] flex flex-col shadow-sm" style={{ backgroundColor: 'white' }}>
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-lg">Current Order</h2>
          <span className="ml-auto text-sm text-muted-foreground">{cart.length} items</span>
        </div>

        <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-2">
          {cartItems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
              No items yet
            </div>
          )}
          {cartItems.map((it) => (
            <div key={it.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50">
              <div className="w-12 h-12 rounded-lg bg-accent overflow-hidden grid place-items-center">
                {it.image_url ? (
                  isEmoji(it.image_url) ? (
                    <div className="text-2xl">{it.image_url}</div>
                  ) : (
                    <img src={it.image_url} alt={it.name} className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="text-2xl">{productFallbackEmoji(it)}</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{it.name}</div>
                <div className="text-xs text-muted-foreground">৳{it.price} × {it.qty}</div>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => cartStore.setQty(String(it.id), it.qty - 1)}><Minus className="w-3 h-3" /></Button>
                <span className="w-6 text-center text-sm font-medium">{it.qty}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => cartStore.setQty(String(it.id), it.qty + 1)}><Plus className="w-3 h-3" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => cartStore.remove(String(it.id))}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </div>
          ))}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t pt-4 mt-3 space-y-3">
            <div>
              <Label className="text-xs mb-1.5 block">Discount (৳)</Label>
              <Input type="number" value={discount || ""} onChange={(e) => setDiscount(Number(e.target.value) || 0)} className="h-10" />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Payment Method</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["Cash", "bKash", "Nagad"] as PaymentMethodUi[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPayment(m)}
                    className={cn(
                      "py-2 rounded-lg text-sm font-medium border transition-all",
                      payment === m ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/40",
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1 text-sm pt-2">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>৳{subtotal}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Discount</span><span>-৳{discount}</span></div>
              <div className="flex justify-between font-display text-xl font-bold pt-1"><span>Total</span><span>৳{total}</span></div>
            </div>
            <Button onClick={checkout} className="w-full h-11 gradient-primary text-primary-foreground hover-lift">
              {createOrder.isPending ? "Charging..." : `Charge ৳${total}`}
            </Button>
          </div>
        )}
      </aside>
    </div>
  );
}
