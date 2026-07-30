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
      className={`rounded-[12px] border border-[#edf0f6] bg-white px-4 py-4 shadow-[0_6px_20px_rgba(15,23,42,0.04)] ${className}`}
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
        <h2 className="text-[18px] font-extrabold text-[#2760ff]">{title}</h2>
        <p className="mt-2 max-w-[285px] text-[14px] leading-6 text-[#7c8495]">{intro}</p>
      </div>
      <Link
        href={backHref}
        className="mt-1 shrink-0 text-[#6d90ff] transition-colors hover:text-[#2b5df3]"
        aria-label="Go back"
      >
        <BackIcon />
      </Link>
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[12px] font-extrabold tracking-[0.02em] text-[#c0c5d0]">{children}</div>
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
    <span className="text-[13px] font-bold text-[#4b5365]">
      {children}
      {required ? <span className="text-[#ff6767]"> *</span> : null}
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
      className={`mt-2 h-11 w-full rounded-[9px] border border-[#e4e7ee] px-3 text-[14px] text-[#1c2438] outline-none transition focus:border-[#7a97ff] focus:ring-2 focus:ring-[#dfe7ff] ${
        muted ? "bg-[#f7f8fb]" : "bg-white"
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
    <div className="mt-2 flex h-11 overflow-hidden rounded-[9px] border border-[#e4e7ee] bg-[#f7f8fb]">
      <input
        type={isHidden ? "password" : "text"}
        value={value}
        placeholder={placeholder}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className="h-full flex-1 bg-transparent px-3 text-[14px] tracking-[0.24em] text-[#1c2438] outline-none"
      />
      <button
        type="button"
        onClick={() => setIsHidden((current) => !current)}
        className="flex items-center px-3 text-[#9aa2b3]"
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
    "flex h-11 w-full items-center justify-center gap-2 rounded-[11px] px-4 text-[15px] font-[700] text-white transition shadow-[0_12px_24px_rgba(43,93,243,0.25)]";

  if (href) {
    return (
      <Link
        href={href}
        className={`${classes} bg-[#2b5df3] hover:-translate-y-0.5`}
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
          ? "cursor-not-allowed bg-[#87a7f6] opacity-100"
          : "bg-[#2b5df3] hover:-translate-y-0.5"
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
      className="flex h-11 w-full items-center justify-center rounded-[11px] bg-[#e6ecfb] px-4 text-[15px] font-bold text-[#2760ff] transition hover:bg-[#dbe5fb]"
    >
      {children}
    </Link>
  );
}
