import { Receipt } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Order } from "@/types/models";

type Variant = "withLineItems" | "flat";

type Props = {
  orders: Order[];
  loading: boolean;
  variant: Variant;
  emptyMessage?: string;
};

/**
 * Admin orders: receipt + order id & time, seller, payment, total, line items.
 * Sales report (`flat`): id, date/time, seller, payment, total.
 */
export function OrdersDataTable({ orders, loading, variant, emptyMessage = "No orders found." }: Props) {
  const showLineItems = variant === "withLineItems";

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr className="border-b">
            {showLineItems ? (
              <>
                <th className="text-left p-3 font-semibold">Order</th>
                <th className="text-left p-3 font-semibold">Seller</th>
                <th className="text-left p-3 font-semibold">Payment</th>
                <th className="text-left p-3 font-semibold">Total</th>
                <th className="text-left p-3 font-semibold">Items</th>
              </>
            ) : (
              <>
                <th className="text-left p-3 font-semibold">Order ID</th>
                <th className="text-left p-3 font-semibold">Date &amp; Time</th>
                <th className="text-left p-3 font-semibold">Seller</th>
                <th className="text-left p-3 font-semibold">Payment</th>
                <th className="text-left p-3 font-semibold">Total</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={`sk-${i}`} className="border-b">
                  {showLineItems ? (
                    <>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Skeleton className="w-8 h-8 rounded-lg" />
                          <div>
                            <Skeleton className="h-4 w-28 mb-2" />
                            <Skeleton className="h-3 w-36" />
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Skeleton className="h-4 w-28" />
                      </td>
                      <td className="p-3">
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </td>
                      <td className="p-3">
                        <Skeleton className="h-6 w-20" />
                      </td>
                      <td className="p-3">
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-56" />
                          <Skeleton className="h-3 w-44" />
                          <Skeleton className="h-3 w-52" />
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-3">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="p-3">
                        <Skeleton className="h-4 w-40" />
                      </td>
                      <td className="p-3">
                        <Skeleton className="h-4 w-28" />
                      </td>
                      <td className="p-3">
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </td>
                      <td className="p-3">
                        <Skeleton className="h-6 w-20" />
                      </td>
                    </>
                  )}
                </tr>
              ))
            : orders.map((o, i) =>
                showLineItems ? (
                  <tr key={o.id} className="border-b hover:bg-muted/50" style={{ animationDelay: `${i * 20}ms` }}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-accent text-accent-foreground grid place-items-center">
                          <Receipt className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold">{o.id}</div>
                          <div className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{o.seller}</td>
                    <td className="p-3">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent text-accent-foreground">{o.payment}</span>
                    </td>
                    <td className="p-3">
                      <div className="font-display font-bold text-lg">৳{o.total}</div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1 text-sm">
                        {o.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-muted-foreground">
                            <span>
                              {it.name} × {it.qty}
                            </span>
                            <span>৳{it.price * it.qty}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={o.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-semibold">{o.id}</td>
                    <td className="p-3 text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</td>
                    <td className="p-3">{o.seller}</td>
                    <td className="p-3">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent text-accent-foreground">{o.payment}</span>
                    </td>
                    <td className="p-3">
                      <div className="font-display font-bold text-lg">৳{o.total}</div>
                    </td>
                  </tr>
                ),
              )}
        </tbody>
      </table>
      {!loading && orders.length === 0 && <div className="text-center text-muted-foreground py-12">{emptyMessage}</div>}
    </div>
  );
}
