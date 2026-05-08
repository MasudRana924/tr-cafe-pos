import { createFileRoute } from "@tanstack/react-router";
import { DollarSign, ShoppingCart, Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo } from "react";
import { useBestSellingQuery, useSalesHistoryQuery, useSummaryQuery } from "@/hooks/useReports";
import { useProductsQuery } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const summaryQ = useSummaryQuery({ refetchOnMount: "always" });
  const bestQ = useBestSellingQuery({ refetchOnMount: "always" });
  const historyQ = useSalesHistoryQuery({ refetchOnMount: "always" });
  const productsQ = useProductsQuery({ refetchOnMount: "always" });
  const summary = summaryQ.data;
  const best = bestQ.data;
  const history = historyQ.data;
  const isPending = summaryQ.isLoading || bestQ.isLoading || historyQ.isLoading || productsQ.isLoading;

  const totalSales = Number((summary as any)?.total_revenue ?? 0);
  const totalOrders = Number((summary as any)?.total_orders ?? 0);
  const products = productsQ.data ?? [];
  const totalProducts = products.length;
  const lowStock = products.filter((p: any) => Number(p?.quantity ?? 0) <= 10).length;

  const dailySales = useMemo(() => {
    const s = history ?? { today_sales: 0, weekly_sales: 0, monthly_sales: 0 };
    return [
      { day: "Today", sales: Number((s as any).today_sales ?? 0) },
      { day: "Weekly", sales: Number((s as any).weekly_sales ?? 0) },
      { day: "Monthly", sales: Number((s as any).monthly_sales ?? 0) },
    ];
  }, [history]);

  const top = (Array.isArray(best) ? best : []).slice(0, 5);
  const bottom = (Array.isArray(best) ? [...best].reverse() : []).slice(0, 5);

  const stats = [
    { label: "Total Sales", value: `৳${totalSales.toLocaleString()}`, icon: DollarSign, trend: "+12.5%", color: "text-success", bgColor: "bg-green-50", borderColor: "border-green-200" },
    { label: "Total Orders", value: totalOrders.toString(), icon: ShoppingCart, trend: "+8.2%", color: "text-success", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
    { label: "Total Products", value: totalProducts.toString(), icon: Package, trend: "Stable", color: "text-muted-foreground", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
    { label: "Low Stock", value: lowStock.toString(), icon: AlertTriangle, trend: "Needs attention", color: "text-destructive", bgColor: "bg-red-50", borderColor: "border-red-200" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">An overview of your canteen performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={s.label} className={`${s.bgColor} p-5 rounded-xl border ${s.borderColor} hover-lift animate-scale-in`} style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground grid place-items-center">
                <s.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-medium ${s.color}`}>{s.trend}</span>
            </div>
            {isPending ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-display font-bold">{s.value}</div>
            )}
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card-soft p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-lg">Daily Sales</h3>
              <p className="text-sm text-muted-foreground">Last 7 days</p>
            </div>
          </div>
          <div className="h-72">
            {historyQ.isLoading ? (
              <div className="h-full w-full">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailySales}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="sales" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: "var(--primary)" }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card-soft p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-success" />
            <h3 className="font-display font-semibold text-lg">Best Selling</h3>
          </div>
          <div className="h-72">
            {bestQ.isLoading ? (
              <div className="h-full w-full">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={11} width={90} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                    }}
                  />
                  <Bar dataKey="qty" fill="var(--primary)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="card-soft p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-destructive" />
          <h3 className="font-display font-semibold text-lg">Lowest Selling Products</h3>
        </div>
        <div className="h-64">
          {bestQ.isLoading ? (
            <div className="h-full w-full">
              <Skeleton className="h-full w-full" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bottom}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="qty" fill="var(--destructive)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
