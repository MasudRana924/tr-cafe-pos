import { authStore } from "@/lib/authStore";

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function extractMessage(data: unknown, fallback: string) {
  if (!data) return fallback;
  if (typeof data === "string") return data || fallback;
  if (typeof data !== "object") return fallback;

  const d = data as any;
  return (
    (typeof d.responseMessage === "string" && d.responseMessage) ||
    (typeof d.message === "string" && d.message) ||
    (typeof d.error === "string" && d.error) ||
    fallback
  );
}

function getBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:5000";
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
  signal?: AbortSignal;
};

export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const isFormData = typeof FormData !== "undefined" && opts.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(opts.body !== undefined && !isFormData ? { "Content-Type": "application/json" } : {}),
    ...(opts.headers ?? {}),
  };

  if (opts.auth !== false) {
    const token = authStore.get().token;
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers,
    body:
      opts.body === undefined
        ? undefined
        : isFormData
          ? (opts.body as FormData)
          : JSON.stringify(opts.body),
    signal: opts.signal,
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const msg = extractMessage(data, `Request failed (${res.status})`);
    throw new ApiError(msg, res.status, data);
  }

  return data as T;
}

