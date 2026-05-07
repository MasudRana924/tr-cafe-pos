import { createFileRoute, redirect } from "@tanstack/react-router";
import { store } from "@/lib/store";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const u = store.get().user;
    if (!u) throw redirect({ to: "/login" });
    if (u.role === "admin") throw redirect({ to: "/admin" });
    throw redirect({ to: "/pos" });
  },
  component: () => null,
});
