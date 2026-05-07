import { createFileRoute } from "@tanstack/react-router";
import { OrdersList } from "@/components/OrdersList";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/pos/orders")({
  component: () => {
    const orders = useStore((s) => s.orders);
    const today = new Date().toDateString();
    const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today);
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Today's Orders</h1>
          <p className="text-muted-foreground">All orders processed today.</p>
        </div>
        <OrdersList orders={todayOrders} />
      </div>
    );
  },
});
