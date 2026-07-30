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
                className="rounded-[12px] border border-[#edf0f6] bg-white px-4 py-4 shadow-[0_6px_20px_rgba(15,23,42,0.04)]"
              >
                <button
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className="flex w-full items-start justify-between gap-4 text-left"
                >
                  <div>
                    <h2 className="text-[18px] font-extrabold text-[#2760ff]">{content.label}</h2>
                    <p className="mt-2 max-w-[270px] text-[14px] leading-7 text-[#7c8495]">
                      {content.description}
                    </p>
                  </div>
                  <span
                    className={`mt-1 shrink-0 ${
                      expanded ? "text-[#1d1d1f]" : "text-[#7a97ff]"
                    }`}
                  >
                    <ChevronIcon open={expanded} />
                  </span>
                </button>

                {expanded ? (
                  <div className="mt-5 space-y-3">
                    {content.bullets.map((bullet) => (
                      <div key={bullet} className="flex items-center gap-3">
                        <StarBullet />
                        <span className="text-[14px] text-[#8a91a1]">{bullet}</span>
                      </div>
                    ))}

                    <Link
                      href={`/register/${role}`}
                      className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[11px] bg-[#2b5df3] px-4 text-[15px] font-bold text-white shadow-[0_12px_24px_rgba(43,93,243,0.25)] transition-transform hover:-translate-y-0.5"
                    >
                      {content.cta}
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
