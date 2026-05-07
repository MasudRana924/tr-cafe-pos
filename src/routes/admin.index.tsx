import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
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

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const orders = useStore((s) => s.orders);
  const products = useStore((s) => s.products);

  const totalSales = orders.reduce((a, o) => a + o.total, 0);
  const totalOrders = orders.length;
  const lowStock = products.filter((p) => p.quantity <= 10).length;

  const dailySales = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = d.toLocaleDateString("en-US", { weekday: "short" });
      map.set(k, 0);
    }
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const days = (Date.now() - d.getTime()) / 86400000;
      if (days <= 7) {
        const k = d.toLocaleDateString("en-US", { weekday: "short" });
        map.set(k, (map.get(k) ?? 0) + o.total);
      }
    });
    return Array.from(map, ([day, sales]) => ({ day, sales }));
  }, [orders]);

  const productSales = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) =>
      o.items.forEach((it) => map.set(it.name, (map.get(it.name) ?? 0) + it.qty)),
    );
    return Array.from(map, ([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty);
  }, [orders]);

  const top = productSales.slice(0, 5);
  const bottom = [...productSales].reverse().slice(0, 5);

  const stats = [
    { label: "Total Sales", value: `৳${totalSales.toLocaleString()}`, icon: DollarSign, trend: "+12.5%", color: "text-success" },
    { label: "Total Orders", value: totalOrders.toString(), icon: ShoppingCart, trend: "+8.2%", color: "text-success" },
    { label: "Total Products", value: products.length.toString(), icon: Package, trend: "Stable", color: "text-muted-foreground" },
    { label: "Low Stock", value: lowStock.toString(), icon: AlertTriangle, trend: "Needs attention", color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">An overview of your canteen performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={s.label} className="card-soft p-5 hover-lift animate-scale-in" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground grid place-items-center">
                <s.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-medium ${s.color}`}>{s.trend}</span>
            </div>
            <div className="text-2xl font-display font-bold">{s.value}</div>
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
          </div>
        </div>

        <div className="card-soft p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-success" />
            <h3 className="font-display font-semibold text-lg">Best Selling</h3>
          </div>
          <div className="h-72">
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
          </div>
        </div>
      </div>

      <div className="card-soft p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-destructive" />
          <h3 className="font-display font-semibold text-lg">Lowest Selling Products</h3>
        </div>
        <div className="h-64">
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
        </div>
      </div>
    </div>
  );
}
