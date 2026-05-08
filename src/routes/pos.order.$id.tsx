import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { CheckCircle2, Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrderQuery } from "@/hooks/useOrders";

export const Route = createFileRoute("/pos/order/$id")({
  component: OrderConfirmation,
});

function OrderConfirmation() {
  const { id } = useParams({ from: "/pos/order/$id" });
  const { data: order, isLoading, isError } = useOrderQuery(id, Boolean(id));

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="card-soft p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4"></div>
            <div className="h-8 bg-muted rounded w-48 mx-auto mb-2"></div>
            <div className="h-4 bg-muted rounded w-64 mx-auto mb-6"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="flex gap-3 mt-6">
              <div className="h-10 bg-muted rounded flex-1"></div>
              <div className="h-10 bg-muted rounded flex-1"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="card-soft p-8 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">The order you're looking for doesn't exist or has been removed.</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => window.history.back()}>
              Go Back
            </Button>
            <Button asChild className="flex-1 gradient-primary text-primary-foreground">
              <Link to="/pos" search={{ page: 1, per_page: 12, q: "" }}>New Order</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-4">
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-black hover:text-black"
          style={{ backgroundColor: '#F6F6F6', border: '1px solid #F6F6F6' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>
      <div className="p-8 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-success/15 grid place-items-center mx-auto mb-4 animate-pop">
          <CheckCircle2 className="w-12 h-12 text-success" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-1">Order Confirmed</h1>
        <p className="text-muted-foreground mb-6">Thank you! Your order has been placed.</p>

        <div className="rounded-2xl bg-muted/60 p-5 text-left space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Order ID</span>
            <span className="font-display font-bold">{order.id}</span>
          </div>
          <div className="border-t pt-4 space-y-1.5">
            {order.items.map((it, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{it.name} × {it.qty}</span>
                <span className="text-muted-foreground">৳{it.price * it.qty}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>৳{order.subtotal}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Discount</span><span>-৳{order.discount}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Payment</span><span>{order.payment}</span></div>
            <div className="flex justify-between font-display text-xl font-bold pt-2 border-t">
              <span>Total Paid</span><span>৳{order.total}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Print Invoice
          </Button>
          <Button asChild className="flex-1 gradient-primary text-primary-foreground">
            <Link to="/pos" search={{ page: 1, per_page: 12, q: "" }}>New Order</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
