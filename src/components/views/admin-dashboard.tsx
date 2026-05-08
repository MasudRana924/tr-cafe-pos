import { DollarSign, ShoppingCart, Package, AlertTriangle, TrendingUp } from "lucide-react";
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
import { StatCard } from "@/components/cards/stat-card";

export function AdminDashboard() {
  const summaryQ = useSummaryQuery({ refetchOnMount: "always" });
  const bestQ = useBestSellingQuery({ refetchOnMount: "always" });
  const historyQ = useSalesHistoryQuery({ refetchOnMount: "always" });
  const productsQ = useProductsQuery({ refetchOnMount: "always" });
  const summary = summaryQ.data;
  const best = bestQ.data;
  const history = historyQ.data?.summary;
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

  const stats = [
    {
      label: "Total Sales",
      value: `৳${totalSales.toLocaleString()}`,
      icon: DollarSign,
      trend: "+12.5%",
      trendClass: "text-success",
      className: "bg-green-50 border-green-200 hover-lift animate-scale-in",
    },
    {
      label: "Total Orders",
      value: totalOrders.toString(),
      icon: ShoppingCart,
      trend: "+8.2%",
      trendClass: "text-success",
      className: "bg-blue-50 border-blue-200 hover-lift animate-scale-in",
    },
    {
      label: "Total Products",
      value: totalProducts.toString(),
      icon: Package,
      trend: "Stable",
      trendClass: "text-muted-foreground",
      className: "bg-purple-50 border-purple-200 hover-lift animate-scale-in",
    },
    {
      label: "Low Stock",
      value: lowStock.toString(),
      icon: AlertTriangle,
      trend: "Needs attention",
      trendClass: "text-destructive",
      className: "bg-red-50 border-red-200 hover-lift animate-scale-in",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">An overview of your canteen performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
            trend={s.trend}
            trendClassName={s.trendClass}
            loading={isPending}
            valueClassName="text-2xl font-display font-bold"
            className={s.className}
            style={{ animationDelay: `${i * 60}ms` }}
          />
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
    </div>
  );
}
