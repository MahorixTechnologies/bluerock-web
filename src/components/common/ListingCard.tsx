"use client";

import Link from "next/link";
import { useState } from "react";

import type { Listing } from "@/types/models";
import { formatMoney } from "@/utils";

export function ListingCard({
  listing,
  variant = "featured",
}: {
  listing: Listing;
  variant?: "featured" | "list";
}) {
  const [saved, setSaved] = useState(false);
  const image = listing.images[0] ?? "";

  if (variant === "featured") {
    return (
      <Link
        href={`/listing/${listing.id}`}
        className="group relative block min-w-[300px] overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
      >
        <div className="relative h-[260px] overflow-hidden">
          <img
            src={image}
            alt={listing.title}
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#061525]/80 via-[#061525]/30 to-transparent" />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/18 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-md">
                {listing.type}
              </span>
              {listing.featured ? (
                <span className="rounded-full bg-[#7CA8FF] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#081866] shadow-[0_4px_12px_rgba(124,168,255,0.4)]">
                  Featured
                </span>
              ) : null}
            </div>

            <button
              type="button"
              aria-label="Save listing"
              onClick={(event) => {
                event.preventDefault();
                setSaved((current) => !current);
              }}
              className={`flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 ${
                saved
                  ? "bg-[#ef4444] text-white shadow-[0_4px_12px_rgba(239,68,68,0.4)]"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {saved ? "♥" : "♡"}
            </button>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <h3 className="text-[22px] font-black tracking-tight leading-tight">
              {listing.title}
            </h3>
            <p className="mt-1 text-sm font-medium text-white/80">{listing.location}</p>

            <div className="mt-4 flex items-end justify-between gap-4">
              <div className="flex gap-3 text-xs font-bold text-white/85">
                <span className="inline-flex items-center gap-1 rounded-md bg-white/12 px-2 py-1 backdrop-blur">
                  🛏 {listing.rooms} rooms
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-white/12 px-2 py-1 backdrop-blur">
                  🚿 {listing.bathrooms} baths
                </span>
              </div>
              <div className="rounded-xl bg-white px-4 py-2 text-sm font-black text-[#111827] shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
                {formatMoney(listing.pricePerNight, listing.currency)}
                <span className="ml-1 text-[11px] font-semibold text-[#6b7280]">
                  /night
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="grid gap-0 sm:grid-cols-[200px_1fr]">
        <div className="relative h-[200px] overflow-hidden sm:h-full">
          <img
            src={image}
            alt={listing.title}
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
          />
          <button
            type="button"
            aria-label="Save listing"
            onClick={(event) => {
              event.preventDefault();
              setSaved((current) => !current);
            }}
            className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-sm shadow transition-all duration-200 ${
              saved
                ? "bg-[#ef4444] text-white"
                : "bg-white/92 text-[#6b7280] hover:bg-white"
            }`}
          >
            {saved ? "♥" : "♡"}
          </button>
          <div className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-black text-[#111827] shadow backdrop-blur">
            {formatMoney(listing.pricePerNight, listing.currency)}
            <span className="ml-0.5 text-[10px] font-semibold text-[#6b7280]">
              /n
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-black tracking-tight text-[#111827]">
                {listing.title}
              </h3>
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-[#6b7280]">
                <span>📍</span> {listing.location}
              </p>
            </div>
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
            <div className="flex flex-wrap gap-1.5">
              {[
                `${listing.rooms} rooms`,
                `${listing.bathrooms} baths`,
                listing.type,
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-[var(--panel-soft)] px-2.5 py-1 text-[11px] font-bold text-[#4b5563]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1E5BFF] transition-transform duration-200 group-hover:translate-x-0.5">
              View <span>→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
