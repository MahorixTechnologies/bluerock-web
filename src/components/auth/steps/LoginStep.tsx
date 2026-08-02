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
import { WarningIcon } from "../icons";
import { useWebAuth } from "@/components/web/WebAuthProvider";

export function LoginStep() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, status } = useWebAuth();
  const [email, setEmail] = useState("renter@bluerock.com");
  const [password, setPassword] = useState("renter123");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const showUnverified = searchParams.get("unverified") === "1";

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Log in to manage your properties, bookings, and account activities."
      cardWidthClassName="max-w-[470px]"
      footer={
        <p className="mt-7 text-center text-[14px] font-semibold text-[#4b5563]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-black text-[#1E5BFF] transition hover:text-[#1849D6]">
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
            placeholder="renter@bluerock.com"
          />
        </label>

        <div className="mt-4 rounded-2xl border border-[#1E5BFF]/15 bg-[#EDF3FF] px-4 py-4 text-[13px] leading-6 text-[#0F2F99]">
          <p className="font-black text-[#0A2A8C]">✨ Use the same demo accounts as mobile:</p>
          <p className="mt-2 font-mono text-xs"><span className="font-bold">renter@bluerock.com</span> / <span className="font-bold">renter123</span></p>
          <p className="font-mono text-xs"><span className="font-bold">landlord@bluerock.com</span> / <span className="font-bold">landlord123</span></p>
          <p className="font-mono text-xs"><span className="font-bold">admin@bluerock.com</span> / <span className="font-bold">admin123</span></p>
        </div>

        {showUnverified ? (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#ef4444]/15 bg-[#fef2f2] px-4 py-3 text-[#991b1b]">
            <WarningIcon />
            <span className="text-[13px] leading-5 font-semibold">
              Please verify your email address to access your account.
            </span>
          </div>
        ) : null}

        <label className="mt-4 block">
          <InputLabel required>Password</InputLabel>
          <PasswordInput value={password} onChange={setPassword} />
        </label>

        {error ? (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#ef4444]/15 bg-[#fef2f2] px-4 py-3 text-[#991b1b]">
            <WarningIcon />
            <span className="text-[13px] leading-5 font-semibold">{error}</span>
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-4 text-[13px]">
          <label className="flex items-center gap-2 text-[#6b7280] font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="h-4 w-4 rounded border-[var(--border)] text-[#1E5BFF] focus:ring-4 focus:ring-[#1E5BFF]/15"
            />
            Remember Me
          </label>
          <Link href="#" className="font-black text-[#1E5BFF] transition hover:text-[#1849D6]">
            Forgot Password?
          </Link>
        </div>

        <div className="mt-6">
          <PrimaryButton
            onClick={() => {
              setError(null);
              void login({ email: email.trim(), password })
                .then(() => {
                  router.push("/");
                })
                .catch((err) => {
                  setError(err instanceof Error ? err.message : "Login failed.");
                });
            }}
            disabled={
              !email.trim().length || !password.trim().length || status === "loading"
            }
          >
            {status === "loading" ? "Logging in" : "Login"}
          </PrimaryButton>
        </div>
      </StepCard>
    </AuthShell>
  );
}
