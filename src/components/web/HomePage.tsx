import Link from "next/link";

import { getCategoryChips, getFeaturedListings, getSecondaryListings } from "@/lib/utils";

import { AppShell } from "./AppShell";
import { ListingCard } from "./ListingCard";

export function HomePage() {
  const featuredListings = getFeaturedListings();
  const secondaryListings = getSecondaryListings().slice(0, 4);
  const chips = getCategoryChips();

  return (
    <AppShell
      heading="Discover the same BlueRock experience on web"
      subheading="Featured homes, smart search, and booking-ready property details now mirror the mobile app flow."
    >
      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[30px] border border-[#dde3f1] bg-[#eef1fb] p-6 shadow-[0_20px_44px_rgba(31,41,55,0.08)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#8d96aa]">
              Good afternoon
            </p>
            <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="max-w-xl text-[34px] font-extrabold tracking-[-0.04em] text-[#0f2b71]">
                  Find something now
                </h2>
                <p className="mt-2 max-w-xl text-[15px] leading-7 text-[#667089]">
                  Browse premium houses and apartments with the same curated discovery flow
                  from the mobile app.
                </p>
              </div>
              <Link
                href="/search"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#2b5df3] px-6 text-sm font-bold text-white shadow-[0_12px_24px_rgba(43,93,243,0.25)]"
              >
                Open Search
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { label: "Live listings", value: "10" },
              { label: "Featured homes", value: String(featuredListings.length) },
              { label: "Booking-ready", value: "100%" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[24px] border border-[#e3e7f2] bg-white p-5 shadow-[0_14px_32px_rgba(31,41,55,0.05)]"
              >
                <p className="text-sm font-bold text-[#7a8398]">{item.label}</p>
                <p className="mt-2 text-[30px] font-extrabold tracking-[-0.03em] text-[#0f2b71]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e3e7f2] bg-white p-5 shadow-[0_14px_34px_rgba(31,41,55,0.05)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-3 rounded-full border border-[#e1e6f1] bg-[#f7f8fc] px-5 py-4 text-[#7d8799]">
              <span className="text-lg">⌕</span>
              <span className="text-sm font-medium">Find something now</span>
            </div>
            <Link
              href="/search"
              className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#2b5df3] text-xl text-white shadow-[0_12px_24px_rgba(43,93,243,0.25)]"
            >
              ≡
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-[#dce3f2] bg-[#f7f8fc] px-4 py-2 text-sm font-bold text-[#546076]"
              >
                {chip}
              </span>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-[24px] font-extrabold tracking-[-0.03em] text-[#0f2b71]">
                Featured Homes
              </h3>
              <p className="mt-1 text-sm text-[#7a8398]">
                The same premium properties highlighted in the mobile app.
              </p>
            </div>
            <Link href="/search" className="text-sm font-bold text-[#2b5df3]">
              View all
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {featuredListings.slice(0, 4).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-[24px] font-extrabold tracking-[-0.03em] text-[#0f2b71]">
                More to Explore
              </h3>
              <p className="mt-1 text-sm text-[#7a8398]">
                A stacked feed of apartments and houses, just like the mobile listing feed.
              </p>
            </div>
            <Link href="/search" className="text-sm font-bold text-[#2b5df3]">
              Search all
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {secondaryListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} variant="list" />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
