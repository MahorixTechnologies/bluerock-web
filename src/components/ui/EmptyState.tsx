"use client";

import type { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-10 text-center shadow-[var(--shadow-card)]">
      {icon ? (
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(30,91,255,0.12)] text-3xl text-[#1E5BFF]">
          {icon}
        </div>
      ) : null}
      <h2 className="text-[22px] font-black tracking-tight text-[#111827]">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6b7280]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
