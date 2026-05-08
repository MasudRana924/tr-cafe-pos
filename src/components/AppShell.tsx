import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { authStore, useAuthStore } from "@/lib/authStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NavItem = { to: string; label: string; icon: ReactNode };

export function AppShell({
  items,
  title,
  children,
}: {
  items: NavItem[];
  title: string;
  children: ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = () => {
    authStore.logout();
    navigate({ to: "/login" });
  };

  return (
    <div className={`h-screen flex ${title === "Admin Workspace" ? "admin-bg" : title === "Sales Workspace" ? "bg-white" : ""}`}>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static z-40 inset-y-0 left-0 w-72 bg-sidebar border-r border-sidebar-border transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full p-5">
          <div className="flex items-center gap-3 px-2 pb-6">
            <div className="w-10 h-10 rounded-xl gradient-primary grid place-items-center text-primary-foreground font-bold">
              H
            </div>
            <div>
              <div className="font-display font-bold text-base leading-tight">Hall Canteen</div>
              <div className="text-xs text-muted-foreground">{title}</div>
            </div>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {items.map((it) => {
              const active = path === it.to || path.startsWith(it.to + "/");
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    active
                      ? "text-primary"
                      : "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <span className="w-5 h-5">{it.icon}</span>
                  {it.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-sidebar-border pt-4 mt-4">
            <div className="flex items-center gap-3 px-2 pb-3">
              <div className="w-9 h-9 rounded-full bg-accent text-accent-foreground grid place-items-center font-semibold">
                {user?.name?.[0] ?? "?"}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{user?.name}</div>
                <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start gap-3" onClick={logout}>
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/30 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <header className="lg:hidden sticky top-0 z-20 glass px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setOpen((v) => !v)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <span className="font-display font-semibold">Hall Canteen POS</span>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1500px] w-full mx-auto animate-fade-in overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
