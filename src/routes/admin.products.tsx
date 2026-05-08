import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { Product } from "@/types/models";
import { useDeleteProductMutation } from "@/hooks/useProducts";
import { useProductsPagedQuery } from "@/hooks/useProductsPaged";
import { ProductDialog } from "@/components/dialogs/product-dialog";
import { ProductsTable } from "@/components/tables/products-table";
import { ListPagination } from "@/components/pagination/list-pagination";

export const Route = createFileRoute("/admin/products")({
  validateSearch: (s: Record<string, unknown>) => ({
    page: typeof s.page === "string" ? Number(s.page) : typeof s.page === "number" ? s.page : 1,
    per_page: typeof s.per_page === "string" ? Number(s.per_page) : typeof s.per_page === "number" ? s.per_page : 10,
    q: typeof s.q === "string" ? s.q : "",
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const page = Number.isFinite(search.page) && search.page > 0 ? search.page : 1;
  const perPage = Number.isFinite(search.per_page) && search.per_page > 0 ? search.per_page : 10;
  const q = search.q ?? "";

  const productsQ = useProductsPagedQuery({ page, per_page: perPage, q });
  const products = productsQ.data?.items ?? [];
  const pagination = productsQ.data?.pagination;

  const [cat, setCat] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const del = useDeleteProductMutation();

  const categories = Array.from(
    new Set(products.map((p: Product) => p.category).filter((c): c is string => Boolean(c?.toString().trim()))),
  );
  const filtered = products.filter((p: Product) => cat === "all" || p.category === cat);

  const onDelete = async (id: string | number) => {
    try {
      setDeletingId(id);
      await del.mutateAsync(id);
      toast.success("Product deleted");
    } catch (e: any) {
      toast.error(e?.message ?? "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your menu items.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="bg-black text-white hover:bg-black/90 shadow-none"
        >
          <Plus className="w-4 h-4" /> New Product
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              navigate({
                search: (prev) => ({ ...prev, q: e.target.value, page: 1 }),
                replace: true,
              });
            }}
            placeholder="Search products..."
            className="pl-9"
            style={{
              width: "510px",
              height: "50px",
              borderRadius: "16px",
              backgroundColor: "#F5F5F5",
              border: "1px solid #F5F5F5",
              boxShadow: "none",
              color: "#797979",
            }}
          />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="sm:w-56 h-[50px] rounded-lg" style={{ backgroundColor: "#F5F5F5", border: "1px solid #F5F5F5", boxShadow: "none" }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ProductsTable
        loading={productsQ.isLoading}
        products={filtered}
        deletingId={deletingId}
        onEdit={(p) => {
          setEditing(p);
          setOpen(true);
        }}
        onDelete={onDelete}
      />

      {pagination?.total_pages != null && pagination.total_pages > 0 && (
        <ListPagination
          page={page}
          totalPages={pagination.total_pages}
          onPageChange={(p) => navigate({ search: (prev) => ({ ...prev, page: p }) })}
        />
      )}

      <ProductDialog open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}
