"use client";

import type { ReactNode } from "react";

type BadgeVariant = "primary" | "success" | "warning" | "danger" | "soft";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const variantStyles: Record<BadgeVariant, string> = {
  primary: "bg-[var(--primary-soft)] text-[var(--primary)]",
  success: "bg-[var(--success-soft)] text-[var(--success)]",
  warning: "bg-[rgba(245,158,11,0.12)] text-[#f59e0b]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  soft: "bg-[var(--panel-soft)] text-[var(--muted)]",
};

export function Badge({ children, variant = "primary", className }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ${variantStyles[variant]} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
