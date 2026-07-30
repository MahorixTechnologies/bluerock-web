"use client";

import Link from "next/link";
import { useState } from "react";

import type { Listing } from "@/lib/models";
import { formatMoney } from "@/lib/utils";

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
        className="group relative block min-w-[300px] overflow-hidden rounded-[28px] bg-[#c8cfdd] shadow-[0_18px_40px_rgba(31,41,55,0.12)]"
      >
        <img
          src={image}
          alt={listing.title}
          className="h-[260px] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#081224]/70 via-[#081224]/20 to-transparent" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white/18 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
              {listing.type}
            </span>
            {listing.featured ? (
              <span className="rounded-full bg-[#fff2c8] px-3 py-1.5 text-xs font-bold text-[#0f172a]">
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
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/18 text-lg text-white backdrop-blur"
          >
            {saved ? "♥" : "♡"}
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <h3 className="text-2xl font-extrabold">{listing.title}</h3>
          <p className="mt-1 text-sm text-white/85">{listing.location}</p>

          <div className="mt-4 flex items-end justify-between gap-4">
            <div className="flex gap-3 text-sm font-bold text-white/90">
              <span>{listing.rooms} rooms</span>
              <span>{listing.bathrooms} baths</span>
            </div>
            <div className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-[#101828]">
              {formatMoney(listing.pricePerNight, listing.currency)} /night
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block overflow-hidden rounded-[24px] border border-[#e2e7f1] bg-white shadow-[0_14px_34px_rgba(31,41,55,0.06)]"
    >
      <div className="relative">
        <img
          src={image}
          alt={listing.title}
          className="h-[220px] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <button
          type="button"
          aria-label="Save listing"
          onClick={(event) => {
            event.preventDefault();
            setSaved((current) => !current);
          }}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/92 text-lg text-[#6b7280] shadow"
        >
          {saved ? "♥" : "♡"}
        </button>
        <div className="absolute bottom-4 left-4 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-[#101828] shadow">
          {formatMoney(listing.pricePerNight, listing.currency)} /night
        </div>
      </div>

      <div className="space-y-3 p-5">
        <div>
          <h3 className="text-lg font-extrabold text-[#111827]">{listing.title}</h3>
          <p className="mt-1 text-sm text-[#74809a]">{listing.location}</p>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-[#e9edf6] pt-3 text-xs font-bold text-[#6a7388]">
          <span className="rounded-full bg-[#f7f8fc] px-3 py-2">{listing.rooms} rooms</span>
          <span className="rounded-full bg-[#f7f8fc] px-3 py-2">{listing.bathrooms}- baths</span>
          <span className="rounded-full bg-[#f7f8fc] px-3 py-2">{listing.type}</span>
        </div>
      </div>
    </Link>
  );
}
