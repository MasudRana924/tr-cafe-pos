import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { cartStore, useCartStore } from "@/lib/cartStore";
import type { PaymentMethodUi } from "@/types/enums";
import { PaymentMethod } from "@/types/enums";
import { useProductsPagedQuery } from "@/hooks/useProductsPaged";
import { useCreateOrderMutation } from "@/hooks/useOrders";
import { PosCatalogSection } from "@/components/pos/pos-catalog-section";
import { PosCartSection } from "@/components/pos/pos-cart-section";

export const Route = createFileRoute("/pos/")({
  validateSearch: (s: Record<string, unknown>) => ({
    page: typeof s.page === "string" ? Number(s.page) : typeof s.page === "number" ? s.page : 1,
    per_page: typeof s.per_page === "string" ? Number(s.per_page) : typeof s.per_page === "number" ? s.per_page : 12,
    q: typeof s.q === "string" ? s.q : "",
  }),
  component: POSPage,
});

function POSPage() {
  const search = Route.useSearch();
  const nav = Route.useNavigate();
  const page = Number.isFinite(search.page) && search.page > 0 ? search.page : 1;
  const perPage = Number.isFinite(search.per_page) && search.per_page > 0 ? search.per_page : 12;
  const q = search.q ?? "";

  const productsQ = useProductsPagedQuery({ page, per_page: perPage, q });
  const products = productsQ.data?.items ?? [];
  const pagination = productsQ.data?.pagination;
  const cart = useCartStore((s) => s.cart);
  const navigate = useNavigate();
  const createOrder = useCreateOrderMutation();
  const [cat, setCat] = useState("All");
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState<PaymentMethodUi>("Cash");

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const cartLines = cart
    .map((c) => {
      const p = products.find((x) => String(x.id) === String(c.productId));
      if (!p) return null;
      return { ...p, qty: c.qty };
    })
    .filter(Boolean) as Array<import("@/types/models").Product & { qty: number }>;

  const subtotal = cartLines.reduce((a, b) => a + b.price * b.qty, 0);
  const total = Math.max(0, subtotal - discount);

  const checkout = async () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    try {
      const res = await createOrder.mutateAsync({
        payment_method: PaymentMethod.toApi(payment),
        discount,
        items: cart.map((c) => ({ product_id: c.productId, quantity: c.qty })),
      });

      const invoiceOrderId =
        (res as any)?.data?.invoice?.order_id ??
        (res as any)?.invoice?.order_id ??
        (res as any)?.data?.order_id ??
        (res as any)?.order_id ??
        (res as any)?.data?.id ??
        (res as any)?.id;
      if (!invoiceOrderId) throw new Error("Order created but missing order id");

      cartStore.clear();
      setDiscount(0);
      navigate({ to: "/pos/order/$id", params: { id: String(invoiceOrderId) } });
    } catch (e: any) {
      toast.error(e?.message ?? "Checkout failed");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
      <PosCatalogSection
        searchQuery={q}
        onSearchQueryChange={(v) => nav({ search: (prev) => ({ ...prev, q: v, page: 1 }), replace: true })}
        categories={categories}
        activeCategory={cat}
        onCategoryChange={setCat}
        products={products}
        loading={productsQ.isLoading}
        page={page}
        totalPages={pagination?.total_pages}
        onPageChange={(p) => nav({ search: (prev) => ({ ...prev, page: p }), replace: true })}
      />
      <PosCartSection
        cartLines={cartLines}
        discount={discount}
        onDiscountChange={setDiscount}
        payment={payment}
        onPaymentChange={setPayment}
        subtotal={subtotal}
        total={total}
        itemCount={cart.length}
        onCheckout={checkout}
        checkoutPending={createOrder.isPending}
      />
    </div>
  );
}
