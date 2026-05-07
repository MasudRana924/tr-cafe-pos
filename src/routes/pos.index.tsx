import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Plus, Minus, Trash2, ShoppingBag, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { store, useStore, type PaymentMethod } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pos/")({
  component: POSPage,
});

function POSPage() {
  const products = useStore((s) => s.products);
  const cart = useStore((s) => s.cart);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState<PaymentMethod>("Cash");

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(q.toLowerCase()) && (cat === "All" || p.category === cat),
  );

  const cartItems = cart.map((c) => {
    const p = products.find((x) => x.id === c.productId)!;
    return { ...p, qty: c.qty };
  });
  const subtotal = cartItems.reduce((a, b) => a + b.price * b.qty, 0);
  const total = Math.max(0, subtotal - discount);

  const checkout = () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    const order = store.checkout(discount, payment);
    setDiscount(0);
    navigate({ to: "/pos/order/$id", params: { id: order.id } });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
      {/* Products */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..." className="pl-9" style={{ width: "510px", height: "50px", borderRadius: "16px", backgroundColor: "#F5F5F5", border: "1px solid #F5F5F5", boxShadow: "none" }} />
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
          {filtered.map((p, i) => (
            <button
              key={p.id}
              disabled={p.quantity === 0}
              onClick={() => { store.addToCart(p.id); toast.success(`${p.name} added`); }}
              className="card-soft p-4 text-left hover-lift disabled:opacity-50 disabled:cursor-not-allowed animate-scale-in relative"
              style={{ animationDelay: `${i * 25}ms` }}
            >
              <div className="aspect-square rounded-xl bg-gradient-to-br from-accent to-muted grid place-items-center text-5xl mb-3">
                {p.image}
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
              <div className="w-12 h-12 rounded-lg bg-accent grid place-items-center text-2xl">{it.image}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{it.name}</div>
                <div className="text-xs text-muted-foreground">৳{it.price} × {it.qty}</div>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => store.setCartQty(it.id, it.qty - 1)}><Minus className="w-3 h-3" /></Button>
                <span className="w-6 text-center text-sm font-medium">{it.qty}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => store.setCartQty(it.id, it.qty + 1)}><Plus className="w-3 h-3" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => store.removeFromCart(it.id)}><Trash2 className="w-3 h-3" /></Button>
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
                {(["Cash", "bKash", "Nagad"] as PaymentMethod[]).map((m) => (
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
              Charge ৳{total}
            </Button>
          </div>
        )}
      </aside>
    </div>
  );
}
