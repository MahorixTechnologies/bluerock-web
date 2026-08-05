import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { DashboardRouter } from "@/components/feature/home/DashboardRouter";
import { formatMoney } from "@/utils";

type PayoutBatch = {
  id: string;
  date: string;
  label: string;
  bookingIds: string;
  method: "Bank Transfer" | "Wallet" | "Card";
  amount: number;
  currency: "USD" | "NGN";
  fee: number;
  status: "Paid" | "Pending" | "Failed";
  reference: string;
};

const mockPayouts: PayoutBatch[] = [
  { id: "PO-0092", date: "2026-07-31", label: "Weekly disbursement · Week 31", bookingIds: "BK-2046 · BK-2045", method: "Bank Transfer", amount: 3080, currency: "USD", fee: 162, status: "Paid", reference: "TRF-20260731-0092" },
  { id: "PO-0091", date: "2026-07-24", label: "Weekly disbursement · Week 30", bookingIds: "BK-2043 · BK-2042 · BK-2041", method: "Bank Transfer", amount: 4260, currency: "USD", fee: 224, status: "Paid", reference: "TRF-20260724-0091" },
  { id: "PO-0090", date: "2026-07-17", label: "Weekly disbursement · Week 29", bookingIds: "BK-2039 · BK-2038", method: "Wallet", amount: 2190, currency: "USD", fee: 115, status: "Paid", reference: "WAL-20260717-0090" },
  { id: "PO-0089", date: "2026-07-10", label: "Weekly disbursement · Week 28", bookingIds: "BK-2036 · BK-2035 · BK-2034", method: "Bank Transfer", amount: 3620, currency: "USD", fee: 191, status: "Paid", reference: "TRF-20260710-0089" },
  { id: "PO-0093", date: "2026-08-07", label: "Weekly disbursement · Week 32", bookingIds: "BK-2048 · BK-2047", method: "Wallet", amount: Math.round(2590 * 0.95), currency: "USD", fee: 130, status: "Pending", reference: "WAL-20260807-0093" },
  { id: "PO-0088", date: "2026-07-03", label: "Weekly disbursement · Week 27", bookingIds: "BK-2032", method: "Bank Transfer", amount: 1240, currency: "USD", fee: 0, status: "Failed", reference: "TRF-20260703-0088" },
];

function StatusBadge({ status }: { status: PayoutBatch["status"] }) {
  const map = {
    Paid: "bg-[var(--trend-up-bg)] text-[var(--trend-up)]",
    Pending: "bg-[rgba(234,179,8,0.12)] text-[#ca8a04]",
    Failed: "bg-[rgba(239,68,68,0.12)] text-[#ef4444]",
  } as const;
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ${map[status]}`}>{status}</span>;
}

function Tile({ label, value, sub, tint, icon }: { label: string; value: string; sub: string; tint: string; icon: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6b7280]">{label}</p>
          <p className="mt-2 text-[24px] font-black tracking-tight text-[#111827]">{value}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl text-base" style={{ background: `color-mix(in srgb, ${tint} 12%, transparent)`, color: tint }}>{icon}</span>
      </div>
      <p className="mt-3 text-xs font-semibold text-[#6b7280]">{sub}</p>
    </div>
  );
}

export function HostPayoutsPage() {
  const totals = mockPayouts.reduce(
    (acc, p) => {
      if (p.status === "Paid") {
        acc.paid += p.amount;
        acc.paidFees += p.fee;
      }
      if (p.status === "Pending") {
        acc.pending += p.amount;
        acc.pendingFees += p.fee;
      }
      if (p.status === "Failed") {
        acc.failed += p.amount;
      }
      acc.totalGross += p.amount + p.fee;
      return acc;
    },
    { paid: 0, paidFees: 0, pending: 0, pendingFees: 0, failed: 0, totalGross: 0 },
  );

  return (
    <AppShell heading="Payouts" subheading="Disbursements, service fees and withdrawal methods">
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Tile label="Total Gross" value={formatMoney(totals.totalGross, "USD")} sub="Before fees · lifetime" tint="#1E5BFF" icon="💎" />
          <Tile label="Available Balance" value={formatMoney(totals.pending, "USD")} sub={`${mockPayouts.filter(p => p.status === "Pending").length} batches scheduled`} tint="#ca8a04" icon="🏦" />
          <Tile label="Paid (YTD)" value={formatMoney(totals.paid, "USD")} sub="Deposited via bank transfer" tint="#10b981" icon="✅" />
          <Tile label="Service Fee" value={formatMoney(totals.paidFees, "USD")} sub="5% on paid payouts" tint="#6366f1" icon="📊" />
          <Tile label="Failed" value={formatMoney(totals.failed, "USD")} sub="Retry or change method" tint="#ef4444" icon="⚠" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-[20px] font-black tracking-tight text-[#111827]">Payout History</h3>
                <p className="mt-1 text-sm text-[#6b7280]">Weekly disbursements — click a batch to view booking-level breakdown.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[#374151]">
                  📅 Last 90 days
                </div>
                <button type="button" className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-bold text-[#111827] transition hover:bg-[var(--panel-soft)]">Export</button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
              <div className="grid grid-cols-[1.1fr_1.2fr_1.1fr_0.9fr_0.9fr_0.9fr_0.7fr] items-center gap-4 border-b border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3 sm:px-6">
                {["Payout", "Batch", "Bookings", "Method", "Gross", "Fee (5%)", "Net"].map((header) => (
                  <p key={header} className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6b7280]">{header}</p>
                ))}
              </div>
              {mockPayouts.map((payout) => (
                <div key={payout.id} className="grid grid-cols-[1.1fr_1.2fr_1.1fr_0.9fr_0.9fr_0.9fr_0.7fr] items-center gap-4 border-b border-[var(--border)] px-4 py-4 last:border-b-0 sm:px-6">
                  <div>
                    <p className="text-sm font-bold tabular-nums text-[#111827]">{payout.date}</p>
                    <p className="mt-0.5 text-xs font-semibold text-[#6b7280]">{payout.id}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#111827]">{payout.label}</p>
                    <p className="mt-0.5 truncate text-xs text-[#6b7280]">{payout.reference}</p>
                  </div>
                  <p className="text-xs font-semibold text-[#374151] truncate">{payout.bookingIds}</p>
                  <p className="text-sm font-bold text-[#111827]">{payout.method}</p>
                  <p className="text-sm font-bold tabular-nums text-[#111827]">{formatMoney(payout.amount + payout.fee, payout.currency)}</p>
                  <p className="text-sm font-bold tabular-nums text-[#ef4444]">-{formatMoney(payout.fee, payout.currency)}</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-black tabular-nums text-[#1E5BFF]">{formatMoney(payout.amount, payout.currency)}</p>
                    <StatusBadge status={payout.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6b7280]">Next Deposit</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <p className="text-[26px] font-black tracking-tight text-[#111827]">{formatMoney(totals.pending, "USD")}</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(234,179,8,0.12)] px-2 py-0.5 text-[11px] font-bold text-[#ca8a04]">⏱ Pending</span>
                  </div>
                  <p className="mt-1 text-xs text-[#6b7280]">Deposits every Friday before 5pm UTC</p>
                </div>
                <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ background: "rgba(30,91,255,0.12)", color: "#1E5BFF" }}>💳</button>
              </div>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[#6b7280]">Confirmed stays (pending)</p>
                  <p className="font-bold tabular-nums text-[#111827]">{formatMoney(totals.pending + totals.pendingFees, "USD")}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[#6b7280]">Platform service fee</p>
                  <p className="font-bold tabular-nums text-[#ef4444]">-{formatMoney(totals.pendingFees, "USD")}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#9ca3af]">Net Payable</p>
                  <p className="text-base font-black tabular-nums text-[#1E5BFF]">{formatMoney(totals.pending, "USD")}</p>
                </div>
              </div>
              <button type="button" className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#1E5BFF] text-sm font-bold text-white shadow-[0_8px_20px_rgba(30,91,255,0.35)] transition hover:bg-[#1849D6]">Withdraw to Bank</button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6b7280]">Payment Methods</p>
                  <h3 className="mt-2 text-[18px] font-black tracking-tight text-[#111827]">Active Accounts</h3>
                </div>
                <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-sm font-bold text-[#6b7280] transition hover:bg-[var(--panel-soft)]">+</button>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { icon: "🏦", title: "Stanbic IBTC · 0123456789", sub: "Default · Verified · Nigeria", tag: "Default", color: "#1E5BFF" },
                  { icon: "👛", title: "BlueRock Wallet", sub: "Instant · Available balance", tag: "Instant", color: "#10b981" },
                ].map((method) => (
                  <div key={method.title} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg text-base" style={{ background: `color-mix(in srgb, ${method.color} 14%, transparent)`, color: method.color }}>{method.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-[#111827]">{method.title}</p>
                        <p className="text-xs text-[#6b7280]">{method.sub}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-[rgba(30,91,255,0.12)] text-[#1E5BFF]">{method.tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function RenterRedirect() {
  return (
    <AppShell heading="Payouts" subheading="This section is for hosts only">
      <div className="rounded-2xl border border-[var(--border)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
        <p className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(30,91,255,0.12)] text-2xl text-[#1E5BFF]">💰</p>
        <h2 className="mt-4 text-[22px] font-black tracking-tight text-[#111827]">List your property and start earning</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6b7280]">Switch to a landlord account to accept bookings and receive weekly automatic withdrawals.</p>
        <Link href="/register/homeowner" className="mt-5 inline-flex h-11 items-center justify-center gap-1 rounded-xl bg-[#1E5BFF] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(30,91,255,0.35)] transition hover:bg-[#1849D6]">Become a Host →</Link>
      </div>
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
