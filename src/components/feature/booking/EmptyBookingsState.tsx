"use client";

import Link from "next/link";

import { StatCard } from "@/components/ui/StatCard";

export function EmptyBookingsState({ mode }: { mode: "renter" | "landlord" }) {
  if (mode === "renter") {
    return (
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="bg-gradient-to-br from-[var(--primary-soft)] via-white to-[rgba(20,66,196,0.08)] px-8 py-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]/70">
              Booking Dashboard
            </p>
            <h2 className="mt-4 text-[30px] font-black tracking-tight text-[var(--text)]">
              No trips yet
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">
              Start from a listing detail page, choose your dates, and your reservation will
              appear here with a full summary including host approval state and payment readiness.
            </p>
            <Link
              href="/search"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(30,91,255,0.32)] transition hover:bg-[var(--primary-600)]"
            >
              Search stays <span>→</span>
            </Link>
          </div>

          <div className="grid gap-4 bg-[var(--panel-soft)] p-8 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { label: "Host Approval", value: "Tracked", icon: "✅" },
              { label: "Payment Status", value: "Per Booking", icon: "💳" },
              { label: "Stay History", value: "One Click", icon: "📚" },
            ].map((item) => (
              <StatCard key={item.label} eyebrow={item.label} value={item.value} icon={item.icon} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
      <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="bg-gradient-to-br from-[var(--primary-soft)] via-white to-[rgba(20,66,196,0.08)] px-8 py-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]/70">
            Host Dashboard
          </p>
          <h2 className="mt-4 text-[30px] font-black tracking-tight text-[var(--text)]">
            No guest requests yet
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">
            Publish your first listing to start receiving booking requests from guests. Once your property is live, approvals, payouts, and stay details will appear here.
          </p>
          <Link
            href="/host/listings"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(30,91,255,0.32)] transition hover:bg-[var(--primary-600)]"
          >
            Publish your first home <span>→</span>
          </Link>
        </div>

        <div className="grid gap-4 bg-[var(--panel-soft)] p-8 sm:grid-cols-3 lg:grid-cols-1">
          {[
            { label: "Guest Requests", value: "Live Queue", icon: "📋" },
            { label: "Quick Approve", value: "One Tap", icon: "✓" },
            { label: "Payout Tracking", value: "Automated", icon: "💵" },
          ].map((item) => (
            <StatCard key={item.label} eyebrow={item.label} value={item.value} icon={item.icon} />
          ))}
        </div>
      </div>
    </section>
  );
}
