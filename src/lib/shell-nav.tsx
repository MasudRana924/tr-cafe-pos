import {
  LayoutDashboard,
  Package,
  Boxes,
  Receipt,
  BarChart3,
  Users,
  ShoppingCart,
  History,
} from "lucide-react";
import type { NavItem } from "@/components/AppShell";

/** Sidebar links for `/admin/**`. */
export function getAdminNavItems(): NavItem[] {
  return [
    { to: "/admin", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { to: "/admin/products", label: "Products", icon: <Package className="w-5 h-5" /> },
    { to: "/admin/inventory", label: "Inventory", icon: <Boxes className="w-5 h-5" /> },
    { to: "/admin/orders", label: "Orders", icon: <Receipt className="w-5 h-5" /> },
    { to: "/admin/reports", label: "Sales Reports", icon: <BarChart3 className="w-5 h-5" /> },
    { to: "/admin/users", label: "Users", icon: <Users className="w-5 h-5" /> },
  ];
}

/** Sidebar links for `/pos/**`. */
export function getSalesmanNavItems(): NavItem[] {
  return [
    { to: "/pos", label: "POS", icon: <ShoppingCart className="w-5 h-5" /> },
    { to: "/pos/orders", label: "Orders", icon: <Receipt className="w-5 h-5" /> },
    { to: "/pos/history", label: "History", icon: <History className="w-5 h-5" /> },
  ];
}
