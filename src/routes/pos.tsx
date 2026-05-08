import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { ShoppingCart, Receipt, History, BarChart3 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ensureAuthed } from "@/lib/requireAuth";

export const Route = createFileRoute("/pos")({
  beforeLoad: async () => {
    const res = await ensureAuthed("salesman");
    if (!res.ok) throw redirect({ to: res.user ? "/admin" : "/login" });
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
        { to: "/sales-report", label: "Sales Report", icon: <BarChart3 className="w-5 h-5" /> },
      ]}
    >
      <Outlet />
    </AppShell>
  );
}
