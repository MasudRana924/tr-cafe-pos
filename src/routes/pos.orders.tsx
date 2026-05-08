import { createFileRoute } from "@tanstack/react-router";
import { OrdersList } from "@/components/OrdersList";
import { useOrdersPagedQuery } from "@/hooks/useOrdersPaged";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

    const getPageItems = (p: number, totalPages: number): Array<number | "…"> => {
      if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
      const set = new Set<number>([1, totalPages, p - 1, p, p + 1]);
      const pages = Array.from(set)
        .filter((x) => x >= 1 && x <= totalPages)
        .sort((a, b) => a - b);
      const out: Array<number | "…"> = [];
      for (let i = 0; i < pages.length; i++) {
        const cur = pages[i];
        const prev = pages[i - 1];
        if (i > 0 && cur - prev! > 1) out.push("…");
        out.push(cur);
      }
      return out;
    };

    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Today's Orders</h1>
          <p className="text-muted-foreground">All orders processed today.</p>
        </div>
        <OrdersList orders={todayOrders} pending={q.isLoading} />

        {pagination?.total_pages && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Page <span className="font-medium text-foreground">{page}</span> of{" "}
              <span className="font-medium text-foreground">{pagination.total_pages}</span>
            </div>
            <Pagination className="mx-0 justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      if (page <= 1) return;
                      nav({ search: (prev) => ({ ...prev, page: page - 1 }) });
                    }}
                  />
                </PaginationItem>
                {getPageItems(page, pagination.total_pages).map((it, idx) =>
                  it === "…" ? (
                    <PaginationItem key={`el-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={it}>
                      <PaginationLink
                        href="#"
                        isActive={it === page}
                        onClick={(e) => {
                          e.preventDefault();
                          nav({ search: (prev) => ({ ...prev, page: it }) });
                        }}
                      >
                        {it}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    className={page >= pagination.total_pages ? "pointer-events-none opacity-50" : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      if (page >= pagination.total_pages) return;
                      nav({ search: (prev) => ({ ...prev, page: page + 1 }) });
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    );
  },
});
