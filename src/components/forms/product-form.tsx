import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/buttons/loading-button";
import type { Product } from "@/types/models";
import { productSchema, type ProductFormValues } from "@/schemas/product.schema";
import { useCreateProductMutation, useUpdateProductMutation } from "@/hooks/useProducts";

const EMPTY_PRODUCT_FORM: ProductFormValues = {
  name: "",
  price: 0,
  quantity: 0,
  category: "Fast Food",
  image_url: null,
  image: null,
  barcode: null,
};

const field =
  "w-full h-[58px] px-4 rounded-[12px] border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#E5E7EB] shadow-none";
const fieldStyle = { backgroundColor: "#F5F5F5", border: "1px solid #F5F5F5", boxShadow: "none", color: "#797979" } as const;

type Props = {
  open: boolean;
  editing: Product | null;
  onClose: () => void;
};

export function ProductForm({ open, editing, onClose }: Props) {
  const create = useCreateProductMutation();
  const update = useUpdateProductMutation();
  const pending = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
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
    } else {
      reset(EMPTY_PRODUCT_FORM);
    }
  }, [open, editing, reset]);

  const image_url = watch("image_url");
  const image = watch("image");
  const imagePreview = useMemo(() => (image && image instanceof File ? URL.createObjectURL(image) : null), [image]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const category = watch("category");

  const onSubmit = async (values: ProductFormValues) => {
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, body: values });
        toast.success("Product updated");
      } else {
        await create.mutateAsync(values);
        toast.success("Product added");
      }
      onClose();
      reset(EMPTY_PRODUCT_FORM);
    } catch (e: any) {
      toast.error(e?.message ?? "Save failed");
    }
  };

  return (
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
        <Input {...register("name")} className={field} style={fieldStyle} />
        {errors.name?.message && <div className="text-xs text-destructive mt-1">{errors.name.message}</div>}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="mb-2 block">Price</Label>
          <Input type="number" {...register("price", { valueAsNumber: true })} className={field} style={{ color: "#797979" }} />
          {errors.price?.message && <div className="text-xs text-destructive mt-1">{errors.price.message}</div>}
        </div>
        <div>
          <Label className="mb-2 block">Quantity</Label>
          <Input type="number" {...register("quantity")} className={field} style={{ color: "#797979" }} />
          {errors.quantity?.message && <div className="text-xs text-destructive mt-1">{errors.quantity.message}</div>}
        </div>
        <div>
          <Label className="mb-2 block">Category</Label>
          <Select value={category} onValueChange={(v) => setValue("category", v)}>
            <SelectTrigger className={field} style={fieldStyle}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {["Fast Food", "Beverages", "Desserts"].map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category?.message && <div className="text-xs text-destructive mt-1">{errors.category.message}</div>}
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} className="shadow-none" style={{ width: "150px" }}>
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          className="bg-black text-white hover:bg-black/90 shadow-none"
          style={{ width: "150px" }}
          loading={pending}
          loadingText={editing ? "Saving..." : "Creating..."}
        >
          {editing ? "Save changes" : "Create"}
        </LoadingButton>
      </DialogFooter>
    </form>
  );
}
