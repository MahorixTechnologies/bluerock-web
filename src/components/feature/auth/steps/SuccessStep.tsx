import Link from "next/link";

import { getRoleContent, type Role } from "../data";
import { AuthShell } from "../AuthShell";

export function SuccessStep({ role }: { role: Role }) {
  const content = getRoleContent(role);

  if (!content) return null;

  return (
    <AuthShell
      title=""
      subtitle=""
      cardWidthClassName="max-w-[350px]"
      footer={<></>}
    >
      <div className="rounded-[20px] bg-[#eef1fb] px-7 py-10 text-center shadow-[0_24px_70px_rgba(31,41,55,0.08)]">
        <div className="mx-auto flex h-[58px] w-[58px] items-center justify-center rounded-full bg-white text-[28px] shadow-[0_10px_26px_rgba(31,41,55,0.08)]">
          🎉
        </div>
        <h1 className="mt-7 text-[22px] font-extrabold tracking-[-0.03em] text-[#0f2b71]">
          Account Created Successfully!
        </h1>
        <p className="mx-auto mt-3 max-w-[250px] text-[15px] leading-7 text-[#5d6475]">
          Your {content.label.toLowerCase()} account has been created successfully.
        </p>

        <Link
          href="/login"
          className="mt-8 flex h-11 w-full items-center justify-center rounded-[11px] bg-[#2b5df3] px-4 text-[15px] font-bold text-white shadow-[0_12px_24px_rgba(43,93,243,0.25)] transition hover:-translate-y-0.5"
        >
          Redirecting to {content.dashboardLabel}...
        </Link>
      </div>
    </AuthShell>
  );
}
