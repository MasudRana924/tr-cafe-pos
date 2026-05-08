import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getPageItems } from "@/lib/pagination";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
  className?: string;
};

/**
 * URL-agnostic pagination bar; parent wires `onPageChange` to router search or local state.
 */
export function ListPagination({ page, totalPages, onPageChange, className }: Props) {
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 ${className ?? ""}`}>
      <div className="text-sm text-muted-foreground">
        Page <span className="font-medium text-foreground">{page}</span> of{" "}
        <span className="font-medium text-foreground">{totalPages}</span>
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
                onPageChange(page - 1);
              }}
            />
          </PaginationItem>
          {getPageItems(page, totalPages).map((it, idx) =>
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
                    onPageChange(it);
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
              className={page >= totalPages ? "pointer-events-none opacity-50" : undefined}
              onClick={(e) => {
                e.preventDefault();
                if (page >= totalPages) return;
                onPageChange(page + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
