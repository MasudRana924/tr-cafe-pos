import { createFileRoute } from "@tanstack/react-router";
import { AdminReportsView } from "@/components/views/admin-reports";

export const Route = createFileRoute("/admin/reports")({
  validateSearch: (s: Record<string, unknown>) => ({
    page: typeof s.page === "string" ? Number(s.page) : typeof s.page === "number" ? s.page : 1,
    per_page: typeof s.per_page === "string" ? Number(s.per_page) : typeof s.per_page === "number" ? s.per_page : 10,
    seller_id: typeof s.seller_id === "string" ? s.seller_id : undefined,
  }),
  component: AdminReportsRoute,
});

function AdminReportsRoute() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return <AdminReportsView search={search} navigate={navigate} />;
}
