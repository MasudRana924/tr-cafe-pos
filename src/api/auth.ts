import { api } from "./client";
import type { AuthUser } from "@/types/models";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  responseCode?: string;
  responseMessage?: string;
  data?: {
    token: string;
    user: AuthUser;
  } | null;
  // fallback (some envs might return direct token/user)
  token?: string;
  user?: AuthUser;
};

export async function login(body: LoginRequest) {
  return api<LoginResponse>("/api/auth/login", { method: "POST", body, auth: false });
}

export async function me() {
  return api<{ user: AuthUser } | AuthUser>("/api/auth/me", { method: "GET" });
}

export async function register(body: { name: string; email: string; password: string }) {
  return api<{ user: AuthUser } | AuthUser>("/api/auth/register", { method: "POST", body });
}

