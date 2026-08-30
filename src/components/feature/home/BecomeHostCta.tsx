"use client";

import Link from "next/link";
import { useState } from "react";

import { applyForOwnerRole } from "@/api/users";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useWebAuth } from "@/providers/WebAuthProvider";

const APPLIED_KEY = "bluerock.web.ownerApplications.v1";

export function BecomeHostCta({
  title = "Earn by hosting your space",
  description = "Switch to a landlord account to manage listings, approve guest bookings and receive payouts.",
}: {
  title?: string;
  description?: string;
}) {
  const { status, profile, accessToken } = useWebAuth();
  const [appliedEmails, setAppliedEmails] = useLocalStorage<string[]>(APPLIED_KEY, []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alreadyApplied = Boolean(profile && appliedEmails.includes(profile.email));

  async function handleApply() {
    if (!profile) return;
    setSubmitting(true);
    setError(null);
    try {
      await applyForOwnerRole(accessToken);
      setAppliedEmails((prev) =>
        prev.includes(profile.email) ? prev : [...prev, profile.email],
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit application.";
      if (message.toLowerCase().includes("pending")) {
        setAppliedEmails((prev) =>
          prev.includes(profile.email) ? prev : [...prev, profile.email],
        );
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
      <p className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-2xl text-[var(--primary)]">
        🏠
      </p>
      <h2 className="mt-4 text-[22px] font-black tracking-tight text-[var(--text)]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">{description}</p>

      {status === "signedIn" && profile?.role === "RENTER" ? (
        alreadyApplied ? (
          <div className="mx-auto mt-5 max-w-md rounded-xl border border-[var(--success)]/20 bg-[var(--success-soft)] px-4 py-3 text-sm font-semibold text-[var(--success)]">
            ✓ Application submitted — pending admin review. Once approved, log out and back in
            to unlock your host tools.
          </div>
        ) : (
          <div className="mx-auto mt-5 max-w-md space-y-3">
            {error ? (
              <p className="rounded-xl border border-[var(--danger)]/20 bg-[var(--danger-bg)] px-4 py-2.5 text-xs font-semibold text-[var(--danger)]">
                {error}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => void handleApply()}
              disabled={submitting}
              className="inline-flex h-11 items-center justify-center gap-1 rounded-xl bg-[var(--primary)] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(30,91,255,0.35)] transition hover:bg-[var(--primary-600)] disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Apply to Become a Host →"}
            </button>
            <p className="text-xs text-[var(--muted)]">
              No new account needed — we&apos;ll review your application and upgrade this account.
            </p>
          </div>
        )
      ) : (
        <Link
          href="/login"
          className="mt-5 inline-flex h-11 items-center justify-center gap-1 rounded-xl bg-[var(--primary)] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(30,91,255,0.35)] transition hover:bg-[var(--primary-600)]"
        >
          Log In to Apply →
        </Link>
      )}
    </div>
  );
}
