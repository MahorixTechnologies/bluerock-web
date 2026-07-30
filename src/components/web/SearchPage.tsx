"use client";

import { useMemo, useState } from "react";

import { filterListings } from "@/lib/utils";

import { AppShell } from "./AppShell";
import { ListingCard } from "./ListingCard";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rooms, setRooms] = useState("");
  const [type, setType] = useState<"" | "House" | "Apartment">("");

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

  const listings = filterListings({
    q: query,
    location,
    minPrice: parsed.minPrice,
    maxPrice: parsed.maxPrice,
    rooms: parsed.rooms,
    type: type || undefined,
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
      subheading="Find listings by title, location, budget, room count, and property type just like the mobile experience."
    >
      <div className="space-y-6">
        <section className="rounded-[28px] border border-[#e3e7f2] bg-white p-6 shadow-[0_14px_34px_rgba(31,41,55,0.05)]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title or location"
              className="rounded-[16px] border border-[#e1e6f1] bg-[#f7f8fc] px-4 py-3 text-sm text-[#1d2433] outline-none focus:border-[#9db3fa]"
            />
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Location"
              className="rounded-[16px] border border-[#e1e6f1] bg-[#f7f8fc] px-4 py-3 text-sm text-[#1d2433] outline-none focus:border-[#9db3fa]"
            />
            <input
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="Min price"
              inputMode="numeric"
              className="rounded-[16px] border border-[#e1e6f1] bg-[#f7f8fc] px-4 py-3 text-sm text-[#1d2433] outline-none focus:border-[#9db3fa]"
            />
            <input
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="Max price"
              inputMode="numeric"
              className="rounded-[16px] border border-[#e1e6f1] bg-[#f7f8fc] px-4 py-3 text-sm text-[#1d2433] outline-none focus:border-[#9db3fa]"
            />
            <input
              value={rooms}
              onChange={(event) => setRooms(event.target.value)}
              placeholder="Min rooms"
              inputMode="numeric"
              className="rounded-[16px] border border-[#e1e6f1] bg-[#f7f8fc] px-4 py-3 text-sm text-[#1d2433] outline-none focus:border-[#9db3fa]"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {(["House", "Apartment"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setType(type === option ? "" : option)}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                  type === option
                    ? "border-[#2b5df3] bg-[#ebf1ff] text-[#2b5df3]"
                    : "border-[#dce3f2] bg-[#f7f8fc] text-[#546076]"
                }`}
              >
                {option}
              </button>
            ))}

            {activeFilters > 0 ? (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-full border border-[#dce3f2] bg-white px-4 py-2 text-sm font-bold text-[#2b5df3]"
              >
                Clear filters ({activeFilters})
              </button>
            ) : null}
          </div>
        </section>

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-bold text-[#7a8398]">
            {listings.length} {listings.length === 1 ? "result" : "results"}
          </p>
        </div>

        {listings.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} variant="list" />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-[#e3e7f2] bg-white p-8 text-center shadow-[0_14px_34px_rgba(31,41,55,0.05)]">
            <p className="text-lg font-extrabold text-[#0f2b71]">No results</p>
            <p className="mt-2 text-sm text-[#7a8398]">Try adjusting your search filters.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
