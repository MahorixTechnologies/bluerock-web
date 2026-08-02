"use client";

import { useState } from "react";

type PaymentMethod = "card" | "transfer" | "wallet";

const METHOD_OPTIONS: Array<{
  key: PaymentMethod;
  icon: string;
  title: string;
  subtitle: string;
  logos?: React.ReactNode;
}> = [
  {
    key: "card",
    icon: "💳",
    title: "Credit / Debit card",
    subtitle: "Visa, Mastercard, Amex",
    logos: (
      <div className="flex items-center gap-1.5">
        <span className="inline-flex h-5 w-8 items-center justify-center rounded bg-gradient-to-br from-[#1A3CC8] to-[#1E5BFF] text-[9px] font-black italic tracking-wide text-white shadow-sm">
          VISA
        </span>
        <span className="inline-flex h-5 w-8 items-center justify-center rounded bg-gradient-to-br from-[#ea4335] to-[#fbbc05] text-[9px] font-black text-white shadow-sm">
          MC
        </span>
      </div>
    ),
  },
  {
    key: "transfer",
    icon: "⇋",
    title: "Bank Transfer",
    subtitle: "Secure direct deposit",
  },
  {
    key: "wallet",
    icon: "₿",
    title: "Digital wallet",
    subtitle: "PayPal, Apple Pay & more",
  },
];

export function PaymentMethodCard({
  method: initialMethod = "card",
}: {
  method?: PaymentMethod;
}) {
  const [selected, setSelected] = useState<PaymentMethod>(initialMethod);

  return (
    <div className="rounded-[28px] border border-[rgba(16,185,129,0.15)] bg-white p-6 shadow-[0_10px_40px_rgba(16,185,129,0.06)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#059669]/70">
            Payment method
          </p>
          <h3 className="mt-1 text-lg font-black tracking-tight text-[#064e3b]">
            Choose how to pay
          </h3>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {METHOD_OPTIONS.map((opt) => {
          const isActive = selected === opt.key;
          return (
            <label
              key={opt.key}
              className={`group relative cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                isActive
                  ? "border-[#10b981] bg-[rgba(16,185,129,0.06)] shadow-[0_0_0_3px_rgba(16,185,129,0.12)]"
                  : "border-[rgba(17,24,39,0.08)] bg-white hover:border-[rgba(16,185,129,0.3)] hover:bg-[rgba(16,185,129,0.03)]"
              }`}
            >
              <input
                type="radio"
                name="payment-method"
                value={opt.key}
                checked={isActive}
                onChange={() => setSelected(opt.key)}
                className="sr-only"
              />
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${
                      isActive
                        ? "bg-gradient-to-br from-[#059669] to-[#047857] text-white shadow-[0_4px_12px_rgba(5,150,105,0.3)]"
                        : "bg-[#f3f4f6] text-[#4b5563]"
                    }`}
                  >
                    {opt.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-[#111827]">{opt.title}</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-[#6b7280]">
                      {opt.subtitle}
                    </p>
                    {opt.logos ? <div className="mt-2">{opt.logos}</div> : null}
                  </div>
                </div>
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                    isActive
                      ? "border-[#10b981] bg-[#10b981]"
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

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-[rgba(16,185,129,0.15)] bg-[rgba(16,185,129,0.04)] px-4 py-3">
        <span className="mt-0.5 text-sm text-[#059669]">ℹ️</span>
        <p className="text-xs font-semibold leading-relaxed text-[#065f46]">
          Demo build — all methods act the same. No real charges.
        </p>
      </div>
    </div>
  );
}
