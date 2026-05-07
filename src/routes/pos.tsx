import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { ShoppingCart, Receipt, History } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { store } from "@/lib/store";

export const Route = createFileRoute("/pos")({
  beforeLoad: () => {
    const u = store.get().user;
    if (!u) throw redirect({ to: "/login" });
    if (u.role !== "salesman") throw redirect({ to: "/admin" });
  },
  component: SalesmanLayout,
});

function SalesmanLayout() {
  return (
    <AppShell
      title="Sales Workspace"
      items={[
        { to: "/pos", label: "POS", icon: <ShoppingCart className="w-5 h-5" /> },
        { to: "/pos/orders", label: "Orders", icon: <Receipt className="w-5 h-5" /> },
        { to: "/pos/history", label: "History", icon: <History className="w-5 h-5" /> },
      ]}
    >
      <Outlet />
    </AppShell>
  );
}
