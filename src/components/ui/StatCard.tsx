"use client";

import type { ReactNode } from "react";

type StatCardProps = {
  eyebrow: string;
  value: string | number;
  valueClassName?: string;
  icon?: ReactNode;
  trend?: { label: string; positive?: boolean };
  onClick?: () => void;
  children?: ReactNode;
  tint?: string;
};

export function StatCard({
  eyebrow,
  value,
  valueClassName,
  icon,
  trend,
  onClick,
  children,
  tint = "#1E5BFF",
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] ${onClick ? "cursor-pointer transition hover:-translate-y-0.5" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6b7280]">
            {eyebrow}
          </p>
          <p
            className={`mt-2 text-[22px] font-black tracking-tight ${valueClassName ?? "text-[#111827]"}`}
          >
            {value}
          </p>
        </div>
        {icon ? (
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl text-base"
            style={{
              background: `color-mix(in srgb, ${tint} 12%, transparent)`,
              color: tint,
            }}
          >
            {icon}
          </span>
        ) : null}
      </div>
      {trend ? (
        <p
          className={`mt-3 text-xs font-semibold ${trend.positive === false ? "text-[#ef4444]" : trend.positive ? "text-[#10b981]" : "text-[#6b7280]"}`}
        >
          {trend.label}
        </p>
      ) : null}
      {children}
    </div>
  );
}
