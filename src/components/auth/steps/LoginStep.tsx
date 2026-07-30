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
        <p className="mt-7 text-center text-[14px] font-medium text-[#555b6b]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-[#2760ff]">
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

        <div className="mt-4 rounded-[12px] border border-[#dfe6f7] bg-[#f7f8fc] px-4 py-3 text-[13px] text-[#667089]">
          <p className="font-bold text-[#0f2b71]">Use the same demo accounts as mobile:</p>
          <p className="mt-1">`renter@bluerock.com` / `renter123`</p>
          <p>`landlord@bluerock.com` / `landlord123`</p>
          <p>`admin@bluerock.com` / `admin123`</p>
        </div>

        {showUnverified ? (
          <div className="mt-4 flex items-start gap-3 rounded-[9px] bg-[#fde1e1] px-3 py-3 text-[#ff3d3d]">
            <WarningIcon />
            <span className="text-[13px] leading-5">
              Please verify your email address to access your account.
            </span>
          </div>
        ) : null}

        <label className="mt-4 block">
          <InputLabel required>Password</InputLabel>
          <PasswordInput value={password} onChange={setPassword} />
        </label>

        {error ? (
          <div className="mt-4 flex items-start gap-3 rounded-[9px] bg-[#fde1e1] px-3 py-3 text-[#ff3d3d]">
            <WarningIcon />
            <span className="text-[13px] leading-5">{error}</span>
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-4 text-[13px]">
          <label className="flex items-center gap-2 text-[#9aa2b3]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="h-4 w-4 rounded border-[#d5d8e2] text-[#2b5df3] focus:ring-[#c9d7ff]"
            />
            Remember Me
          </label>
          <Link href="#" className="font-bold text-[#2760ff]">
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
