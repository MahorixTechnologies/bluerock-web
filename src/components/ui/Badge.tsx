"use client";

import type { ReactNode } from "react";

type BadgeVariant = "primary" | "success" | "warning" | "danger" | "soft";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const variantStyles: Record<BadgeVariant, string> = {
  primary: "bg-[#E5EEFF] text-[#1E5BFF]",
  success: "bg-[rgba(16,185,129,0.12)] text-[#10b981]",
  warning: "bg-[rgba(245,158,11,0.12)] text-[#f59e0b]",
  danger: "bg-[rgba(239,68,68,0.12)] text-[#ef4444]",
  soft: "bg-[var(--panel-soft)] text-[#6b7280]",
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
