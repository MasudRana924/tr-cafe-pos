import { Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/buttons/loading-button";
import { cn } from "@/lib/utils";
import { cartStore } from "@/lib/cartStore";
import type { PaymentMethodUi } from "@/types/enums";
import { isEmoji, productFallbackEmoji } from "@/lib/pos-display";
import type { Product } from "@/types/models";

type CartLine = Product & { qty: number };

type Props = {
  cartLines: CartLine[];
  discount: number;
  onDiscountChange: (n: number) => void;
  payment: PaymentMethodUi;
  onPaymentChange: (m: PaymentMethodUi) => void;
  subtotal: number;
  total: number;
  itemCount: number;
  onCheckout: () => void;
  checkoutPending: boolean;
};

export function PosCartSection({
  cartLines,
  discount,
  onDiscountChange,
  payment,
  onPaymentChange,
  subtotal,
  total,
  itemCount,
  onCheckout,
  checkoutPending,
}: Props) {
  const methods = ["Cash", "bKash", "Nagad"] as PaymentMethodUi[];

  return (
    <aside
      className="bg-white border border-gray-200 rounded-xl p-5 xl:sticky xl:top-6 self-start max-h-[calc(100vh-3rem)] flex flex-col shadow-sm"
      style={{ backgroundColor: "white" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag className="w-5 h-5 text-primary" />
        <h2 className="font-display font-semibold text-lg">Current Order</h2>
        <span className="ml-auto text-sm text-muted-foreground">{itemCount} items</span>
      </div>

      <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-2">
        {cartLines.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
            No items yet
          </div>
        )}
        {cartLines.map((it) => (
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
              <div className="text-xs text-muted-foreground">
                ৳{it.price} × {it.qty}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => cartStore.setQty(String(it.id), it.qty - 1)}>
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-6 text-center text-sm font-medium">{it.qty}</span>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => cartStore.setQty(String(it.id), it.qty + 1)}>
                <Plus className="w-3 h-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => cartStore.remove(String(it.id))}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {cartLines.length > 0 && (
        <div className="border-t pt-4 mt-3 space-y-3">
          <div>
            <Label className="text-xs mb-1.5 block">Discount (৳)</Label>
            <Input type="number" value={discount || ""} onChange={(e) => onDiscountChange(Number(e.target.value) || 0)} className="h-10" />
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Payment Method</Label>
            <div className="grid grid-cols-3 gap-2">
              {methods.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onPaymentChange(m)}
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
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>৳{subtotal}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Discount</span>
              <span>-৳{discount}</span>
            </div>
            <div className="flex justify-between font-display text-xl font-bold pt-1">
              <span>Total</span>
              <span>৳{total}</span>
            </div>
          </div>
          <LoadingButton
            type="button"
            onClick={onCheckout}
            className="w-full h-11 gradient-primary text-primary-foreground hover-lift border-0"
            loading={checkoutPending}
            loadingText="Charging..."
          >
            {`Charge ৳${total}`}
          </LoadingButton>
        </div>
      )}
    </aside>
  );
}
