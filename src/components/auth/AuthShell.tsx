import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  cardWidthClassName?: string;
};

export function AuthShell({
  title = "Create an account",
  subtitle = "Choose how you want to use the platform.",
  children,
  footer,
  cardWidthClassName = "max-w-[440px]",
}: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--bg)] px-4 py-10 text-[var(--text)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#1E5BFF]/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-[480px] w-[480px] rounded-full bg-[#0A2A8C]/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-[340px] w-[340px] -translate-x-1/2 rounded-full bg-[#7CA8FF]/8 blur-3xl" />
      </div>

      <section
        className={`relative z-10 w-full rounded-3xl border border-[var(--border)] bg-white px-8 py-9 shadow-[0_24px_70px_rgba(10,42,140,0.08)] backdrop-blur ${cardWidthClassName}`}
      >
        <div className="flex flex-col items-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1E5BFF]/12 text-2xl font-black text-[#1E5BFF] shadow-[0_8px_24px_rgba(30,91,255,0.15)]">
            ◈
          </span>
          <p className="mt-3 text-[10px] font-black uppercase tracking-[0.36em] text-[#0A2A8C]/60">
            BlueRock
          </p>
        </div>

        {(title || subtitle) ? (
          <div className="mt-7 text-center">
            {title ? (
              <h1 className="text-[26px] font-black tracking-tight text-[#111827] sm:text-[28px]">
                {title}
              </h1>
            ) : null}
            {subtitle ? (
              <p className="mt-2 text-sm leading-6 text-[#6b7280]">{subtitle}</p>
            ) : null}
          </div>
        ) : null}

        <div className={title || subtitle ? "mt-7" : "mt-7"}>{children}</div>

        {footer ? (
          footer
        ) : (
          <p className="mt-7 text-center text-sm font-semibold text-[#4b5563]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-black text-[#1E5BFF] transition hover:text-[#1849D6]"
            >
              Login
            </Link>
          </p>
        )}
      </section>

      <footer className="relative z-10 mt-14 text-center text-[10px] font-black uppercase tracking-[0.38em] text-[#9ca3af]">
        © 2026 Bluerock. All rights reserved.
      </footer>
    </main>
  );
}
