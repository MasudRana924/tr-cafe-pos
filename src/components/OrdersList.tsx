import { useState } from "react";
import { Search, Receipt } from "lucide-react";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { Order } from "@/types/models";
import { Skeleton } from "@/components/ui/skeleton";

export function OrdersList({ orders, pending }: { orders: Order[]; pending?: boolean }) {
  const [q, setQ] = useState("");
  const [pay, setPay] = useState("all");
  const [date, setDate] = useState("");

  const filtered = orders.filter((o) => {
    const matchesQ = String(o.id).toLowerCase().includes(q.toLowerCase());
    const matchesP = pay === "all" || o.payment === pay;
    const matchesD = !date || new Date(o.createdAt).toISOString().slice(0, 10) === date;
    return matchesQ && matchesP && matchesD;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by order ID..." className="pl-9" style={{ width: "510px", height: "50px", borderRadius: "16px", backgroundColor: "#F5F5F5", border: "1px solid #F5F5F5", boxShadow: "none" }} />
        </div>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="sm:w-44 h-11" />
        <Select value={pay} onValueChange={setPay}>
          <SelectTrigger className="sm:w-44 h-11"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payments</SelectItem>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="bKash">bKash</SelectItem>
            <SelectItem value="Nagad">Nagad</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-semibold">Order ID</th>
              <th className="text-left p-3 font-semibold">Date & Time</th>
              <th className="text-left p-3 font-semibold">Seller</th>
              <th className="text-left p-3 font-semibold">Payment</th>
              <th className="text-left p-3 font-semibold">Total</th>
              <th className="text-left p-3 font-semibold">Items</th>
            </tr>
          </thead>
          <tbody>
            {pending
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="border-b">
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
                  </tr>
                ))
              : filtered.map((o, i) => (
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
                            <span>{it.name} × {it.qty}</span>
                            <span>৳{it.price * it.qty}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!pending && filtered.length === 0 && <div className="text-center text-muted-foreground py-12">No orders found.</div>}
      </div>
    </div>
  );
}
