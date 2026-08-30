"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AuthShell } from "../AuthShell";
import { InputLabel, PrimaryButton, StepCard, TextInput } from "../AuthElements";
import { WarningIcon } from "../icons";
import { forgotPassword } from "@/api/auth";

export function ForgotPasswordStep() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [demoToken, setDemoToken] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const result = await forgotPassword(email.trim());
      setSent(true);
      setDemoToken(result.passwordResetToken ?? null);
    } catch (err) {
      if (err instanceof Error && err.message === "API_URL not configured") {
        setError(
          "Password reset needs a connected backend (NEXT_PUBLIC_API_URL). This demo environment can't send resets right now.",
        );
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we'll help you reset it."
      cardWidthClassName="max-w-[470px]"
    >
      <StepCard className="px-4 py-5">
        {sent ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--success)]/20 bg-[var(--success-soft)] px-4 py-4 text-sm leading-6 text-[#15803d]">
              <p className="font-black">Check your email</p>
              <p className="mt-1">
                If an account exists for <span className="font-bold">{email.trim()}</span>, a
                reset link has been sent.
              </p>
            </div>

            {demoToken ? (
              <div className="rounded-2xl border border-[var(--primary)]/15 bg-[#EDF3FF] px-4 py-4 text-[13px] leading-6 text-[#0F2F99]">
                <p className="font-black text-[var(--sidebar)]">
                  ✨ Demo mode: no email server is wired up, so here&apos;s your reset token
                </p>
                <p className="mt-2 break-all font-mono text-xs">{demoToken}</p>
              </div>
            ) : null}

            <PrimaryButton
              onClick={() =>
                router.push(
                  `/reset-password${demoToken ? `?token=${encodeURIComponent(demoToken)}` : ""}`,
                )
              }
            >
              Continue to reset password
            </PrimaryButton>
          </div>
        ) : (
          <>
            <label className="block">
              <InputLabel required>Email Address</InputLabel>
              <TextInput
                type="email"
                value={email}
                onChange={setEmail}
                muted
                placeholder="you@example.com"
              />
            </label>

            {error ? (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-[var(--danger)]/15 bg-[var(--danger-bg)] px-4 py-3 text-[#991b1b]">
                <WarningIcon />
                <span className="text-[13px] leading-5 font-semibold">{error}</span>
              </div>
            ) : null}

            <div className="mt-6">
              <PrimaryButton
                onClick={() => void handleSubmit()}
                disabled={!email.trim().length || submitting}
              >
                {submitting ? "Sending…" : "Send reset link"}
              </PrimaryButton>
            </div>
          </>
        )}
      </StepCard>
    </AuthShell>
  );
}
