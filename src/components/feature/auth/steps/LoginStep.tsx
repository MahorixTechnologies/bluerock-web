"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { AuthShell } from "../AuthShell";
import {
  InputLabel,
  PasswordInput,
  PrimaryButton,
  StepCard,
  TextInput,
} from "../AuthElements";
import { OtpInput } from "../OtpInput";
import { WarningIcon } from "../icons";
import { useWebAuth } from "@/providers/WebAuthProvider";
import { requestEmailVerification, verifyEmail } from "@/api/auth";

export function LoginStep() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, completeVerification, status } = useWebAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const showUnverified = searchParams.get("unverified") === "1";

  const [needsVerification, setNeedsVerification] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);

  async function sendVerificationCode() {
    setSendingCode(true);
    setError(null);
    try {
      await requestEmailVerification(email.trim());
      setNeedsVerification(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send a verification code.");
    } finally {
      setSendingCode(false);
    }
  }

  async function confirmVerificationCode() {
    setVerifying(true);
    setError(null);
    try {
      const result = await verifyEmail({ email: email.trim(), code: otp.trim() });
      completeVerification(result.accessToken, {
        email: result.user.email,
        name: result.user.name ?? "",
        phone: result.user.phone ?? "",
        emailVerified: result.user.emailVerified,
        role: result.user.role,
      });
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "That code didn't work. Double check your email.",
      );
    } finally {
      setVerifying(false);
    }
  }

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Log in to manage your properties, bookings, and account activities."
      cardWidthClassName="max-w-[470px]"
      footer={
        <p className="mt-7 text-center text-[14px] font-semibold text-[#4b5563]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-black text-[var(--primary)] transition hover:text-[var(--primary-600)]">
            Register as Homeowner
          </Link>
        </p>
      }
    >
      <StepCard className="px-4 py-5">
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

        {showUnverified && !needsVerification ? (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-[var(--danger)]/15 bg-[var(--danger-bg)] px-4 py-3 text-[#991b1b]">
            <WarningIcon />
            <span className="text-[13px] leading-5 font-semibold">
              Please verify your email address to access your account.
            </span>
          </div>
        ) : null}

        {!needsVerification ? (
          <label className="mt-4 block">
            <InputLabel required>Password</InputLabel>
            <PasswordInput value={password} onChange={setPassword} />
          </label>
        ) : (
          <div className="mt-4 rounded-xl border border-[var(--primary)]/15 bg-[#EDF3FF] px-4 py-3 text-[13px] leading-6 text-[#0F2F99]">
            <p className="font-black text-[var(--sidebar)]">
              Your email isn&apos;t verified yet. We&apos;ve sent a 6-digit code to {email.trim()}.
            </p>
            <div className="mt-3">
              <OtpInput value={otp} onChange={setOtp} disabled={verifying} />
            </div>
            <button
              type="button"
              onClick={() => void sendVerificationCode()}
              disabled={sendingCode}
              className="mt-3 font-bold text-[#2760ff] disabled:opacity-60"
            >
              {sendingCode ? "Sending…" : "Resend code"}
            </button>
          </div>
        )}

        {error ? (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-[var(--danger)]/15 bg-[var(--danger-bg)] px-4 py-3 text-[#991b1b]">
            <WarningIcon />
            <span className="text-[13px] leading-5 font-semibold">{error}</span>
          </div>
        ) : null}

        {!needsVerification ? (
          <div className="mt-4 flex items-center justify-between gap-4 text-[13px]">
            <label className="flex items-center gap-2 text-[var(--muted)] font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/15"
              />
              Remember Me
            </label>
            <Link
              href="/forgot-password"
              className="font-black text-[var(--primary)] transition hover:text-[var(--primary-600)]"
            >
              Forgot Password?
            </Link>
          </div>
        ) : null}

        <div className="mt-6">
          {needsVerification ? (
            <PrimaryButton
              onClick={() => void confirmVerificationCode()}
              disabled={otp.trim().length !== 6 || verifying}
            >
              {verifying ? "Verifying…" : "Verify & Continue"}
            </PrimaryButton>
          ) : (
            <PrimaryButton
              onClick={() => {
                setError(null);
                void login({ email: email.trim(), password })
                  .then(() => {
                    router.push("/");
                  })
                  .catch((err) => {
                    if (err instanceof Error && err.message === "email not verified") {
                      void sendVerificationCode();
                      return;
                    }
                    setError(err instanceof Error ? err.message : "Login failed.");
                  });
              }}
              disabled={
                !email.trim().length || !password.trim().length || status === "loading"
              }
            >
              {status === "loading" ? "Logging in" : "Login"}
            </PrimaryButton>
          )}
        </div>
      </StepCard>
    </AuthShell>
  );
}
