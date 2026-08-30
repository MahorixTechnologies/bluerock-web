import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";

import { ArrowRight, BackIcon, EyeIcon } from "./icons";

export function StepCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </div>
  );
}

export function StepHeader({
  title,
  intro,
  backHref,
}: {
  title: string;
  intro: string;
  backHref: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-[20px] font-black tracking-tight text-[var(--primary)]">{title}</h2>
        <p className="mt-2 max-w-[300px] text-sm leading-6 text-[var(--muted)]">{intro}</p>
      </div>
      <Link
        href={backHref}
        className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--panel-soft)] text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/10"
        aria-label="Go back"
      >
        <BackIcon />
      </Link>
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--muted-2)]">
      {children}
    </div>
  );
}

export function InputLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <span className="text-sm font-bold text-[#374151]">
      {children}
      {required ? <span className="text-[var(--danger)]"> *</span> : null}
    </span>
  );
}

export function TextInput({
  type = "text",
  placeholder,
  value,
  onChange,
  muted = false,
}: {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  muted?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      className={`mt-2 h-12 w-full rounded-xl border border-[var(--border)] px-4 text-sm text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 ${
        muted ? "bg-[var(--panel-soft)]" : "bg-white"
      }`}
    />
  );
}

export function PasswordInput({
  value,
  onChange,
  placeholder = "",
  hidden = false,
}: {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  hidden?: boolean;
}) {
  const [isHidden, setIsHidden] = useState(hidden);

  return (
    <div className="mt-2 flex h-12 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] transition-all duration-200 focus-within:border-[var(--primary)] focus-within:ring-4 focus-within:ring-[var(--primary)]/10">
      <input
        type={isHidden ? "password" : "text"}
        value={value}
        placeholder={placeholder}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className="h-full flex-1 bg-transparent px-4 text-sm text-[var(--text)] outline-none"
        style={{ letterSpacing: isHidden ? "0.18em" : "normal" }}
      />
      <button
        type="button"
        onClick={() => setIsHidden((current) => !current)}
        className="flex items-center px-4 text-[var(--muted)] transition-colors hover:text-[var(--primary)]"
        aria-label={isHidden ? "Show password" : "Hide password"}
      >
        <EyeIcon hidden={isHidden} />
      </button>
    </div>
  );
}

export function PrimaryButton({
  children,
  href,
  disabled = false,
  type = "button",
  onClick,
}: {
  children: ReactNode;
  href?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  const classes =
    "flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-black text-white transition-all duration-200 shadow-[0_8px_24px_rgba(30,91,255,0.25)]";

  if (href) {
    return (
      <Link
        href={href}
        className={`${classes} bg-[var(--primary)] hover:-translate-y-0.5 hover:bg-[var(--primary-600)] hover:shadow-[0_12px_32px_rgba(30,91,255,0.35)]`}
      >
        {children}
        <ArrowRight />
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${classes} ${
        disabled
          ? "cursor-not-allowed bg-[#BFD4FF] opacity-100"
          : "bg-[var(--primary)] hover:-translate-y-0.5 hover:bg-[var(--primary-600)] hover:shadow-[0_12px_32px_rgba(30,91,255,0.35)]"
      }`}
    >
      {children}
      <ArrowRight />
    </button>
  );
}

export function SecondaryButton({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex h-12 w-full items-center justify-center rounded-xl bg-[#EDF3FF] px-5 text-sm font-black text-[var(--primary)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#E5EEFF]"
    >
      {children}
    </Link>
  );
}
