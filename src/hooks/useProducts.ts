import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as productsApi from "@/api/products";

function unwrapProducts(res: any) {
  // Backend responses may wrap as { data: { products: [...] } }
  return res?.data?.products ?? res?.products ?? res ?? [];
}

function unwrapProduct(res: any) {
  return res?.data?.product ?? res?.product ?? res;
}

export function useProductsQuery(params?: { q?: string; refetchOnMount?: "always" | boolean }) {
  const q = params?.q?.trim();
  return useQuery({
    queryKey: ["products", { q: q ?? "" }],
    queryFn: async () => {
      const res = q ? await productsApi.searchProducts(q) : await productsApi.listProducts();
      return unwrapProducts(res);
    },
    staleTime: 0,
    refetchOnMount: params?.refetchOnMount ?? true,
  });
}

export function useCreateProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.createProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string | number; body: any }) => productsApi.updateProduct(input.id, input.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.deleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useProductQuery(id: string | number, enabled = true) {
  return useQuery({
    queryKey: ["products", "detail", id],
    enabled,
    queryFn: async () => unwrapProduct(await productsApi.getProduct(id)),
    staleTime: 0,
  });
}

