import { authStore } from "./authStore";
import * as authApi from "@/api/auth";
import type { Role } from "@/types/enums";

export async function ensureAuthed(role?: Role) {
  const { token, user } = authStore.get();
  if (!token) return { ok: false as const, user: null };

  if (!user) {
    try {
      const res = await authApi.me();
      const u = (res as any)?.user ?? res;
      authStore.setUser(u ?? null);
    } catch {
      authStore.logout();
      return { ok: false as const, user: null };
    }
  }

  const next = authStore.get().user;
  if (!next) return { ok: false as const, user: null };
  if (role && next.role !== role) return { ok: false as const, user: next };
  return { ok: true as const, user: next };
}

