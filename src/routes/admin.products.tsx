import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { Product } from "@/types/models";
import { useCreateProductMutation, useDeleteProductMutation, useUpdateProductMutation } from "@/hooks/useProducts";
import { useProductsPagedQuery } from "@/hooks/useProductsPaged";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const Route = createFileRoute("/admin/products")({
  validateSearch: (s: Record<string, unknown>) => ({
    page: typeof s.page === "string" ? Number(s.page) : typeof s.page === "number" ? s.page : 1,
    per_page: typeof s.per_page === "string" ? Number(s.per_page) : typeof s.per_page === "number" ? s.per_page : 10,
    q: typeof s.q === "string" ? s.q : "",
  }),
  component: ProductsPage,
});

function getPageItems(page: number, totalPages: number): Array<number | "…"> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const set = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const pages = Array.from(set)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
  const out: Array<number | "…"> = [];
  for (let i = 0; i < pages.length; i++) {
    const cur = pages[i];
    const prev = pages[i - 1];
    if (i > 0 && cur - prev! > 1) out.push("…");
    out.push(cur);
  }
  return out;
}



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
  const del = useDeleteProductMutation();

  const categories = Array.from(new Set(products.map((p: any) => p.category)));
  const filtered = products.filter((p: any) => cat === "all" || p.category === cat);

  const onDelete = async (id: string | number) => {
    try {
      await del.mutateAsync(id);
      toast.success("Product deleted");
    } catch (e: any) {
      toast.error(e?.message ?? "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your menu items.</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-black text-white hover:bg-black/90 shadow-none">
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
            style={{ width: "510px", height: "50px", borderRadius: "16px", backgroundColor: "#F5F5F5", border: "1px solid #F5F5F5", boxShadow: "none", color: '#797979' }}
          />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="sm:w-56 h-[50px] rounded-lg" style={{ backgroundColor: '#F5F5F5', border: '1px solid #F5F5F5', boxShadow: 'none' }}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c: any) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

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
            {productsQ.isLoading
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
              : filtered.map((p: any, i: any) => (
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
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(p); setOpen(true); }}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(p.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!productsQ.isLoading && filtered.length === 0 && <div className="text-center text-muted-foreground py-12">No products found.</div>}
      </div>

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
                    navigate({ search: (prev) => ({ ...prev, page: page - 1 }) });
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
                        navigate({ search: (prev) => ({ ...prev, page: it }) });
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
                    if (!pagination?.total_pages || page >= pagination.total_pages) return;
                    navigate({ search: (prev) => ({ ...prev, page: page + 1 }) });
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <ProductDialog open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}

const productSchema = yup.object({
  name: yup.string().required("Name is required"),
  price: yup.number().typeError("Price must be a number").min(0, "Price must be >= 0").required("Price is required"),
  quantity: yup.number().typeError("Quantity must be a number").min(0, "Quantity must be >= 0").default(0),
  category: yup.string().required("Category is required"),
  image_url: yup.string().nullable().default(null),
  image: yup.mixed().nullable().default(null),
  barcode: yup.string().nullable().default(null),
});

type ProductForm = yup.InferType<typeof productSchema>;

function ProductDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (v: boolean) => void; editing: Product | null }) {
  const create = useCreateProductMutation();
  const update = useUpdateProductMutation();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: yupResolver(productSchema),
    defaultValues: { name: "", price: 0, quantity: 0, category: "Fast Food", image_url: null, image: null, barcode: null },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: editing?.name ?? "",
        price: editing?.price ?? 0,
        quantity: editing?.quantity ?? 0,
        category: editing?.category ?? "Fast Food",
        image_url: editing?.image_url ?? null,
        image: null,
        barcode: (editing as any)?.barcode ?? null,
      });
    }
  }, [open, editing]);

  const image_url = watch("image_url");
  const image = watch("image");
  const imagePreview = useMemo(() => (image && image instanceof File ? URL.createObjectURL(image) : null), [image]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);
  const category = watch("category");

  const onSubmit = async (values: ProductForm) => {
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, body: values });
        toast.success("Product updated");
      } else {
        await create.mutateAsync(values);
        toast.success("Product added");
      }
      onOpenChange(false);
      reset({ name: "", price: 0, quantity: 0, category: "Fast Food", image_url: null, image: null, barcode: null });
    } catch (e: any) {
      toast.error(e?.message ?? "Save failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Product" : "New Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
         

          <div>
            <Label className="mb-2 block">Image</Label>

            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden grid place-items-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : image_url ? (
                  <img src={image_url} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-400 text-center">
                    <div className="text-3xl mb-1">📷</div>
                    <div className="text-xs">No image</div>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  className="h-12 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setValue("image", f as any, { shouldDirty: true });
                  }}
                />
                <div className="text-xs text-gray-500 mt-2">Upload product image (JPG, PNG only). Max size: 5MB.</div>
              </div>
            </div>

          </div>
 <div>
            <Label className="mb-2 block">Name</Label>
            <Input {...register("name")} className="w-full h-[58px] px-4 rounded-[12px] border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#E5E7EB] shadow-none" style={{ backgroundColor: '#F5F5F5', border: '1px solid #F5F5F5', boxShadow: 'none', color: '#797979' }} />
            {errors.name?.message && <div className="text-xs text-destructive mt-1">{errors.name.message}</div>}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="mb-2 block">Price</Label>
              <Input type="number" {...register("price", { valueAsNumber: true })} className="w-full h-[58px] px-4 rounded-[12px] border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#E5E7EB] shadow-none" style={{ color: '#797979' }} />
              {errors.price?.message && <div className="text-xs text-destructive mt-1">{errors.price.message}</div>}
            </div>
            <div>
              <Label className="mb-2 block">Quantity</Label>
              <Input type="number" {...register("quantity")} className="w-full h-[58px] px-4 rounded-[12px] border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#E5E7EB] shadow-none" style={{ color: '#797979' }} />
              {errors.quantity?.message && <div className="text-xs text-destructive mt-1">{errors.quantity.message}</div>}
            </div>
            <div>
              <Label className="mb-2 block">Category</Label>
              <Select value={category} onValueChange={(v) => setValue("category", v)}>
                <SelectTrigger className="w-full h-[58px] px-4 rounded-[12px] border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#E5E7EB] shadow-none" style={{ backgroundColor: '#F5F5F5', border: '1px solid #F5F5F5', boxShadow: 'none', color: '#797979' }}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {["Fast Food", "Beverages", "Desserts"].map((c: any) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.category?.message && <div className="text-xs text-destructive mt-1">{errors.category.message}</div>}
            </div>
          </div>

          <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="shadow-none" style={{ width: '150px' }}>Cancel</Button>
          <Button type="submit" className="bg-black text-white hover:bg-black/90 shadow-none" style={{ width: '150px' }}>
            {editing ? "Save changes" : "Create"}
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
