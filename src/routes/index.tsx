import { createFileRoute, redirect } from "@tanstack/react-router";
import { ensureAuthed } from "@/lib/requireAuth";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const res = await ensureAuthed();
    if (!res.ok) throw redirect({ to: "/login" });
    if (res.user?.role === "admin") throw redirect({ to: "/admin" });
    throw redirect({ to: "/pos" });
  },
  component: () => null,
});
