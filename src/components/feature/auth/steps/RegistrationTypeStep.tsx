"use client";

import Link from "next/link";
import { useState } from "react";

import { roleContent, type Role } from "../data";
import { ChevronIcon, StarBullet } from "../icons";
import { AuthShell } from "../AuthShell";

export function RegistrationTypeStep() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  return (
    <AuthShell>
      <div className="space-y-4">
        {(Object.entries(roleContent) as [Role, (typeof roleContent)[Role]][]).map(
          ([role, content]) => {
            const expanded = selectedRole === role;

            return (
              <article
                key={role}
                className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-card-hover)]"
              >
                <button
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className="flex w-full items-start justify-between gap-4 text-left"
                >
                  <div>
                    <h2 className="text-[18px] font-black tracking-tight text-[var(--primary)]">{content.label}</h2>
                    <p className="mt-2 max-w-[280px] text-[14px] leading-7 text-[var(--muted)]">
                      {content.description}
                    </p>
                  </div>
                  <span
                    className={`mt-1 shrink-0 transition-colors ${
                      expanded ? "text-[var(--sidebar)]" : "text-[var(--primary)]"
                    }`}
                  >
                    <ChevronIcon open={expanded} />
                  </span>
                </button>

                {expanded ? (
                  <div className="mt-5 space-y-3">
                    {content.bullets.map((bullet) => (
                      <div key={bullet} className="flex items-center gap-3 rounded-xl bg-[var(--panel-soft)] px-3 py-2">
                        <StarBullet />
                        <span className="text-[14px] font-medium text-[#4b5563]">{bullet}</span>
                      </div>
                    ))}

                    <Link
                      href={`/register/${role}`}
                      className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--sidebar)] px-5 text-[14px] font-black text-white shadow-[0_8px_24px_rgba(10,42,140,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#07206E]"
                    >
                      {content.cta} →
                    </Link>
                  </div>
                ) : null}
              </article>
            );
          },
        )}
      </div>
    </AuthShell>
  );
}
