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
import { CheckBadge } from "../icons";

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
  const readyState = searchParams.get("ready") === "1";
  const [password, setPassword] = useState(readyState ? "Password1!" : "********");
  const [confirmPassword, setConfirmPassword] = useState(
    readyState ? "Password1!" : "********",
  );
  const email = searchParams.get("email") ?? "jsmith@gmail.com";
  const checks = useMemo(
    () => passwordRules.map((rule) => ({ ...rule, passed: rule.test(password) })),
    [password],
  );
  const canContinue = checks.every((rule) => rule.passed) && confirmPassword === password;

  if (!content) return null;

  return (
    <AuthShell>
      <StepCard>
        <StepHeader
          title={content.title}
          intro={content.intro}
          backHref={`/register/${role}/verify?email=${encodeURIComponent(email)}`}
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
        </div>

        <div className="mt-7">
          <PrimaryButton
            disabled={!canContinue}
            onClick={() =>
              router.push(
                `/register/${role}/success?email=${encodeURIComponent(email)}`,
              )
            }
          >
            Continue
          </PrimaryButton>
        </div>
      </StepCard>
    </AuthShell>
  );
}
