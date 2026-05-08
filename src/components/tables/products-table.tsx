import { Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types/models";

type Props = {
  loading: boolean;
  products: Product[];
  deletingId: string | number | null;
  onEdit: (p: Product) => void;
  onDelete: (id: string | number) => void;
};

export function ProductsTable({ loading, products, deletingId, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr className="border-b">
            <th className="text-left p-3 font-semibold">Icon</th>
            <th className="text-left p-3 font-semibold">Name</th>
            <th className="text-left p-3 font-semibold">Category</th>
            <th className="text-left p-3 font-semibold">Price</th>
            <th className="text-left p-3 font-semibold">Stock</th>
            <th className="text-left p-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={`sk-${i}`} className="border-b">
                  <td className="p-3">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                  </td>
                  <td className="p-3">
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </td>
                  <td className="p-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="p-3">
                    <Skeleton className="h-5 w-16" />
                  </td>
                  <td className="p-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </td>
                </tr>
              ))
            : products.map((p: Product, i: number) => (
                <tr key={p.id} className="border-b hover:bg-muted/50" style={{ animationDelay: `${i * 30}ms` }}>
                  <td className="p-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-muted grid place-items-center overflow-hidden">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-2xl">📦</div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.category}</div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{p.category}</td>
                  <td className="p-3">
                    <div className="text-primary font-display font-bold">৳{p.price}</div>
                  </td>
                  <td className="p-3">
                    <span className={`text-xs font-medium ${p.quantity <= 10 ? "text-destructive" : "text-muted-foreground"}`}>
                      Stock: {p.quantity}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(p)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        disabled={deletingId !== null}
                        onClick={() => onDelete(p.id)}
                      >
                        {deletingId !== null && String(deletingId) === String(p.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
      {!loading && products.length === 0 && <div className="text-center text-muted-foreground py-12">No products found.</div>}
    </div>
  );
}
