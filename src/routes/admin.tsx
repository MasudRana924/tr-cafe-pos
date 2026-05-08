import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ensureAuthed } from "@/lib/requireAuth";
import { getAdminNavItems } from "@/lib/shell-nav";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const res = await ensureAuthed("admin");
    if (!res.ok) throw redirect({ to: res.user ? "/pos" : "/login" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AppShell title="Admin Workspace" items={getAdminNavItems()}>
      <Outlet />
    </AppShell>
  );
}
