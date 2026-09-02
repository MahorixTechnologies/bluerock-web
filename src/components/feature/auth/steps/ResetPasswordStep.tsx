"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthShell } from "../AuthShell";
import {
  InputLabel,
  PasswordInput,
  PrimaryButton,
  StepCard,
  TextInput,
} from "../AuthElements";
import { OtpInput } from "../OtpInput";
import { CheckBadge, WarningIcon } from "../icons";
import { resetPassword } from "@/api/auth";

const passwordRules = [
  { label: "Minimum of 8 characters", test: (value: string) => value.length >= 8 },
  { label: "At least one uppercase letter (A-Z)", test: (value: string) => /[A-Z]/.test(value) },
  { label: "At least one lowercase letter (a-z)", test: (value: string) => /[a-z]/.test(value) },
  { label: "At least one number (0-9)", test: (value: string) => /[0-9]/.test(value) },
];

export function ResetPasswordStep() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const checks = useMemo(
    () => passwordRules.map((rule) => ({ ...rule, passed: rule.test(password) })),
    [password],
  );
  const canSubmit =
    email.trim().length > 0 &&
    code.trim().length === 6 &&
    checks.every((rule) => rule.passed) &&
    confirmPassword === password;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await resetPassword({ email: email.trim(), code: code.trim(), newPassword: password });
      setDone(true);
    } catch (err) {
      if (err instanceof Error && err.message === "API_URL not configured") {
        setError(
          "Password reset needs a connected backend (NEXT_PUBLIC_API_URL). This demo environment can't reset passwords right now.",
        );
      } else {
        setError(err instanceof Error ? err.message : "Reset failed. The code may be invalid or expired.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Enter the 6-digit code from your email and choose a new password."
      cardWidthClassName="max-w-[470px]"
    >
      <StepCard className="px-4 py-5">
        {done ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--success)]/20 bg-[var(--success-soft)] px-4 py-4 text-sm leading-6 text-[#15803d]">
              <p className="font-black">Password updated</p>
              <p className="mt-1">You can now log in with your new password.</p>
            </div>
            <PrimaryButton onClick={() => router.push("/login")}>Go to login</PrimaryButton>
          </div>
        ) : (
          <>
            <label className="block">
              <InputLabel required>Email address</InputLabel>
              <TextInput
                type="email"
                value={email}
                onChange={setEmail}
                muted
                placeholder="you@example.com"
              />
            </label>

            <div className="mt-4">
              <InputLabel required>6-digit reset code</InputLabel>
              <OtpInput value={code} onChange={setCode} disabled={submitting} />
            </div>

            <label className="mt-4 block">
              <InputLabel required>New password</InputLabel>
              <PasswordInput value={password} onChange={setPassword} />
            </label>

            <div className="mt-4 space-y-3">
              {checks.map((rule) => (
                <div key={rule.label} className="flex items-center gap-3">
                  <CheckBadge />
                  <span
                    className={`text-[13px] ${rule.passed ? "text-[#6d90ff]" : "text-[#9aa2b3]"}`}
                  >
                    {rule.label}
                  </span>
                </div>
              ))}
            </div>

            <label className="mt-4 block">
              <InputLabel required>Confirm new password</InputLabel>
              <PasswordInput value={confirmPassword} onChange={setConfirmPassword} hidden />
            </label>

            {error ? (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-[var(--danger)]/15 bg-[var(--danger-bg)] px-4 py-3 text-[#991b1b]">
                <WarningIcon />
                <span className="text-[13px] leading-5 font-semibold">{error}</span>
              </div>
            ) : null}

            <div className="mt-6">
              <PrimaryButton onClick={() => void handleSubmit()} disabled={!canSubmit || submitting}>
                {submitting ? "Updating…" : "Update password"}
              </PrimaryButton>
            </div>
          </>
        )}
      </StepCard>
    </AuthShell>
  );
}
