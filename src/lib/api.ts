import type { ApiFieldError, Meta } from "@/types/api";

// Error thrown by api() when the server answers with success: false
export class ApiError extends Error {
  status: number;
  errors: ApiFieldError[];

  constructor(message: string, status: number, errors: ApiFieldError[] = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
};

// Builds "?page=1&status=ONGOING" and skips empty values
export function toQueryString(query: ApiOptions["query"] = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}

// Calls the backend through our Next.js route handler (/api/backend/...).
// Returns { data, meta }. Throws ApiError on failure.
export async function api<T>(path: string, options: ApiOptions = {}): Promise<{ data: T; meta?: Meta; message: string }> {
  const res = await fetch(`/api/backend${path}${toQueryString(options.query)}`, {
    method: options.method ?? "GET",
    headers: options.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success) {
    // Session ended (e.g. refresh token expired): go to the login page
    if (res.status === 401 && typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      // A full page load is wanted here (it clears all cached data). useRouter can't be used outside components.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
    throw new ApiError(json?.message ?? "Something went wrong. Please try again.", res.status, json?.errors ?? []);
  }

  return { data: json.data as T, meta: json.meta as Meta | undefined, message: json.message as string };
}

// Shows the first field error if there is one, otherwise the message
export function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.errors.length ? `${error.message}: ${error.errors[0].message}` : error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong.";
}
