import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Receipt } from "lucide-react";
import { useOrdersPagedQuery } from "@/hooks/useOrdersPaged";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const Route = createFileRoute("/admin/orders")({
  validateSearch: (s: Record<string, unknown>) => ({
    page: typeof s.page === "string" ? Number(s.page) : typeof s.page === "number" ? s.page : 1,
    per_page: typeof s.per_page === "string" ? Number(s.per_page) : typeof s.per_page === "number" ? s.per_page : 10,
    q: typeof s.q === "string" ? s.q : "",
  }),
  component: OrdersPage,
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

function OrdersPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const page = Number.isFinite(search.page) && search.page > 0 ? search.page : 1;
  const perPage = Number.isFinite(search.per_page) && search.per_page > 0 ? search.per_page : 10;
  const q = search.q ?? "";

  const ordersQ = useOrdersPagedQuery({ page, per_page: perPage });
  const orders = ordersQ.data?.items ?? [];
  const pagination = ordersQ.data?.pagination;
  const [pay, setPay] = useState("all");

  const filtered = orders.filter(
    (o) => String(o.id).toLowerCase().includes(q.toLowerCase()) && (pay === "all" || o.payment === pay),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">All transactions across the canteen.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => navigate({ search: (prev) => ({ ...prev, q: e.target.value, page: 1 }), replace: true })}
            placeholder="Search by order ID..."
            className="pl-9"
            style={{ width: "510px", height: "50px", borderRadius: "16px", backgroundColor: "#F5F5F5", border: "1px solid #F5F5F5", boxShadow: "none" }}
          />
        </div>
        <Select value={pay} onValueChange={setPay}>
          <SelectTrigger className="sm:w-56" style={{ height: "50px" }}><SelectValue /></SelectTrigger>
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
            {ordersQ.isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
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
        {!ordersQ.isLoading && filtered.length === 0 && <div className="text-center text-muted-foreground py-12">No orders found.</div>}
      </div>

      {pagination?.total_pages && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
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
                    navigate({ search: (prev) => ({ ...prev, page: page - 1 }) });
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
                        navigate({ search: (prev) => ({ ...prev, page: it }) });
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
                    if (!pagination?.total_pages || page >= pagination.total_pages) return;
                    navigate({ search: (prev) => ({ ...prev, page: page + 1 }) });
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
