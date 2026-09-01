"use client";

import { useCallback, useEffect, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { BecomeHostCta } from "@/components/feature/home/BecomeHostCta";
import { DashboardRouter } from "@/components/feature/home/DashboardRouter";
import {
  fetchOwnerPayoutAccount,
  fetchOwnerPayouts,
  setupPayoutAccount,
  type Payout,
  type PayoutAccount,
} from "@/api/payouts";
import { useWebAuth } from "@/providers/WebAuthProvider";
import { formatMoney } from "@/utils";

function StatusBadge({ status }: { status: Payout["status"] }) {
  const map = {
    PAID: "bg-[var(--trend-up-bg)] text-[var(--trend-up)]",
    PENDING: "bg-[rgba(234,179,8,0.12)] text-[#ca8a04]",
    PROCESSING: "bg-[rgba(234,179,8,0.12)] text-[#ca8a04]",
    FAILED: "bg-[var(--danger-soft)] text-[var(--danger)]",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ${map[status]}`}>
      {status}
    </span>
  );
}

function Tile({ label, value, sub, tint, icon }: { label: string; value: string; sub: string; tint: string; icon: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
          <p className="mt-2 text-[24px] font-black tracking-tight text-[var(--text)]">{value}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl text-base" style={{ background: `color-mix(in srgb, ${tint} 12%, transparent)`, color: tint }}>{icon}</span>
      </div>
      <p className="mt-3 text-xs font-semibold text-[var(--muted)]">{sub}</p>
    </div>
  );
}

function PayoutAccountCard({ accessToken }: { accessToken: string | null }) {
  const [account, setAccount] = useState<PayoutAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [provider, setProvider] = useState<"PAYSTACK" | "FLUTTERWAVE">("PAYSTACK");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchOwnerPayoutAccount(accessToken);
        if (!cancelled) setAccount(data);
      } catch {
        // No account set up yet, or a transient failure — the form below
        // covers both; nothing extra to show here.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const saved = await setupPayoutAccount({
        accessToken,
        provider,
        bankCode,
        accountNumber,
        accountName,
      });
      setAccount(saved);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save payout account");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Payout Account</p>
          <h3 className="mt-2 text-[18px] font-black tracking-tight text-[var(--text)]">Where you get paid</h3>
        </div>
        {account && !editing ? (
          <button
            type="button"
            onClick={() => {
              setProvider(account.provider);
              setBankCode(account.bankCode);
              setAccountNumber(account.accountNumber);
              setAccountName(account.accountName);
              setEditing(true);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-sm font-bold text-[var(--muted)] transition hover:bg-[var(--panel-soft)]"
          >
            ✎
          </button>
        ) : null}
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-[var(--muted)]">Loading…</p>
      ) : editing || !account ? (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {(["PAYSTACK", "FLUTTERWAVE"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProvider(p)}
                className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                  provider === p
                    ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "border-[var(--border)] bg-white text-[var(--text)] hover:bg-[var(--panel-soft)]"
                }`}
              >
                {p === "PAYSTACK" ? "Paystack" : "Flutterwave"}
              </button>
            ))}
          </div>
          <input
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
            placeholder="Bank code"
            value={bankCode}
            onChange={(e) => setBankCode(e.target.value)}
          />
          <input
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
            placeholder="Account number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
          <input
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
            placeholder="Account name"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
          />
          {error ? <p className="text-xs font-bold text-[var(--danger)]">⚠ {error}</p> : null}
          <div className="flex gap-2">
            {account ? (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-sm font-bold text-[var(--text)] transition hover:bg-[var(--panel-soft)]"
              >
                Cancel
              </button>
            ) : null}
            <button
              type="button"
              disabled={saving || !bankCode || !accountNumber || !accountName}
              onClick={() => void handleSave()}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-[var(--primary)] text-sm font-bold text-white shadow-[0_8px_20px_rgba(30,91,255,0.35)] transition hover:bg-[var(--primary-600)] disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3">
          <div>
            <p className="text-sm font-bold text-[var(--text)]">{account.accountName}</p>
            <p className="text-xs text-[var(--muted)]">
              {account.provider === "PAYSTACK" ? "Paystack" : "Flutterwave"} · {account.accountNumber}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
              account.verified
                ? "bg-[var(--trend-up-bg)] text-[var(--trend-up)]"
                : "bg-[rgba(234,179,8,0.12)] text-[#ca8a04]"
            }`}
          >
            {account.verified ? "Verified" : "Pending"}
          </span>
        </div>
      )}
    </div>
  );
}

export function HostPayoutsPage() {
  const { accessToken } = useWebAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPayouts(await fetchOwnerPayouts(accessToken));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payouts");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (cancelled) return;
      await load();
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const totals = payouts.reduce(
    (acc, p) => {
      if (p.status === "PAID") acc.paid += p.amount;
      if (p.status === "PENDING" || p.status === "PROCESSING") acc.pending += p.amount;
      if (p.status === "FAILED") acc.failed += p.amount;
      acc.totalGross += p.amount;
      return acc;
    },
    { paid: 0, pending: 0, failed: 0, totalGross: 0 },
  );
  const currency = payouts[0]?.currency ?? "NGN";

  return (
    <AppShell heading="Payouts" subheading="Disbursements and payout account">
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Tile
            label="Total Payouts"
            value={loading ? "—" : formatMoney(totals.totalGross, currency)}
            sub={`${payouts.length} record${payouts.length === 1 ? "" : "s"}`}
            tint="var(--primary)"
            icon="💎"
          />
          <Tile
            label="Pending"
            value={loading ? "—" : formatMoney(totals.pending, currency)}
            sub={`${payouts.filter((p) => p.status === "PENDING" || p.status === "PROCESSING").length} awaiting disbursement`}
            tint="#ca8a04"
            icon="🏦"
          />
          <Tile
            label="Paid"
            value={loading ? "—" : formatMoney(totals.paid, currency)}
            sub="Successfully disbursed"
            tint="var(--trend-up)"
            icon="✅"
          />
          <Tile
            label="Failed"
            value={loading ? "—" : formatMoney(totals.failed, currency)}
            sub="Retry or change method"
            tint="var(--danger)"
            icon="⚠"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-[20px] font-black tracking-tight text-[var(--text)]">Payout History</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  One row per disbursement, most recent first.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void load()}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-bold text-[var(--text)] transition hover:bg-[var(--panel-soft)]"
              >
                Refresh
              </button>
            </div>

            {error ? (
              <div className="rounded-2xl border border-[var(--danger)]/20 bg-[var(--danger-bg)] p-6 text-center">
                <p className="text-sm font-bold text-[var(--danger)]">⚠ {error}</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
                <div className="overflow-x-auto">
                  <div className="min-w-[560px]">
                    <div className="grid grid-cols-[1.1fr_1.4fr_0.9fr_0.9fr] items-center gap-4 border-b border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3 sm:px-6">
                      {["Date", "Reference", "Status", "Amount"].map((header) => (
                        <p key={header} className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                          {header}
                        </p>
                      ))}
                    </div>
                    {loading ? (
                      <p className="px-6 py-8 text-sm font-semibold text-[var(--muted)]">Loading payouts…</p>
                    ) : payouts.length ? (
                      payouts.map((payout) => (
                        <div
                          key={payout.id}
                          className="grid grid-cols-[1.1fr_1.4fr_0.9fr_0.9fr] items-center gap-4 border-b border-[var(--border)] px-4 py-4 last:border-b-0 sm:px-6"
                        >
                          <div>
                            <p className="text-sm font-bold tabular-nums text-[var(--text)]">
                              {new Date(payout.createdAt).toLocaleDateString()}
                            </p>
                            {payout.paidAt ? (
                              <p className="mt-0.5 text-xs font-semibold text-[var(--muted)]">
                                Paid {new Date(payout.paidAt).toLocaleDateString()}
                              </p>
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[var(--text)]">{payout.reference}</p>
                            <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                              {payout.provider === "PAYSTACK" ? "Paystack" : "Flutterwave"}
                            </p>
                          </div>
                          <StatusBadge status={payout.status} />
                          <p className="justify-self-end text-sm font-black tabular-nums text-[var(--primary)]">
                            {formatMoney(payout.amount, payout.currency)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="px-6 py-8 text-sm text-[var(--muted)]">
                        No payouts yet — they appear here after a guest checks out of a paid stay.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <PayoutAccountCard accessToken={accessToken} />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function RenterRedirect() {
  return (
    <AppShell heading="Payouts" subheading="This section is for hosts only">
      <BecomeHostCta
        title="List your property and start earning"
        description="Switch to a landlord account to accept bookings and receive automatic payouts."
      />
    </AppShell>
  );
}

export default function HostPayoutsRoute() {
  return (
    <DashboardRouter
      landlord={<HostPayoutsPage />}
      renter={<RenterRedirect />}
      public={<RenterRedirect />}
    />
  );
}
