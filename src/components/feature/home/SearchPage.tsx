"use client";

import { useMemo, useState } from "react";

import { useListings } from "@/hooks/useListings";
import { mockListings } from "@/constants/mock-data";
import { ALL_PROPERTY_TYPES, type PropertyType } from "@/types/models";

import { AppShell } from "@/components/layout/AppShell";
import { ListingCard } from "@/components/common/ListingCard";
import { useWebAuth } from "@/providers/WebAuthProvider";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rooms, setRooms] = useState("");
  const [type, setType] = useState<PropertyType | "">("");

  const { accessToken } = useWebAuth();

  const parsed = useMemo(() => {
    const min = minPrice.trim().length ? Number(minPrice) : undefined;
    const max = maxPrice.trim().length ? Number(maxPrice) : undefined;
    const roomCount = rooms.trim().length ? Number(rooms) : undefined;
    return {
      minPrice: Number.isFinite(min) ? min : undefined,
      maxPrice: Number.isFinite(max) ? max : undefined,
      rooms: Number.isFinite(roomCount) ? roomCount : undefined,
    };
  }, [maxPrice, minPrice, rooms]);

  const { data: listings = mockListings } = useListings({
    q: query,
    location,
    minPrice: parsed.minPrice,
    maxPrice: parsed.maxPrice,
    type: type || undefined,
    rooms: parsed.rooms,
    token: accessToken,
    scope: "public",
  });

  const activeFilters =
    (location.trim() ? 1 : 0) +
    (parsed.minPrice != null ? 1 : 0) +
    (parsed.maxPrice != null ? 1 : 0) +
    (parsed.rooms != null ? 1 : 0) +
    (type ? 1 : 0);

  const clearFilters = () => {
    setQuery("");
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setRooms("");
    setType("");
  };

  return (
    <AppShell
      heading="Search and filter"
      subheading="Find listings by title, location, budget, room count, and property type"
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {[
              {
                value: query,
                setValue: setQuery,
                placeholder: "Search by title or location",
                prefix: "⌕",
              },
              {
                value: location,
                setValue: setLocation,
                placeholder: "Location",
                prefix: "📍",
              },
              {
                value: minPrice,
                setValue: setMinPrice,
                placeholder: "Min price",
                prefix: "💰",
                inputMode: "numeric" as const,
              },
              {
                value: maxPrice,
                setValue: setMaxPrice,
                placeholder: "Max price",
                prefix: "💵",
                inputMode: "numeric" as const,
              },
              {
                value: rooms,
                setValue: setRooms,
                placeholder: "Min rooms",
                prefix: "🛏",
                inputMode: "numeric" as const,
              },
            ].map((field, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-3.5 transition-all duration-200 focus-within:border-[var(--primary)] focus-within:bg-white focus-within:ring-4 focus-within:ring-[var(--primary)]/10"
              >
                <span className="text-base text-[var(--muted)]">{field.prefix}</span>
                <input
                  value={field.value}
                  onChange={(event) => field.setValue(event.target.value)}
                  placeholder={field.placeholder}
                  inputMode={field.inputMode}
                  className="h-12 w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted-2)]"
                />
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            {ALL_PROPERTY_TYPES.map((option) => {
              const active = type === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setType(active ? "" : option)}
                  className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all duration-200 ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)] shadow-sm"
                      : "border-[var(--border)] bg-[var(--panel-soft)] text-[#4b5563] hover:border-[var(--border-strong)] hover:bg-white"
                  }`}
                >
                  {option}
                </button>
              );
            })}

            {activeFilters > 0 ? (
              <button
                type="button"
                onClick={clearFilters}
                className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-[var(--danger)]/20 bg-[var(--danger)]/5 px-4 py-2 text-xs font-bold text-[var(--danger)] transition hover:bg-[var(--danger)]/10"
              >
                ✕ Clear ({activeFilters})
              </button>
            ) : null}
          </div>
        </section>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]/12 text-sm text-[var(--primary)]">
              📋
            </span>
            <p className="text-sm font-bold text-[#374151]">
              <span className="text-base font-black text-[var(--text)] tabular-nums">
                {listings.length}
              </span>{" "}
              {listings.length === 1 ? "result" : "results"} found
            </p>
          </div>
        </div>

        {listings.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} variant="list" />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--border)] bg-white p-12 text-center shadow-[var(--shadow-card)]">
            <span className="flex mx-auto h-16 w-16 items-center justify-center rounded-2xl bg-[var(--panel-soft)] text-3xl">
              🔍
            </span>
            <p className="mt-5 text-lg font-black text-[var(--text)]">No results</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Try adjusting your search filters or clearing them to see all listings.
            </p>
            {activeFilters > 0 ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-xs font-bold text-white shadow-[0_6px_16px_rgba(30,91,255,0.25)] transition hover:bg-[var(--primary-600)]"
              >
                Clear all filters
              </button>
            ) : null}
          </div>
        )}
      </div>
    </AppShell>
  );
}
