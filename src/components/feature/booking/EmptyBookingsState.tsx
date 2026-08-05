"use client";

import Link from "next/link";

export function EmptyBookingsState({ mode }: { mode: "renter" | "landlord" }) {
  if (mode === "renter") {
    return (
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="bg-gradient-to-br from-[rgba(16,185,129,0.08)] via-white to-[rgba(5,150,105,0.08)] px-8 py-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[rgba(16,185,129,0.7)]">
              Booking Dashboard
            </p>
            <h2 className="mt-4 text-[30px] font-black tracking-tight text-[#111827]">
              No trips yet
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[#6b7280]">
              Start from a listing detail page, choose your dates, and your reservation will
              appear here with a full summary including host approval state and payment readiness.
            </p>
            <Link
              href="/search"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[rgba(16,185,129,1)] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(16,185,129,0.32)] transition hover:bg-[rgba(5,150,105,1)]"
            >
              Search stays <span>→</span>
            </Link>
          </div>

          <div className="grid gap-4 bg-[var(--panel-soft)] p-8 sm:grid-cols-3 lg:grid-cols-1">
            {[
              {
                label: "Host Approval",
                value: "Tracked",
                icon: "✅",
              },
              {
                label: "Payment Status",
                value: "Per Booking",
                icon: "💳",
              },
              {
                label: "Stay History",
                value: "One Click",
                icon: "📚",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6b7280]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-[20px] font-black tracking-tight text-[#111827]">
                      {item.value}
                    </p>
                  </div>
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base"
                    style={{
                      background: "rgba(16,185,129,0.12)",
                      color: "#10b981",
                    }}
                  >
                    {item.icon}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
      <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="bg-gradient-to-br from-[rgba(16,185,129,0.08)] via-white to-[rgba(5,150,105,0.08)] px-8 py-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[rgba(16,185,129,0.7)]">
            Host Dashboard
          </p>
          <h2 className="mt-4 text-[30px] font-black tracking-tight text-[#111827]">
            No guest requests yet
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[#6b7280]">
            Publish your first listing to start receiving booking requests from guests. Once your property is live, approvals, payouts, and stay details will appear here.
          </p>
          <Link
            href="/host/listings"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[rgba(16,185,129,1)] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(16,185,129,0.32)] transition hover:bg-[rgba(5,150,105,1)]"
          >
            Publish your first home <span>→</span>
          </Link>
        </div>

        <div className="grid gap-4 bg-[var(--panel-soft)] p-8 sm:grid-cols-3 lg:grid-cols-1">
          {[
            {
              label: "Guest Requests",
              value: "Live Queue",
              icon: "📋",
            },
            {
              label: "Quick Approve",
              value: "One Tap",
              icon: "✓",
            },
            {
              label: "Payout Tracking",
              value: "Automated",
              icon: "💵",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6b7280]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-[20px] font-black tracking-tight text-[#111827]">
                    {item.value}
                  </p>
                </div>
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base"
                  style={{
                    background: "rgba(16,185,129,0.12)",
                    color: "#10b981",
                  }}
                >
                  {item.icon}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
