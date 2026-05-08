import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ensureAuthed } from "@/lib/requireAuth";
import { getSalesmanNavItems } from "@/lib/shell-nav";

export const Route = createFileRoute("/pos")({
  beforeLoad: async () => {
    const res = await ensureAuthed("salesman");
    if (!res.ok) throw redirect({ to: res.user ? "/admin" : "/login" });
  },
  component: SalesmanLayout,
});

function SalesmanLayout() {
  return (
    <AppShell title="Sales Workspace" items={getSalesmanNavItems()}>
      <Outlet />
    </AppShell>
  );
}
