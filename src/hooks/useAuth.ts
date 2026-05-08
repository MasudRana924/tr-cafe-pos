import { useMutation, useQuery } from "@tanstack/react-query";
import * as auth from "@/api/auth";
import { authStore } from "@/lib/authStore";

export function useMeQuery(enabled = true) {
  return useQuery({
    queryKey: ["auth", "me"],
    enabled,
    queryFn: async () => {
      const res = await auth.me();
      const user = (res as any)?.user ?? res;
      authStore.setUser(user ?? null);
      return user;
    },
    staleTime: 0,
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: auth.login,
    onSuccess: async (res) => {
      const token = (res as any)?.data?.token ?? (res as any)?.token;
      if (!token) return;
      authStore.setToken(token);
      const user = (res as any)?.data?.user ?? (res as any)?.user;
      if (user) authStore.setUser(user);
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: auth.register,
  });
}

