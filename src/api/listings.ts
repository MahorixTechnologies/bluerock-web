import type {
  Currency,
  Listing,
  ListingCreateInput,
  ListingUpdateInput,
  PropertyType,
} from "@/types/models";
import { apiFetch } from "@/api/client";

export function mapApiListing(raw: unknown): Listing {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const owner =
    (typeof obj.owner === "object" && obj.owner !== null
      ? (obj.owner as Record<string, unknown>)
      : typeof obj.host === "object" && obj.host !== null
        ? (obj.host as Record<string, unknown>)
        : {}) as Record<string, unknown>;
  return {
    id: typeof obj.id === "string" ? obj.id : `lid-${Math.random().toString(36).slice(2, 10)}`,
    title: String(obj.title ?? ""),
    description: typeof obj.description === "string" ? obj.description : undefined,
    location: String(obj.location ?? ""),
    pricePerNight: typeof obj.pricePerNight === "number" ? obj.pricePerNight : 0,
    currency: obj.currency === "USD" ? "USD" : "NGN",
    rooms: typeof obj.rooms === "number" ? obj.rooms : 0,
    bathrooms: typeof obj.bathrooms === "number" ? obj.bathrooms : 0,
    type: (obj.type as PropertyType) ?? "Apartment",
    images: Array.isArray(obj.images)
      ? (obj.images as string[]).filter((x) => typeof x === "string")
      : [],
    amenities: Array.isArray(obj.amenities)
      ? (obj.amenities as string[]).filter((x) => typeof x === "string")
      : [],
    rules: Array.isArray(obj.rules)
      ? (obj.rules as string[]).filter((x) => typeof x === "string")
      : undefined,
    status:
      obj.status === "PENDING" ||
      obj.status === "APPROVED" ||
      obj.status === "REJECTED" ||
      obj.status === "ARCHIVED" ||
      obj.status === "Published"
        ? obj.status
        : "APPROVED",
    featured: Boolean(obj.featured),
    featuredUntil: typeof obj.featuredUntil === "string" ? obj.featuredUntil : undefined,
    createdAt: typeof obj.createdAt === "string" ? obj.createdAt : undefined,
    host: {
      name: typeof owner.name === "string" ? owner.name : "Host",
      phone: typeof owner.phone === "string" ? owner.phone : undefined,
      email: typeof owner.email === "string" ? owner.email : undefined,
    },
    availabilityNote: typeof obj.availabilityNote === "string" ? obj.availabilityNote : "",
  };
}

export type ListingDraft = {
  title: string;
  location: string;
  description: string;
  pricePerNight: string;
  currency: Currency;
  rooms: string;
  bathrooms: string;
  type: PropertyType;
  images: string;
  amenities: string;
  rules: string;
};

export const EMPTY_DRAFT: ListingDraft = {
  title: "",
  location: "",
  description: "",
  pricePerNight: "",
  currency: "NGN",
  rooms: "1",
  bathrooms: "1",
  type: "Apartment",
  images: "",
  amenities: "",
  rules: "",
};

export function listingToDraft(listing: Listing | null): ListingDraft {
  if (!listing) return EMPTY_DRAFT;
  return {
    title: listing.title,
    location: listing.location,
    description: listing.description ?? "",
    pricePerNight: listing.pricePerNight ? String(listing.pricePerNight) : "",
    currency: listing.currency,
    rooms: String(listing.rooms || 1),
    bathrooms: String(listing.bathrooms || 1),
    type: listing.type,
    images: listing.images.join(", "),
    amenities: listing.amenities.join(", "),
    rules: listing.rules?.join(", ") ?? "",
  };
}

function parseNumbers(input: string, fallback: number) {
  const n = Number(input);
  return Number.isFinite(n) ? n : fallback;
}

function parseCsvList(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildCreatePayload(draft: ListingDraft): ListingCreateInput {
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    location: draft.location.trim(),
    pricePerNight: parseNumbers(draft.pricePerNight, 0),
    currency: draft.currency,
    rooms: parseNumbers(draft.rooms, 0),
    bathrooms: parseNumbers(draft.bathrooms, 0),
    type: draft.type,
    images: parseCsvList(draft.images),
    amenities: parseCsvList(draft.amenities),
    rules: parseCsvList(draft.rules),
  };
}

export async function createListing(draft: ListingDraft, token: string | null) {
  const payload = buildCreatePayload(draft);
  if (!process.env.NEXT_PUBLIC_API_URL) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return payload as ListingCreateInput & { id: string };
  }
  return (await apiFetch("/listings", {
    method: "POST",
    accessToken: token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })) as ListingCreateInput & { id: string };
}

export async function updateListing(id: string, draft: ListingDraft, token: string | null) {
  const payload: ListingUpdateInput = buildCreatePayload(draft);
  if (!process.env.NEXT_PUBLIC_API_URL) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return { success: true as const, id };
  }
  return (await apiFetch("/listings/" + encodeURIComponent(id), {
    method: "PATCH",
    accessToken: token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })) as unknown as { success: true; id: string };
}

export async function deleteListing(id: string, token: string | null) {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return { success: true as const, id };
  }
  return (await apiFetch(
    "/listings/" + encodeURIComponent(id),
    { method: "DELETE", accessToken: token },
  )) as unknown as { success: true; id: string };
}

