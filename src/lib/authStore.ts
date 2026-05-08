import { useSyncExternalStore } from "react";
import type { Role } from "@/types/enums";
import type { AuthUser } from "@/types/models";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
};

const KEY = "hcpos_auth_v1";

function readStorage(): AuthState {
  if (typeof window === "undefined") return { token: null, user: null };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { token: null, user: null };
    const parsed = JSON.parse(raw) as Partial<AuthState>;
    return {
      token: typeof parsed.token === "string" && parsed.token.length ? parsed.token : null,
      user: parsed.user ?? null,
    };
  } catch {
    return { token: null, user: null };
  }
}

let state: AuthState = readStorage();
const listeners = new Set<() => void>();

function writeStorage(next: AuthState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(next));
}

function setState(updater: (s: AuthState) => AuthState) {
  state = updater(state);
  writeStorage(state);
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAuthStore<T>(selector: (s: AuthState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}

export const authStore = {
  get: () => state,
  setSession(input: { token: string; user: AuthUser }) {
    setState(() => ({ token: input.token, user: input.user }));
  },
  setUser(user: AuthUser | null) {
    setState((s) => ({ ...s, user }));
  },
  setToken(token: string | null) {
    setState((s) => ({ ...s, token }));
  },
  logout() {
    setState(() => ({ token: null, user: null }));
  },
  hasRole(role: Role) {
    return state.user?.role === role;
  },
};

