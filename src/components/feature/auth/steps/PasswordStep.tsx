"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { getRoleContent, type Role } from "../data";
import {
  InputLabel,
  PasswordInput,
  PrimaryButton,
  SectionLabel,
  StepCard,
  StepHeader,
} from "../AuthElements";
import { AuthShell } from "../AuthShell";
import { CheckBadge, WarningIcon } from "../icons";
import { useWebAuth } from "@/providers/WebAuthProvider";

const passwordRules = [
  { label: "Minimum of 8 characters", test: (value: string) => value.length >= 8 },
  { label: "At least one uppercase letter (A-Z)", test: (value: string) => /[A-Z]/.test(value) },
  { label: "At least one lowercase letter (a-z)", test: (value: string) => /[a-z]/.test(value) },
  { label: "At least one number (0-9)", test: (value: string) => /[0-9]/.test(value) },
  {
    label: "At least one special character (!@#$%^&*)",
    test: (value: string) => /[!@#$%^&*]/.test(value),
  },
];

export function PasswordStep({ role }: { role: Role }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const content = getRoleContent(role);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register } = useWebAuth();
  const email = searchParams.get("email") ?? "";
  const firstName = searchParams.get("firstName") ?? "";
  const lastName = searchParams.get("lastName") ?? "";
  const phone = searchParams.get("phone") ?? "";
  const checks = useMemo(
    () => passwordRules.map((rule) => ({ ...rule, passed: rule.test(password) })),
    [password],
  );
  const canContinue =
    checks.every((rule) => rule.passed) && confirmPassword === password && !submitting;

  if (!content) return null;

  async function handleContinue() {
    setSubmitting(true);
    setError(null);
    try {
      await register({
        name: `${firstName} ${lastName}`.trim(),
        email,
        password,
        phone: phone ? `+234${phone}` : undefined,
        role: role === "homeowner" ? "LANDLORD" : "RENTER",
      });
      router.push(`/register/${role}/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <StepCard>
        <StepHeader
          title={content.title}
          intro={content.intro}
          backHref={`/register/${role}`}
        />

        <div className="mt-7 border-t border-[#eef1f5] pt-5">
          <SectionLabel>ACCOUNT INFORMATION</SectionLabel>

          <label className="mt-5 block">
            <InputLabel required>Password</InputLabel>
            <PasswordInput value={password} onChange={setPassword} />
          </label>

          <div className="mt-4 space-y-3">
            {checks.map((rule) => (
              <div key={rule.label} className="flex items-center gap-3">
                <CheckBadge />
                <span
                  className={`text-[13px] ${
                    rule.passed ? "text-[#6d90ff]" : "text-[#9aa2b3]"
                  }`}
                >
                  {rule.label}
                </span>
              </div>
            ))}
          </div>

          <label className="mt-5 block">
            <InputLabel required>Confirm Password</InputLabel>
            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              hidden
            />
          </label>

          {error ? (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-[var(--danger)]/15 bg-[var(--danger-bg)] px-4 py-3 text-[#991b1b]">
              <WarningIcon />
              <span className="text-[13px] leading-5 font-semibold">{error}</span>
            </div>
          ) : null}
        </div>

        <div className="mt-7">
          <PrimaryButton disabled={!canContinue} onClick={() => void handleContinue()}>
            {submitting ? "Creating account…" : "Continue"}
          </PrimaryButton>
        </div>
      </StepCard>
    </AuthShell>
  );
}
