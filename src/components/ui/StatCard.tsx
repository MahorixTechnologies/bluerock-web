"use client";

import type { ReactNode } from "react";

type StatCardBadge = { label: string; positive?: boolean };

type StatCardProps = {
  eyebrow: string;
  value: string | number;
  valueClassName?: string;
  icon?: ReactNode;
  tint?: string;
  badge?: StatCardBadge;
  footer?: ReactNode;
  onClick?: () => void;
  children?: ReactNode;
};

export function StatCard({
  eyebrow,
  value,
  valueClassName,
  icon,
  tint = "var(--primary)",
  badge,
  footer,
  onClick,
  children,
}: StatCardProps) {
  const badgeClass =
    badge?.positive === false
      ? "bg-[var(--trend-down-bg)] text-[var(--trend-down)]"
      : "bg-[var(--trend-up-bg)] text-[var(--trend-up)]";
  const badgeArrow = badge?.positive === false ? "⊖" : "⦿";

  return (
    <div
      onClick={onClick}
      className={`group overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
            {eyebrow}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <p
              className={`text-[26px] font-black tracking-tight ${valueClassName ?? "text-[var(--text)]"}`}
            >
              {value}
            </p>
            {badge ? (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${badgeClass}`}
              >
                <span className="text-[10px]">{badgeArrow}</span>
                {badge.label}
              </span>
            ) : null}
          </div>
        </div>
        {icon ? (
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl transition-transform duration-300 group-hover:scale-105"
            style={{
              background: `color-mix(in srgb, ${tint} 12%, transparent)`,
              color: tint,
            }}
          >
            {icon}
          </span>
        ) : null}
      </div>
      {footer ? (
        <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
          {footer}
        </div>
      ) : null}
      {children}
    </div>
  );
}
