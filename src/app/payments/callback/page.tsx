"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { useWebAuth } from "@/providers/WebAuthProvider";
import { fetchMyBookings } from "@/api/bookings";
import { recordReceiptForPaidBooking, verifyPayment } from "@/api/payments";

type Outcome = "verifying" | "success" | "failed";

export default function PaymentsCallbackPage() {
  return (
    <Suspense fallback={null}>
      <PaymentsCallbackContent />
    </Suspense>
  );
}

function PaymentsCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accessToken } = useWebAuth();
  const [outcome, setOutcome] = useState<Outcome>("verifying");
  const ran = useRef(false);

  const purpose = searchParams.get("purpose") === "FEATURED_LISTING" ? "FEATURED_LISTING" : "BOOKING";
  const targetId = searchParams.get("targetId");

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    void (async () => {
      const flutterwaveStatus = searchParams.get("status");
      if (flutterwaveStatus && flutterwaveStatus !== "successful" && flutterwaveStatus !== "completed") {
        setOutcome("failed");
        return;
      }

      const reference = searchParams.get("reference") ?? searchParams.get("tx_ref") ?? undefined;
      const providerTransactionId = searchParams.get("transaction_id") ?? undefined;

      if (!reference) {
        setOutcome("failed");
        return;
      }

      const result = await verifyPayment({ accessToken, reference, providerTransactionId });
      if (!result?.success) {
        setOutcome("failed");
        return;
      }

      if (purpose === "BOOKING" && targetId) {
        const bookings = await fetchMyBookings(accessToken);
        const updated = bookings.find((b) => b.id === targetId);
        if (updated) recordReceiptForPaidBooking(updated);
      }

      setOutcome("success");
      setTimeout(() => {
        router.push(purpose === "BOOKING" ? `/bookings/${targetId}` : "/host/listings");
      }, 1800);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppShell heading="Payment" subheading="Confirming your transaction">
      <section className="mx-auto max-w-md rounded-3xl border border-[var(--border)] bg-white p-10 text-center shadow-[var(--shadow-card)]">
        {outcome === "verifying" && (
          <>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
            <h2 className="mt-5 text-[20px] font-black tracking-tight text-[var(--text)]">
              Confirming your payment…
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              We&apos;re verifying your transaction — this only takes a moment.
            </p>
          </>
        )}

        {outcome === "success" && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(16,185,129,0.12)] text-2xl text-[#059669]">
              ✓
            </div>
            <h2 className="mt-5 text-[20px] font-black tracking-tight text-[var(--text)]">
              Payment successful
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Redirecting you now…</p>
          </>
        )}

        {outcome === "failed" && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--danger-soft)] text-2xl text-[var(--danger)]">
              ⚠
            </div>
            <h2 className="mt-5 text-[20px] font-black tracking-tight text-[var(--text)]">
              Payment wasn&apos;t completed
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              It looks like the payment was cancelled or couldn&apos;t be verified. No charge was
              applied — you can try again.
            </p>
            <Link
              href={purpose === "BOOKING" && targetId ? `/bookings/${targetId}/pay` : "/host/listings"}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(30,91,255,0.35)] transition hover:bg-[var(--primary-600)]"
            >
              Try again
            </Link>
          </>
        )}
      </section>
    </AppShell>
  );
}
