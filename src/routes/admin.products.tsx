import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { store, useStore, type Product } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  component: ProductsPage,
});

const EMOJIS = ["🍔","🍕","🍟","🥪","🌯","🍝","🍰","🍦","☕","🥭","💧","🥟","🍩","🌭","🥤"];

function ProductsPage() {
  const products = useStore((s) => s.products);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(q.toLowerCase()) && (cat === "all" || p.category === cat),
  );

  const onDelete = (id: string) => {
    store.deleteProduct(id);
    toast.success("Product deleted");
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
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..." className="pl-9" style={{ width: "510px", height: "50px", borderRadius: "16px", backgroundColor: "#F5F5F5", border: "1px solid #F5F5F5", boxShadow: "none" }} />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="sm:w-56" style={{ height: "50px" }}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
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
            {filtered.map((p, i) => (
              <tr key={p.id} className="border-b hover:bg-muted/50" style={{ animationDelay: `${i * 30}ms` }}>
                <td className="p-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-muted grid place-items-center text-2xl">
                    {p.image}
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
        {filtered.length === 0 && <div className="text-center text-muted-foreground py-12">No products found.</div>}
      </div>
      <ProductDialog open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}

function ProductDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (v: boolean) => void; editing: Product | null }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("Fast Food");
  const [image, setImage] = useState("🍔");

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? "");
      setPrice(editing ? String(editing.price) : "");
      setQuantity(editing ? String(editing.quantity) : "");
      setCategory(editing?.category ?? "Fast Food");
      setImage(editing?.image ?? "🍔");
    }
  }, [open, editing]);

  const submit = () => {
    if (!name || !price) return toast.error("Name and price required");
    const data = { name, price: Number(price), quantity: Number(quantity) || 0, category, image };
    if (editing) {
      store.updateProduct(editing.id, data);
      toast.success("Product updated");
    } else {
      store.addProduct(data);
      toast.success("Product added");
    }
    setName(""); setPrice(""); setQuantity(""); setCategory("Fast Food"); setImage("🍔");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setName(""); setPrice(""); setQuantity(""); } onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Product" : "New Product"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Icon</Label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button key={e} type="button" onClick={() => setImage(e)} className={`w-10 h-10 rounded-lg text-xl grid place-items-center border ${image === e ? "border-primary bg-accent" : "border-border"}`}>{e}</button>
              ))}
            </div>
          </div>
          <div><Label className="mb-2 block">Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-[58px] px-4 rounded-[12px] border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#E5E7EB] shadow-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="mb-2 block">Price (৳)</Label><Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full h-[58px] px-4 rounded-[12px] border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#E5E7EB] shadow-none" /></div>
            <div><Label className="mb-2 block">Quantity</Label><Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full h-[58px] px-4 rounded-[12px] border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#E5E7EB] shadow-none" /></div>
          </div>
          <div>
            <Label className="mb-2 block">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full h-[58px] px-4 rounded-[12px] border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#E5E7EB] shadow-none"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Fast Food","Snacks","Beverages","Desserts"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="shadow-none">Cancel</Button>
          <Button onClick={submit} className="bg-black text-white hover:bg-black/90 shadow-none">{editing ? "Save changes" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
