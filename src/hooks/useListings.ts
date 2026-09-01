"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { PropertyType } from "@/types/models";
import { apiFetch } from "@/api/client";
import { mapApiListing } from "@/api/listings";

type UseListingsParams = {
  q?: string | null;
  location?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  type?: PropertyType | null;
  rooms?: number | null;
  token?: string | null;
  scope?: "public" | "mine";
};

export function useListings(params: UseListingsParams) {
  const { q, location, minPrice, maxPrice, type, rooms, token, scope = "public" } = params;
  const [data, setData] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const url = useMemo(() => {
    if (scope === "mine") return "/listings/mine";
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (location) search.set("location", location);
    if (minPrice != null) search.set("minPrice", String(minPrice));
    if (maxPrice != null) search.set("maxPrice", String(maxPrice));
    if (type) search.set("type", type);
    if (rooms != null) search.set("rooms", String(rooms));
    const qs = search.toString();
    return qs ? `/listings?${qs}` : "/listings";
  }, [q, location, minPrice, maxPrice, type, rooms, scope]);

  const load = useCallback(async () => {
    if (scope === "mine" && !token) {
      setData([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const raw = (await apiFetch(url, { accessToken: token })) as unknown[];
      const mapped = Array.isArray(raw) ? raw.map(mapApiListing) : [];
      setData(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load listings");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [url, token, scope]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (cancelled) return;
      await load();
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  return { data, loading, error, refetch: load } as const;
}

export function useListing(id: string | null, token?: string | null) {
  const [data, setData] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (cancelled) return;
      if (!id) {
        setData(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const raw = (await apiFetch(`/listings/${id}`, { accessToken: token })) as unknown;
        if (!cancelled) setData(raw ? mapApiListing(raw) : null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load listing");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, token]);

  return { data, loading, error } as const;
}

import type { Listing } from "@/types/models";
export type { ListingDraft } from "@/api/listings";
export {
  EMPTY_DRAFT,
  listingToDraft,
  createListing,
  updateListing,
  deleteListing,
} from "@/api/listings";
