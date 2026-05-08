import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Receipt,
  BarChart3,
  Users,
  ShoppingCart,
  History,
} from "lucide-react";
import { ensureAuthed } from "@/lib/requireAuth";
import { useAuthStore } from "@/lib/authStore";
import { AppShell } from "@/components/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSalesListQuery, useSellerSalesCardsQuery } from "@/hooks/useSellerSalesReport";
import { useSalesmenQuery } from "@/hooks/useUsers";
import type { AuthUser } from "@/types/models";

export const Route = createFileRoute("/sales-report")({
  validateSearch: (s: Record<string, unknown>) => ({
    page: typeof s.page === "string" ? Number(s.page) : typeof s.page === "number" ? s.page : 1,
    per_page: typeof s.per_page === "string" ? Number(s.per_page) : typeof s.per_page === "number" ? s.per_page : 10,
    seller_id: typeof s.seller_id === "string" ? s.seller_id : undefined,
  }),
  beforeLoad: async () => {
    const res = await ensureAuthed();
    if (!res.ok) throw redirect({ to: "/login" });
  },
  component: SalesReportPage,
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

function SalesReportPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";
  const sellerIdEffective = isAdmin ? (search.seller_id?.trim() ?? "") : String(user?.id ?? "");
  const cardsEnabled = Boolean(sellerIdEffective);

  const salesmenQ = useSalesmenQuery({ refetchOnMount: "always" });
  const salesmen: AuthUser[] = useMemo(() => {
    const raw = Array.isArray(salesmenQ.data) ? salesmenQ.data : [];
    return raw.filter((u) => u.role === "salesman");
  }, [salesmenQ.data]);
  const sellerInList =
    Boolean(sellerIdEffective) &&
    salesmen.some((u) => String(u.id) === String(sellerIdEffective));
  const selectValue = sellerIdEffective ? String(sellerIdEffective) : "__none__";

  const page = Number.isFinite(search.page) && search.page > 0 ? search.page : 1;
  const perPage = Number.isFinite(search.per_page) && search.per_page > 0 ? search.per_page : 10;

  const cardsQ = useSellerSalesCardsQuery({ sellerId: sellerIdEffective, enabled: cardsEnabled });
  const listQ = useSalesListQuery({
    page,
    per_page: perPage,
    seller_id: isAdmin && search.seller_id ? search.seller_id : undefined,
  });

  const pagination = listQ.data?.pagination;
  const orders = listQ.data?.orders ?? [];

  const stats = useMemo(() => {
    const d = cardsQ.data;
    return [
      { label: "Today Sales", value: d ? `৳${d.today_sales.toLocaleString()}` : "—", bgColor: "bg-green-50", borderColor: "border-green-200" },
      { label: "Weekly Sales", value: d ? `৳${d.weekly_sales.toLocaleString()}` : "—", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
      { label: "Monthly Sales", value: d ? `৳${d.monthly_sales.toLocaleString()}` : "—", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
      { label: "Total Orders", value: d ? String(d.total_orders) : "—", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
    ];
  }, [cardsQ.data]);

  const shellTitle = isAdmin ? "Admin Workspace" : "Sales Workspace";
  const shellItems =
    user?.role === "admin"
      ? [
          { to: "/admin", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
          { to: "/admin/products", label: "Products", icon: <Package className="w-5 h-5" /> },
          { to: "/admin/inventory", label: "Inventory", icon: <Boxes className="w-5 h-5" /> },
          { to: "/admin/orders", label: "Orders", icon: <Receipt className="w-5 h-5" /> },
          { to: "/admin/reports", label: "Sales Reports", icon: <BarChart3 className="w-5 h-5" /> },
          { to: "/sales-report", label: "Seller Sales", icon: <BarChart3 className="w-5 h-5" /> },
          { to: "/admin/users", label: "Users", icon: <Users className="w-5 h-5" /> },
        ]
      : [
          { to: "/pos", label: "POS", icon: <ShoppingCart className="w-5 h-5" /> },
          { to: "/pos/orders", label: "Orders", icon: <Receipt className="w-5 h-5" /> },
          { to: "/pos/history", label: "History", icon: <History className="w-5 h-5" /> },
          { to: "/sales-report", label: "Sales Report", icon: <BarChart3 className="w-5 h-5" /> },
        ];

  return (
    <AppShell title={shellTitle} items={shellItems}>
      <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Sales Report</h1>
          <p className="text-muted-foreground">
            {isAdmin ? "View any seller's performance." : "Your performance summary and orders."}
          </p>
        </div>

        {isAdmin && (
          <div className="w-full sm:max-w-xs">
            <Label className="text-xs mb-1.5 block">Salesman (from Users)</Label>
            {salesmenQ.isLoading ? (
              <Skeleton className="h-11 w-full rounded-md" />
            ) : (
              <Select
                value={selectValue}
                onValueChange={(v) =>
                  navigate({
                    search: (prev) => ({
                      ...prev,
                      seller_id: v === "__none__" ? undefined : v,
                      page: 1,
                    }),
                    replace: true,
                  })
                }
              >
                <SelectTrigger className="h-11 w-full shadow-none bg-background" style={{ backgroundColor: '#F5F5F5', border: '1px solid #F5F5F5', boxShadow: 'none' }}>
                  <SelectValue placeholder="Choose a salesman" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Choose salesman —</SelectItem>
                  {sellerIdEffective && !sellerInList && salesmenQ.isFetched && (
                    <SelectItem value={String(sellerIdEffective)}>
                      Seller #{sellerIdEffective} (not in current list)
                    </SelectItem>
                  )}
                  {salesmen.map((u) => (
                    <SelectItem key={String(u.id)} value={String(u.id)}>
                      {`${u.name} (#${u.id})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}
      </div>

          
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className={`${s.bgColor} p-5 rounded-xl border ${s.borderColor}`}>
                <div className="text-sm text-muted-foreground">{s.label}</div>
                {cardsEnabled && cardsQ.isLoading ? (
                  <Skeleton className="h-8 w-32 mt-2" />
                ) : (
                  <div className="font-display text-3xl font-bold mt-1">{s.value}</div>
                )}
              </div>
            ))}
          </div>

          <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-lg">Total sales list (orders)</h3>
            <p className="text-sm text-muted-foreground">Paginated orders list.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr className="border-b">
                <th className="text-left p-3 font-semibold">Order ID</th>
                <th className="text-left p-3 font-semibold">Date & Time</th>
                <th className="text-left p-3 font-semibold">Seller</th>
                <th className="text-left p-3 font-semibold">Payment</th>
                <th className="text-left p-3 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {listQ.isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={`sk-${i}`} className="border-b">
                      <td className="p-3"><Skeleton className="h-4 w-20" /></td>
                      <td className="p-3"><Skeleton className="h-4 w-40" /></td>
                      <td className="p-3"><Skeleton className="h-4 w-28" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                      <td className="p-3"><Skeleton className="h-6 w-20" /></td>
                    </tr>
                  ))
                : orders.map((o) => (
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
                  ))}
            </tbody>
          </table>
          {!listQ.isLoading && orders.length === 0 && (
            <div className="text-center text-muted-foreground py-12">No orders found.</div>
          )}
        </div>

        {pagination?.total_pages && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
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
                      if (page >= pagination.total_pages) return;
                      navigate({ search: (prev) => ({ ...prev, page: page + 1 }) });
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
      </div>
    </AppShell>
  );
}

