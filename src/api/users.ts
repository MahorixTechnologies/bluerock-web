import { apiFetch } from "@/api/client";
import type { WebUserProfile } from "@/types/models";

export async function fetchMe(accessToken: string | null): Promise<WebUserProfile | null> {
  try {
    if (!accessToken) return null;
    const raw = await apiFetch("/users/me", { accessToken });
    if (!raw || typeof raw !== "object") return null;
    const data = raw as Record<string, unknown>;
    return {
      email: String(data.email ?? ""),
      name: typeof data.name === "string" ? data.name : "",
      phone: typeof data.phone === "string" ? data.phone : "",
      emailVerified: Boolean(data.emailVerified),
      role:
        data.role === "ADMIN" || data.role === "LANDLORD" || data.role === "RENTER"
          ? data.role
          : "RENTER",
    };
  } catch {
    return null;
  }
}

export async function updateMe(
  accessToken: string | null,
  params: { name?: string; phone?: string },
): Promise<WebUserProfile | null> {
  try {
    if (!accessToken) return null;
    const raw = await apiFetch("/users/me", {
      accessToken,
      method: "PATCH",
      body: JSON.stringify(params),
    });
    if (!raw || typeof raw !== "object") return null;
    const data = raw as Record<string, unknown>;
    return {
      email: String(data.email ?? ""),
      name: typeof data.name === "string" ? data.name : "",
      phone: typeof data.phone === "string" ? data.phone : "",
      emailVerified: Boolean(data.emailVerified),
      role:
        data.role === "ADMIN" || data.role === "LANDLORD" || data.role === "RENTER"
          ? data.role
          : "RENTER",
    };
  } catch {
    return null;
  }
}
