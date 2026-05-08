import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useOrdersQuery } from "@/hooks/useOrders";
import { useSalesHistoryQuery } from "@/hooks/useReports";
import { useSalesListQuery, useSellerSalesCardsQuery } from "@/hooks/useSellerSalesReport";
import { useSalesmenQuery } from "@/hooks/useUsers";
import { StatCard } from "@/components/cards/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { SellerSelectField } from "@/components/sales/seller-select-field";
import { OrdersDataTable } from "@/components/tables/orders-data-table";
import { ListPagination } from "@/components/pagination/list-pagination";
import type { AuthUser } from "@/types/models";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export type AdminReportsSearch = {
  page: number;
  per_page: number;
  seller_id?: string;
};

type Props = {
  search: AdminReportsSearch;
  navigate: (opts: { search: (prev: AdminReportsSearch) => AdminReportsSearch; replace?: boolean }) => void;
};

export function AdminReportsView({ search, navigate }: Props) {
  const historyQ = useSalesHistoryQuery({ refetchOnMount: "always" });
  const summary = historyQ.data?.summary;
  const chartRows = historyQ.data?.chartRows ?? [];
  const { data: orders = [] } = useOrdersQuery({ refetchOnMount: "always" });

  const salesmenQ = useSalesmenQuery({ refetchOnMount: "always" });
  const salesmen: AuthUser[] = useMemo(() => {
    const raw = Array.isArray(salesmenQ.data) ? salesmenQ.data : [];
    return raw.filter((u) => u.role === "salesman");
  }, [salesmenQ.data]);

  const sellerIdEffective = search.seller_id?.trim() ?? "";
  const cardsEnabled = Boolean(sellerIdEffective);
  const sellerInList =
    Boolean(sellerIdEffective) && salesmen.some((u) => String(u.id) === String(sellerIdEffective));

  const page = Number.isFinite(search.page) && search.page > 0 ? search.page : 1;
  const perPage = Number.isFinite(search.per_page) && search.per_page > 0 ? search.per_page : 10;

  const cardsQ = useSellerSalesCardsQuery({ sellerId: sellerIdEffective, enabled: cardsEnabled });
  const listQ = useSalesListQuery({
    page,
    per_page: perPage,
    seller_id: search.seller_id ? search.seller_id : undefined,
  });

  const pagination = listQ.data?.pagination;
  const listOrders = listQ.data?.orders ?? [];

  const sellerStats = useMemo(() => {
    const d = cardsQ.data;
    return [
      { label: "Today Sales", value: d ? `৳${d.today_sales.toLocaleString()}` : "—", bgColor: "bg-green-50", borderColor: "border-green-200" },
      { label: "Weekly Sales", value: d ? `৳${d.weekly_sales.toLocaleString()}` : "—", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
      { label: "Monthly Sales", value: d ? `৳${d.monthly_sales.toLocaleString()}` : "—", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
      { label: "Total Orders", value: d ? String(d.total_orders) : "—", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
    ];
  }, [cardsQ.data]);

  const monthly = useMemo(() => {
    if (!chartRows.length) return [];
    return chartRows.map((r) => ({
      date: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      sales: Number(r.sales ?? 0),
    }));
  }, [chartRows]);

  const byPayment = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => map.set(o.payment, (map.get(o.payment) ?? 0) + o.total));
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [orders]);

  const fmt = (n: number) => `৳${Number(n).toLocaleString()}`;

  const patchSearch = (partial: Partial<AdminReportsSearch>) => {
    navigate({
      search: (prev) => ({ ...prev, ...partial }),
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Sales Reports</h1>
        <p className="text-muted-foreground">Revenue insights, seller performance, and order breakdowns.</p>
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-muted-foreground">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {historyQ.isLoading ? (
            <>
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
            </>
          ) : (
            <>
              <StatCard variant="metric" label="Today Sales" value={fmt(summary?.today_sales ?? 0)} className="bg-blue-50 border-blue-200" />
              <StatCard variant="metric" label="Weekly Sales" value={fmt(summary?.weekly_sales ?? 0)} className="bg-green-50 border-green-200" />
              <StatCard variant="metric" label="Monthly Sales" value={fmt(summary?.monthly_sales ?? 0)} className="bg-purple-50 border-purple-200" />
            </>
          )}
        </div>

        <div className="">
      
          <div className="w-2/4 mx-auto p-5 ">
            <h3 className="font-display font-semibold text-lg mb-4">By Payment Method</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byPayment} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4}>
                    {byPayment.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {byPayment.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    {p.name}
                  </span>
                  <span className="font-medium">৳{p.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4  pt-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Seller performance</h2>
            {/* <p className="text-sm text-muted-foreground">Choose a salesman to see their sales summary and order list (same as former Seller Sales page).</p> */}
          </div>
          <SellerSelectField
            salesmen={salesmen}
            loading={salesmenQ.isLoading}
            valueId={sellerIdEffective}
            showOrphanOption={Boolean(sellerIdEffective && !sellerInList && salesmenQ.isFetched)}
            onChange={(id) => patchSearch({ seller_id: id, page: 1 })}
          />
        </div>
{/* 
        {!cardsEnabled && !salesmenQ.isLoading && (
          <div className="rounded-xl border border-dashed border-muted-foreground/40 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            {salesmen.length === 0 ? "No salespeople yet. Add one under Users." : "Select a salesman to load summary cards and their order list."}
          </div>
        )} */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {sellerStats.map((s) => (
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

        <div className="">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-lg">Total sales list (orders)</h3>
              <p className="text-sm text-muted-foreground">Paginated orders for the selected seller filter.</p>
            </div>
          </div>

          <OrdersDataTable orders={listOrders} loading={listQ.isLoading} variant="flat" />

          {pagination?.total_pages != null && pagination.total_pages > 0 && (
            <div className="pt-4">
              <ListPagination page={page} totalPages={pagination.total_pages} onPageChange={(p) => patchSearch({ page: p })} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
