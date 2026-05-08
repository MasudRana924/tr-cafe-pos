import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { OrderListFilters } from "@/components/filters/order-list-filters";
import { OrdersDataTable } from "@/components/tables/orders-data-table";
import { ListPagination } from "@/components/pagination/list-pagination";
import { useOrdersPagedQuery } from "@/hooks/useOrdersPaged";

export const Route = createFileRoute("/admin/orders")({
  validateSearch: (s: Record<string, unknown>) => ({
    page: typeof s.page === "string" ? Number(s.page) : typeof s.page === "number" ? s.page : 1,
    per_page: typeof s.per_page === "string" ? Number(s.per_page) : typeof s.per_page === "number" ? s.per_page : 10,
    q: typeof s.q === "string" ? s.q : "",
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const page = Number.isFinite(search.page) && search.page > 0 ? search.page : 1;
  const perPage = Number.isFinite(search.per_page) && search.per_page > 0 ? search.per_page : 10;
  const q = search.q ?? "";

  const ordersQ = useOrdersPagedQuery({ page, per_page: perPage });
  const orders = ordersQ.data?.items ?? [];
  const pagination = ordersQ.data?.pagination;
  const [pay, setPay] = useState("all");

  const filtered = orders.filter(
    (o) => String(o.id).toLowerCase().includes(q.toLowerCase()) && (pay === "all" || o.payment === pay),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">All transactions across the canteen.</p>
      </div>

      <OrderListFilters
        searchQuery={q}
        onSearchQueryChange={(next) => navigate({ search: (prev) => ({ ...prev, q: next, page: 1 }), replace: true })}
        paymentFilter={pay}
        onPaymentFilterChange={setPay}
      />

      <OrdersDataTable orders={filtered} loading={ordersQ.isLoading} variant="withLineItems" />

      {pagination?.total_pages != null && pagination.total_pages > 0 && (
        <ListPagination
          page={page}
          totalPages={pagination.total_pages}
          onPageChange={(p) => navigate({ search: (prev) => ({ ...prev, page: p }) })}
        />
      )}
    </div>
  );
}
