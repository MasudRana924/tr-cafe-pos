import { useQuery } from "@tanstack/react-query";
import * as productsApi from "@/api/products";
import type { Product } from "@/types/models";
import type { Pagination } from "@/api/products";

export type PagedResult<T> = { items: T[]; pagination: Pagination | null };

function unwrap(res: any): PagedResult<Product> {
  const items = (res?.data?.products ?? res?.products ?? []) as Product[];
  const pagination = (res?.data?.pagination ?? res?.pagination ?? null) as Pagination | null;
  return { items: Array.isArray(items) ? items : [], pagination };
}

export function useProductsPagedQuery(input: { page: number; per_page: number; q?: string }) {
  const q = input.q?.trim() ?? "";
  return useQuery({
    queryKey: ["products", "paged", { page: input.page, per_page: input.per_page, q }],
    queryFn: async () => {
      const res = q
        ? await productsApi.searchProductsPaged({ q, page: input.page, per_page: input.per_page })
        : await productsApi.listProductsPaged({ page: input.page, per_page: input.per_page });
      return unwrap(res);
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
}

