import { API_URL } from "@/components/web/WebAuthProvider";

function unwrapEnvelope(payload: unknown) {
  if (payload && typeof payload === "object" && "success" in payload) {
    const envelope = payload as { success?: boolean; data?: unknown };
    if (envelope.success === true && "data" in envelope) {
      return envelope.data;
    }
  }
  return payload;
}

export async function apiFetch(
  path: string,
  options?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    accessToken?: string | null;
  },
) {
  if (!API_URL) {
    throw new Error("API_URL not configured");
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers ?? {}),
  };
  if (options?.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }
  const res = await fetch(`${API_URL}${path}`, {
    method: options?.method ?? "GET",
    headers,
    body: options?.body,
  });
  const contentType = res.headers.get("content-type");
  const isJson = typeof contentType === "string" && contentType.includes("application/json");
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    if (isJson) {
      try {
        const errBody = (await res.json()) as Record<string, unknown>;
        if (typeof errBody.message === "string") message = errBody.message;
      } catch {
        // ignore
      }
    }
    throw new Error(message);
  }
  if (!isJson) return undefined;
  const body = (await res.json()) as unknown;
  return unwrapEnvelope(body);
}
