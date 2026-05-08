import { api } from "./client";
import type { AuthUser } from "@/types/models";

export async function listSalesmen() {
  return api<{ data?: { salesmen?: AuthUser[] } } | { salesmen: AuthUser[] } | AuthUser[]>(
    "/api/auth/salesmen",
    { method: "GET" },
  );
}

export async function createSalesman(body: { name: string; email: string; password: string }) {
  return api<
    | { responseCode?: string; responseMessage?: string; data?: { user?: AuthUser } }
    | { data?: { user?: AuthUser } }
    | AuthUser
  >("/api/auth/salesmen", { method: "POST", body });
}

