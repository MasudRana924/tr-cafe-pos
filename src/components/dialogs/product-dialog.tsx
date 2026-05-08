import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "@/types/models";
import { ProductForm } from "@/components/forms/product-form";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Product | null;
};

export function ProductDialog({ open, onOpenChange, editing }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Product" : "New Product"}</DialogTitle>
        </DialogHeader>
        <ProductForm open={open} editing={editing} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
