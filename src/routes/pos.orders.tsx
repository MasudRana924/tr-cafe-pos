import { createFileRoute } from "@tanstack/react-router";
import { OrdersList } from "@/components/OrdersList";
import { useOrdersPagedQuery } from "@/hooks/useOrdersPaged";
import { ListPagination } from "@/components/pagination/list-pagination";

export const Route = createFileRoute("/pos/orders")({
  validateSearch: (s: Record<string, unknown>) => ({
    page: typeof s.page === "string" ? Number(s.page) : typeof s.page === "number" ? s.page : 1,
    per_page: typeof s.per_page === "string" ? Number(s.per_page) : typeof s.per_page === "number" ? s.per_page : 10,
  }),
  component: () => {
    const search = Route.useSearch();
    const nav = Route.useNavigate();
    const page = Number.isFinite(search.page) && search.page > 0 ? search.page : 1;
    const perPage = Number.isFinite(search.per_page) && search.per_page > 0 ? search.per_page : 10;

    const q = useOrdersPagedQuery({ page, per_page: perPage });
    const orders = q.data?.items ?? [];
    const pagination = q.data?.pagination;
    const today = new Date().toDateString();
    const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Today's Orders</h1>
          <p className="text-muted-foreground">All orders processed today.</p>
        </div>
        <OrdersList orders={todayOrders} pending={q.isLoading} />

        {pagination?.total_pages != null && pagination.total_pages > 0 && (
          <ListPagination page={page} totalPages={pagination.total_pages} onPageChange={(p) => nav({ search: (prev) => ({ ...prev, page: p }) })} />
        )}
      </div>
    );
  },
});
