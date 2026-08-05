"use client";

import type { ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
};

export function SectionHeader({ eyebrow, title, action }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#10b981]">
            {eyebrow}
          </p>
        ) : null}
        <h3 className="mt-1 text-[20px] font-black tracking-tight text-[#111827]">
          {title}
        </h3>
      </div>
      {action}
    </div>
  );
}
