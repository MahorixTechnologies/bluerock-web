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
  cardWidthClassName = "max-w-[410px]",
}: AuthShellProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f6f6f7] px-4 py-10 text-[#2d3348]">
      <section
        className={`w-full rounded-[20px] bg-[#eef1fb] px-8 py-9 shadow-[0_24px_70px_rgba(31,41,55,0.08)] ${cardWidthClassName}`}
      >
        {(title || subtitle) ? (
          <div className="text-center">
            {title ? (
              <h1 className="text-[24px] font-extrabold tracking-[-0.03em] text-[#0f2b71] sm:text-[28px]">
                {title}
              </h1>
            ) : null}
            {subtitle ? (
              <p className="mt-2 text-[15px] font-medium text-[#5d6475]">{subtitle}</p>
            ) : null}
          </div>
        ) : null}

        <div className={title || subtitle ? "mt-7" : ""}>{children}</div>

        {footer ? (
          footer
        ) : (
          <p className="mt-7 text-center text-[14px] font-bold text-[#555b6b]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#2760ff]">
              Login
            </Link>
          </p>
        )}
      </section>

      <footer className="mt-14 text-center text-[10px] font-bold uppercase tracking-[0.38em] text-[#b0b5c1]">
        © 2026 Bluerock. All rights reserved.
      </footer>
    </main>
  );
}
