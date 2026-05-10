import { Search, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { cartStore } from "@/lib/cartStore";
import { isEmoji, productFallbackEmoji } from "@/lib/pos-display";
import type { Product } from "@/types/models";
import { ListPagination } from "@/components/pagination/list-pagination";

type Props = {
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  categories: string[];
  activeCategory: string;
  onCategoryChange: (c: string) => void;
  products: Product[];
  loading: boolean;
  page: number;
  totalPages?: number;
  onPageChange: (p: number) => void;
};

export function PosCatalogSection({
  searchQuery,
  onSearchQueryChange,
  categories,
  activeCategory,
  onCategoryChange,
  products,
  loading,
  page,
  totalPages,
  onPageChange,
}: Props) {
  const filtered = products.filter((p) => activeCategory === "All" || p.category === activeCategory);

  return (
    <div className="space-y-4 max-h-[calc(100vh-3rem)] overflow-y-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search products..."
            className="pl-9"
            style={{ width: "510px", height: "50px", borderRadius: "16px", backgroundColor: "#F5F5F5", border: "1px solid #F5F5F5", boxShadow: "none" }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((c) => (
          <button
            type="button"
            onClick={() => onCategoryChange(c)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium border transition-all",
              activeCategory === c ? "bg-[#1a1a1a] text-primary-foreground border-primary shadow-sm" : "bg-card border-border hover:border-primary/40",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={`sk-${i}`} className="card-soft p-4 text-left relative">
                <Skeleton className="aspect-square rounded-xl mb-3" />
                <Skeleton className="h-4 w-28 mb-2" />
                <div className="flex items-center justify-between mt-1">
                  <Skeleton className="h-4 w-14" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <div className="absolute top-2 right-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                </div>
              </div>
            ))
          : filtered.map((p, i) => (
              <button
                key={p.id}
                type="button"
                disabled={p.quantity === 0}
                onClick={() => {
                  cartStore.add(String(p.id));
                  toast.success(`${p.name} added`);
                }}
                className="card-soft p-4 text-left hover-lift disabled:opacity-50 disabled:cursor-not-allowed animate-scale-in relative"
                style={{ animationDelay: `${i * 25}ms` }}
              >
                <div className="aspect-square rounded-xl bg-gradient-to-br from-accent to-muted overflow-hidden grid place-items-center mb-3">
                  {p.image_url ? (
                    isEmoji(p.image_url) ? (
                      <div className="text-5xl">{p.image_url}</div>
                    ) : (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    )
                  ) : (
                    <div className="text-5xl">{productFallbackEmoji(p)}</div>
                  )}
                </div>
                <div className="font-semibold text-sm truncate">{p.name}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-primary font-display font-bold">৳{p.price}</span>
                  <span className={`text-xs ${p.quantity <= 10 ? "text-destructive" : "text-muted-foreground"}`}>{p.quantity}</span>
                </div>
                <div className="absolute top-2 right-2">
                  <div className="w-8 h-8 bg-[#1a1a1a] text-primary-foreground rounded-full grid place-items-center shadow-lg">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                </div>
              </button>
            ))}
      </div>

      {totalPages != null && totalPages > 0 && (
        <ListPagination page={page} totalPages={totalPages} onPageChange={onPageChange} className="pt-2" />
      )}
    </div>
  );
}
