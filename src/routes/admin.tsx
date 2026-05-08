import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { LayoutDashboard, Package, Boxes, Receipt, BarChart3, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ensureAuthed } from "@/lib/requireAuth";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const res = await ensureAuthed("admin");
    if (!res.ok) throw redirect({ to: res.user ? "/pos" : "/login" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AppShell
      title="Admin Workspace"
      items={[
        { to: "/admin", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
        { to: "/admin/products", label: "Products", icon: <Package className="w-5 h-5" /> },
        { to: "/admin/inventory", label: "Inventory", icon: <Boxes className="w-5 h-5" /> },
        { to: "/admin/orders", label: "Orders", icon: <Receipt className="w-5 h-5" /> },
        { to: "/admin/reports", label: "Sales Reports", icon: <BarChart3 className="w-5 h-5" /> },
        { to: "/sales-report", label: "Seller Sales", icon: <BarChart3 className="w-5 h-5" /> },
        { to: "/admin/users", label: "Users", icon: <Users className="w-5 h-5" /> },
      ]}
    >
      <Outlet />
    </AppShell>
  );
}
