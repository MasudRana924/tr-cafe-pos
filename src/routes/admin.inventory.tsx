import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, PackageX, Search } from "lucide-react";
import { useProductsQuery } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const Route = createFileRoute("/admin/inventory")({
  component: InventoryPage,
});

function InventoryPage() {
  const { data: products = [] } = useProductsQuery({ refetchOnMount: "always" });
  const [q, setQ] = useState("");
  const filtered = products.filter((p) => String(p.name ?? "").toLowerCase().includes(q.toLowerCase()));

  const low = filtered.filter((p) => p.quantity <= 10 && p.quantity > 0);
  const out = filtered.filter((p) => p.quantity === 0);
  const ok = filtered.filter((p) => p.quantity > 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Inventory</h1>
        <p className="text-muted-foreground">Stock levels at a glance.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            className="pl-9"
            style={{ width: "510px", height: "50px", borderRadius: "16px", backgroundColor: "#F5F5F5", border: "1px solid #F5F5F5", boxShadow: "none" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Stat label="In Stock" value={ok.length} icon={CheckCircle2} color="success" bgColor="bg-green-50" borderColor="border-green-200" />
        <Stat label="Low Stock" value={low.length} icon={AlertTriangle} color="warning" bgColor="bg-yellow-50" borderColor="border-yellow-200" />
        <Stat label="Out of Stock" value={out.length} icon={PackageX} color="destructive" bgColor="bg-red-50" borderColor="border-red-200" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((p, i) => {
          const status =
            p.quantity === 0 ? "out" : p.quantity <= 10 ? "low" : "ok";
          return (
            <div key={p.id} className="card-soft p-5 hover-lift animate-scale-in" style={{ animationDelay: `${i * 30}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">📦</div>
                {status !== "ok" && (
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status === "out" ? "bg-destructive/10 text-destructive" : "bg-warning/15 text-warning-foreground"}`}>
                    {status === "out" ? "Out of stock" : "Low stock"}
                  </span>
                )}
              </div>
              <div className="font-semibold">{p.name}</div>
              <div className="text-xs text-muted-foreground mb-3">{p.category}</div>
              <div className="flex items-baseline justify-between">
                <span className="font-display text-2xl font-bold">{p.quantity}</span>
                <span className="text-xs text-muted-foreground">units left</span>
              </div>
              <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${status === "out" ? "bg-destructive" : status === "low" ? "bg-warning" : "bg-primary"}`}
                  style={{ width: `${Math.min(100, (p.quantity / 60) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, color, bgColor, borderColor }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string; borderColor: string }) {
  return (
    <div className={`${bgColor} p-5 rounded-xl border ${borderColor}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className={`w-5 h-5 text-${color}`} />
      </div>
      <div className="font-display text-3xl font-bold">{value}</div>
    </div>
  );
}
