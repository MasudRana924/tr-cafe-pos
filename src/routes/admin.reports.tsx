import { createFileRoute } from "@tanstack/react-router";
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
import { useSalesHistoryQuery, useSummaryQuery } from "@/hooks/useReports";

export const Route = createFileRoute("/admin/reports")({
  component: ReportsPage,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function ReportsPage() {
  const { data: summary } = useSummaryQuery({ refetchOnMount: "always" });
  const { data: salesHistory } = useSalesHistoryQuery({ refetchOnMount: "always" });
  const { data: orders = [] } = useOrdersQuery({ refetchOnMount: "always" });

  const monthly = useMemo(() => {
    const rows = Array.isArray(salesHistory) ? salesHistory : [];
    if (!rows.length) return [];
    return rows.map((r: any) => ({
      date: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      sales: Number(r.sales ?? 0),
    }));
  }, [salesHistory]);

  const byPayment = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => map.set(o.payment, (map.get(o.payment) ?? 0) + o.total));
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [orders]);

  const totalRevenue = orders.reduce((a, o) => a + o.total, 0);
  const avgOrder = orders.length ? Math.round(totalRevenue / orders.length) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Sales Reports</h1>
        <p className="text-muted-foreground">Revenue insights & breakdowns.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label="Total Revenue" value={`৳${Number((summary as any)?.total_sales ?? totalRevenue).toLocaleString()}`} bgColor="bg-blue-50" borderColor="border-blue-200" />
        <Stat label="Total Orders" value={String((summary as any)?.total_orders ?? orders.length)} bgColor="bg-green-50" borderColor="border-green-200" />
        <Stat label="Avg. Order" value={`৳${avgOrder}`} bgColor="bg-purple-50" borderColor="border-purple-200" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card-soft p-5 xl:col-span-2">
          <h3 className="font-display font-semibold text-lg mb-4">Sales over time</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="sales" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-soft p-5">
          <h3 className="font-display font-semibold text-lg mb-4">By Payment Method</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byPayment} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4}>
                  {byPayment.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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
    </div>
  );
}

function Stat({ label, value, bgColor, borderColor }: { label: string; value: string; bgColor?: string; borderColor?: string }) {
  return (
    <div className={`${bgColor} p-5 rounded-xl border ${borderColor}`}>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-display text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}
