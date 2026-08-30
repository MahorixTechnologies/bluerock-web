"use client";

export type PaymentProvider = "PAYSTACK" | "FLUTTERWAVE";

const PROVIDER_OPTIONS: Array<{
  key: PaymentProvider;
  icon: string;
  title: string;
  subtitle: string;
  accent: string;
}> = [
  {
    key: "PAYSTACK",
    icon: "💳",
    title: "Paystack",
    subtitle: "Card, bank transfer, USSD",
    accent: "#00C3F7",
  },
  {
    key: "FLUTTERWAVE",
    icon: "🌊",
    title: "Flutterwave",
    subtitle: "Card, bank transfer, mobile money",
    accent: "#F5A623",
  },
];

export function PaymentMethodCard({
  selected,
  onChange,
}: {
  selected: PaymentProvider;
  onChange: (provider: PaymentProvider) => void;
}) {
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)]/70">
            Payment method
          </p>
          <h3 className="mt-1 text-lg font-black tracking-tight text-[var(--accent)]">
            Choose how to pay
          </h3>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {PROVIDER_OPTIONS.map((opt) => {
          const isActive = selected === opt.key;
          return (
            <label
              key={opt.key}
              className={`group relative cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                isActive
                  ? "border-[var(--primary)] bg-[var(--primary-soft)] shadow-[0_0_0_3px_rgba(30,91,255,0.12)]"
                  : "border-[var(--border)] bg-white hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/[0.03]"
              }`}
            >
              <input
                type="radio"
                name="payment-provider"
                value={opt.key}
                checked={isActive}
                onChange={() => onChange(opt.key)}
                className="sr-only"
              />
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl text-white shadow-sm"
                    style={{ background: opt.accent }}
                  >
                    {opt.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-[var(--text)]">{opt.title}</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-[var(--muted)]">
                      {opt.subtitle}
                    </p>
                  </div>
                </div>
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                    isActive
                      ? "border-[var(--primary)] bg-[var(--primary)]"
                      : "border-[#d1d5db] bg-white"
                  }`}
                >
                  {isActive ? (
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-3 w-3 text-white"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : null}
                </span>
              </div>
            </label>
          );
        })}
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-[var(--primary)]/15 bg-[var(--primary)]/[0.04] px-4 py-3">
        <span className="mt-0.5 text-sm text-[var(--primary)]">🔒</span>
        <p className="text-xs font-semibold leading-relaxed text-[var(--accent)]">
          You&apos;ll be redirected to {selected === "PAYSTACK" ? "Paystack" : "Flutterwave"} to
          complete payment securely, then brought back here.
        </p>
      </div>
    </div>
  );
}
