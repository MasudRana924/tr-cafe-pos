import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { AlertTriangle, CheckCircle2, PackageX } from "lucide-react";

export const Route = createFileRoute("/admin/inventory")({
  component: InventoryPage,
});

function InventoryPage() {
  const products = useStore((s) => s.products);
  const low = products.filter((p) => p.quantity <= 10 && p.quantity > 0);
  const out = products.filter((p) => p.quantity === 0);
  const ok = products.filter((p) => p.quantity > 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Inventory</h1>
        <p className="text-muted-foreground">Stock levels at a glance.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Stat label="In Stock" value={ok.length} icon={CheckCircle2} color="success" />
        <Stat label="Low Stock" value={low.length} icon={AlertTriangle} color="warning" />
        <Stat label="Out of Stock" value={out.length} icon={PackageX} color="destructive" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((p, i) => {
          const status =
            p.quantity === 0 ? "out" : p.quantity <= 10 ? "low" : "ok";
          return (
            <div key={p.id} className="card-soft p-5 hover-lift animate-scale-in" style={{ animationDelay: `${i * 30}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{p.image}</div>
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

function Stat({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; color: string }) {
  return (
    <div className="card-soft p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className={`w-5 h-5 text-${color}`} />
      </div>
      <div className="font-display text-3xl font-bold">{value}</div>
    </div>
  );
}
