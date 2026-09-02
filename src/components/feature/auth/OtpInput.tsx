"use client";

import { useRef } from "react";

const DIGIT_COUNT = 6;

export function OtpInput({
  value,
  onChange,
  disabled = false,
  autoFocus = true,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: DIGIT_COUNT }, (_, i) => value[i] ?? "");

  function setDigit(index: number, raw: string) {
    const clean = raw.replace(/\D/g, "");
    if (!clean) {
      onChange(value.slice(0, index) + value.slice(index + 1));
      return;
    }

    const chars = clean.split("");
    const next = value.slice(0, index).padEnd(index, " ") + chars.join("");
    onChange(next.slice(0, DIGIT_COUNT).replace(/ /g, ""));

    const target = Math.min(index + chars.length, DIGIT_COUNT - 1);
    inputRefs.current[target]?.focus();
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < DIGIT_COUNT - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, DIGIT_COUNT);
    if (!pasted) return;
    event.preventDefault();
    onChange(pasted);
    const target = Math.min(pasted.length, DIGIT_COUNT - 1);
    inputRefs.current[target]?.focus();
  }

  return (
    <div className="mt-2 flex items-center justify-between gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          onChange={(event) => setDigit(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          className="h-14 w-full max-w-[52px] rounded-xl border border-[var(--border)] bg-white text-center text-xl font-extrabold text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 disabled:opacity-60"
        />
      ))}
    </div>
  );
}
