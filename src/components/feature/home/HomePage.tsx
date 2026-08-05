"use client";

import Link from "next/link";

import { useListings } from "@/hooks/useListings";
import { mockListings } from "@/constants/mock-data";
import { getCategoryChips } from "@/utils";

import { AppShell } from "@/components/layout/AppShell";
import { ListingCard } from "@/components/common/ListingCard";
import { useWebAuth } from "@/providers/WebAuthProvider";

type StatCard = {
  label: string;
  value: string;
  trend: number;
  trendDirection: "up" | "down";
  delta: string;
  icon: string;
  iconBg: string;
  iconColor: string;
};

function StatCard({ card }: { card: StatCard }) {
  const trendBadge =
    card.trendDirection === "up"
      ? "bg-[var(--trend-up-bg)] text-[var(--trend-up)]"
      : "bg-[var(--trend-down-bg)] text-[var(--trend-down)]";
  const trendArrow = card.trendDirection === "up" ? "⦿" : "⊖";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6b7280]">
            {card.label}
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-[28px] font-black tracking-tight text-[#111827]">
              {card.value}
            </p>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${trendBadge}`}
            >
              <span className="text-[10px]">{trendArrow}</span>
              {Math.abs(card.trend)}%
            </span>
          </div>
        </div>
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl transition-transform duration-300 group-hover:scale-105"
          style={{ background: card.iconBg, color: card.iconColor }}
        >
          {card.icon}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
        <p className="text-xs font-semibold text-[#6b7280]">
          <span className="text-[#1E5BFF]">{card.delta}</span> from last month
        </p>
        <span className="text-[#6b7280] transition-transform duration-200 group-hover:translate-x-0.5">
          →
        </span>
      </div>
    </div>
  );
}

export function HomePage() {
  const { accessToken } = useWebAuth();
  const { data: allListings = mockListings } = useListings({ token: accessToken, scope: "public" });
  const featured = allListings.slice(0, 4);
  const moreList = allListings.slice(4, 10);
  const chips = getCategoryChips();

  const stats: StatCard[] = [
    {
      label: "Live Listings",
      value: String(allListings.length),
      trend: 10.5,
      trendDirection: "up",
      delta: "+2",
      icon: "📋",
      iconBg: "rgba(30, 91, 255, 0.12)",
      iconColor: "#1E5BFF",
    },
    {
      label: "Featured Homes",
      value: String(featured.length),
      trend: 13.5,
      trendDirection: "up",
      delta: "+1",
      icon: "📈",
      iconBg: "rgba(30, 91, 255, 0.10)",
      iconColor: "#1E5BFF",
    },
    {
      label: "Total Bookings",
      value: "13,439",
      trend: 0.5,
      trendDirection: "down",
      delta: "+2,156",
      icon: "🧾",
      iconBg: "rgba(236, 72, 153, 0.10)",
      iconColor: "#ec4899",
    },
    {
      label: "Search Views",
      value: "349K",
      trend: 25.1,
      trendDirection: "down",
      delta: "-98.5K",
      icon: "📊",
      iconBg: "rgba(59, 130, 246, 0.12)",
      iconColor: "#3b82f6",
    },
  ];

  return (
    <AppShell
      heading="Dashboard"
      subheading="Discover the same BlueRock experience on web"
    >
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((card) => (
            <StatCard key={card.label} card={card} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6b7280]">
                  Discover Homes
                </p>
                <h2 className="mt-2 text-[26px] font-black tracking-tight text-[#111827]">
                  Find something now
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#6b7280]">
                  Browse premium houses and apartments with the same curated discovery flow
                  from the mobile app.
                </p>
              </div>
              <Link
                href="/search"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0A2A8C] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(10,42,140,0.25)] transition hover:bg-[#07206E]"
              >
                Open Search <span>→</span>
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3.5">
              <span className="text-lg text-[#6b7280]">⌕</span>
              <span className="flex-1 text-sm font-medium text-[#6b7280]">
                Find something now
              </span>
              <span className="hidden items-center gap-0.5 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-bold text-[#9ca3af] shadow-sm sm:flex">
                ⌘K
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {chips.slice(0, 8).map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-[var(--border)] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#4b5563] transition hover:border-[#1E5BFF]/30 hover:bg-[#1E5BFF]/5 hover:text-[#1E5BFF]"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6b7280]">
                    Conversion Rate
                  </p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <p className="text-[26px] font-black tracking-tight text-[#111827]">
                      4.55%
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--trend-up-bg)] px-2 py-0.5 text-[11px] font-bold text-[var(--trend-up)]">
                      ⦿ 0.5%
                    </span>
                  </div>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "rgba(59,130,246,0.12)", color: "#3b82f6" }}>
                  📊
                </span>
              </div>
              <div className="mt-5 space-y-4">
                {[
                  { label: "Product Views", pct: "15%", value: "6,545" },
                  { label: "Add to cart", pct: "8%", value: "3,491" },
                  { label: "Checkout Initiated", pct: "4%", value: "1,342" },
                  { label: "Completed purchases", pct: "1.89%", value: "1,200" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#374151]">{item.label}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-[#6b7280]">{item.pct}</span>
                        <span className="text-sm font-black text-[#111827] tabular-nums">
                          {item.value}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--panel-soft)]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#1E5BFF] to-[#7CA8FF]"
                        style={{ width: item.pct }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[#0A2A8C] via-[#0E3298] to-[#1442C4] p-5 shadow-[0_12px_32px_rgba(10,42,140,0.35)] text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7CA8FF]/70">
                    Upgrade
                  </p>
                  <h3 className="mt-2 text-[22px] font-black tracking-tight">
                    Premium Plan
                  </h3>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#0A2A8C] shadow transition hover:bg-[#EDF3FF]"
                >
                  Upgrade
                </button>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/80">
                Supercharge your sales management and unlock your full potential for
                extraordinary success.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-white/5 p-3">
                <div>
                  <p className="text-xs font-semibold text-white/60">Performance</p>
                  <p className="mt-1 text-lg font-black text-white">
                    <span className="text-[#7CA8FF]">↑</span> 79%
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/60">Tools</p>
                  <p className="mt-1 text-lg font-black text-white">🔧 30+</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-[20px] font-black tracking-tight text-[#111827]">
                Featured Homes
              </h3>
              <p className="mt-1 text-sm text-[#6b7280]">
                The same premium properties highlighted in the mobile app.
              </p>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-1 text-sm font-bold text-[#1E5BFF] transition hover:text-[#1849D6]"
            >
              View all <span>→</span>
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {featured.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-[20px] font-black tracking-tight text-[#111827]">
                More to Explore
              </h3>
              <p className="mt-1 text-sm text-[#6b7280]">
                A stacked feed of apartments and houses, just like the mobile listing feed.
              </p>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-1 text-sm font-bold text-[#1E5BFF] transition hover:text-[#1849D6]"
            >
              Search all <span>→</span>
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {moreList.map((listing) => (
              <ListingCard key={listing.id} listing={listing} variant="list" />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
