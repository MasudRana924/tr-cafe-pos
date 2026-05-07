import { createFileRoute } from "@tanstack/react-router";
import { OrdersList } from "@/components/OrdersList";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/pos/history")({
  component: () => {
    const orders = useStore((s) => s.orders);
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Order History</h1>
          <p className="text-muted-foreground">Browse all past orders.</p>
        </div>
        <OrdersList orders={orders} />
      </div>
    );
  },
});
