import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "@/api/users";

function unwrapSalesmen(res: any) {
  return res?.data?.salesmen ?? res?.salesmen ?? res ?? [];
}

export function useSalesmenQuery(opts?: { refetchOnMount?: "always" | boolean }) {
  return useQuery({
    queryKey: ["users", "salesmen"],
    queryFn: async () => unwrapSalesmen(await usersApi.listSalesmen()),
    staleTime: 0,
    refetchOnMount: opts?.refetchOnMount ?? "always",
    refetchOnWindowFocus: true,
  });
}

export function useCreateSalesmanMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.createSalesman,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users", "salesmen"] });
    },
  });
}

