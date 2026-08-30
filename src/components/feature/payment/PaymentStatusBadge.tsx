"use client";

import type { PaymentStatus } from "@/api/payments";

type StatusConfig = {
  label: string;
  pillClass: string;
  dotClass: string;
  icon: React.ReactNode;
};

function getStatusConfig(status: PaymentStatus): StatusConfig {
  switch (status) {
    case "PAID":
      return {
        label: "Paid",
        pillClass:
          "bg-[var(--success)]/12 text-[var(--success)] border border-[var(--success)]/20",
        dotClass: "bg-[var(--success)]",
        icon: (
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3 w-3"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ),
      };
    case "REFUNDED":
      return {
        label: "Refunded",
        pillClass:
          "bg-[rgba(107,114,128,0.12)] text-[#4b5563] border border-[rgba(107,114,128,0.2)]",
        dotClass: "bg-[var(--muted)]",
        icon: (
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3 w-3"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M15 10a5 5 0 11-9.33-2.5H4a1 1 0 110-2h3.5a1 1 0 011 1V7A5 5 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
        ),
      };
    case "UNPAID":
      return {
        label: "Unpaid",
        pillClass:
          "bg-[rgba(234,179,8,0.14)] text-[#b45309] border border-[rgba(234,179,8,0.25)]",
        dotClass: "bg-[#d97706]",
        icon: (
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3 w-3"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.75a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0v-4.5zM10 15a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        ),
      };
    case "PROCESSING":
      return {
        label: "Processing",
        pillClass:
          "bg-[rgba(37,99,235,0.12)] text-[#1d4ed8] border border-[rgba(37,99,235,0.2)]",
        dotClass: "bg-[#3b82f6]",
        icon: <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#2563eb]" />,
      };
    case "FAILED":
      return {
        label: "Failed",
        pillClass:
          "bg-[var(--danger-soft)] text-[#dc2626] border border-[rgba(239,68,68,0.2)]",
        dotClass: "bg-[var(--danger)]",
        icon: (
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3 w-3"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
        ),
      };
  }
}

export function PaymentStatusBadge({
  status,
  compact = false,
}: {
  status: PaymentStatus;
  compact?: boolean;
}) {
  const cfg = getStatusConfig(status);

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${cfg.pillClass}`}
      >
        {cfg.icon}
        {cfg.label}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full px-2 py-1.5">
      <span
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${cfg.pillClass}`}
      >
        {cfg.icon}
      </span>
      <span
        className={`text-[10px] font-black uppercase tracking-[0.18em] ${cfg.pillClass} rounded-full px-3 py-1`}
      >
        {cfg.label}
      </span>
    </span>
  );
}
