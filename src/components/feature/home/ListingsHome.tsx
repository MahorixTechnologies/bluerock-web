"use client";

import { useMemo, useState } from "react";

import { useListings } from "@/hooks/useListings";
import { AppShell } from "@/components/layout/AppShell";
import { ListingCard } from "@/components/common/ListingCard";
import { useWebAuth } from "@/providers/WebAuthProvider";
import type { Listing } from "@/types/models";

type Category = "ALL" | "FEATURED" | "NEW";

const CATEGORIES: Array<{ key: Category; label: string }> = [
  { key: "ALL", label: "All listings" },
  { key: "FEATURED", label: "Featured" },
  { key: "NEW", label: "New this week" },
];

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const ALL_LOCATIONS = "All locations";

function isNew(listing: Listing): boolean {
  if (!listing.createdAt) return false;
  const created = new Date(listing.createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created <= ONE_WEEK_MS;
}

function cityOf(location: string): string {
  const segments = location.split(",");
  return segments[segments.length - 1]?.trim() || location.trim();
}

export function ListingsHome() {
  const { accessToken } = useWebAuth();
  const { data: listings = [], loading } = useListings({ token: accessToken, scope: "public" });
  const [category, setCategory] = useState<Category>("ALL");
  const [location, setLocation] = useState<string>(ALL_LOCATIONS);

  const locations = useMemo(() => {
    const cities = new Set(listings.map((l) => cityOf(l.location)).filter(Boolean));
    return [ALL_LOCATIONS, ...Array.from(cities).sort()];
  }, [listings]);

  const filtered = useMemo(() => {
    let result = listings;
    if (category === "FEATURED") result = result.filter((l) => l.featured);
    if (category === "NEW") result = result.filter(isNew);
    if (location !== ALL_LOCATIONS) result = result.filter((l) => cityOf(l.location) === location);
    return result;
  }, [listings, category, location]);

  return (
    <AppShell heading="Find your next stay" subheading="Browse listings across BlueRock">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = category === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                  active
                    ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-[0_6px_16px_rgba(30,91,255,0.3)]"
                    : "border-[var(--border)] bg-white text-[var(--text)] hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {locations.map((city) => {
            const active = location === city;
            return (
              <button
                key={city}
                type="button"
                onClick={() => setLocation(city)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--border)] bg-[var(--panel-soft)] text-[var(--muted)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
                }`}
              >
                {city === ALL_LOCATIONS ? city : `📍 ${city}`}
              </button>
            );
          })}
        </div>

        {loading && filtered.length === 0 ? (
          <div className="flex items-center justify-center rounded-2xl border border-[var(--border)] bg-white p-16 shadow-[var(--shadow-card)]">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-white p-16 text-center shadow-[var(--shadow-card)]">
            <p className="text-sm font-semibold text-[var(--muted)]">
              No listings match these filters yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
