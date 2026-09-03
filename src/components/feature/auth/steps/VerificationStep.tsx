"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getRoleContent, maskEmail, type Role } from "../data";
import {
  InputLabel,
  PrimaryButton,
  SectionLabel,
  StepCard,
  StepHeader,
} from "../AuthElements";
import { OtpInput } from "../OtpInput";
import { WarningIcon } from "../icons";
import { AuthShell } from "../AuthShell";
import { requestSignupCode, verifySignupCode } from "@/api/auth";

export function VerificationStep({ role }: { role: Role }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const content = getRoleContent(role);
  const email = searchParams.get("email") ?? "jsmith@gmail.com";

  const [code, setCode] = useState("");
  const [demoToken, setDemoToken] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestNotice, setRequestNotice] = useState<string | null>(null);
  const requestedRef = useRef(false);

  async function sendCode() {
    setRequesting(true);
    setError(null);
    setRequestNotice(null);
    try {
      const result = await requestSignupCode(email);
      if (result.signupCode) {
        setDemoToken(result.signupCode);
        setCode(result.signupCode);
      } else {
        setRequestNotice("If this email isn't already registered, a verification code was sent.");
      }
    } catch (err) {
      if (err instanceof Error && err.message === "API_URL not configured") {
        setError(
          "Email verification needs a connected backend (NEXT_PUBLIC_API_URL). This demo environment can't send codes right now.",
        );
      } else {
        setError(err instanceof Error ? err.message : "Could not send a verification code.");
      }
    } finally {
      setRequesting(false);
    }
  }

  // No account exists yet at this point in the flow — details -> verify ->
  // password, in that order — so this is the only place a code gets sent
  // for a given signup; auto-fire it once on arrival.
  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;
    void sendCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!content) return null;

  const canContinue = code.trim().length === 6 && !verifying;

  async function handleContinue() {
    setVerifying(true);
    setError(null);
    try {
      await verifySignupCode({ email, code: code.trim() });
      router.push(`/register/${role}/password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "That code didn't work. Double check the link from your email.",
      );
    } finally {
      setVerifying(false);
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
          <SectionLabel>VERIFY EMAIL</SectionLabel>

          <p className="mt-5 text-[15px] leading-7 text-[#737b8c]">
            We&apos;ve sent a verification code to{" "}
            <span className="font-extrabold text-[#1f2536]">{maskEmail(email)}</span>. Enter it
            below to continue.
          </p>

          {demoToken ? (
            <div className="mt-4 rounded-xl border border-[var(--primary)]/15 bg-[#EDF3FF] px-4 py-3 text-[13px] leading-6 text-[#0F2F99]">
              <p className="font-black text-[var(--sidebar)]">
                ✨ Demo mode: no email server is wired up, so we&apos;ve pre-filled the code below
              </p>
            </div>
          ) : null}

          {requestNotice ? (
            <p className="mt-4 text-[13px] font-semibold text-[#6d90ff]">{requestNotice}</p>
          ) : null}

          <div className="mt-5">
            <InputLabel required>6-digit verification code</InputLabel>
            <OtpInput value={code} onChange={setCode} disabled={verifying} />
          </div>

          {error ? (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-[var(--danger)]/15 bg-[var(--danger-bg)] px-4 py-3 text-[#991b1b]">
              <WarningIcon />
              <span className="text-[13px] leading-5 font-semibold">{error}</span>
            </div>
          ) : null}

          <div className="mt-5 text-[14px] text-[#8b93a4]">
            Didn&apos;t receive a code?{" "}
            <button
              type="button"
              onClick={() => void sendCode()}
              disabled={requesting}
              className="font-bold text-[#2760ff] disabled:opacity-60"
            >
              {requesting ? "Sending…" : "Resend Code"}
            </button>
          </div>

          <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3 text-[12px] leading-5 text-[#8b93a4]">
            📱 Heads up — phone number verification isn&apos;t live yet. Only your email is
            verified for now; your phone number is stored but unverified.
          </div>
        </div>

        <div className="mt-7">
          <PrimaryButton disabled={!canContinue} onClick={() => void handleContinue()}>
            {verifying ? "Verifying…" : "Continue"}
          </PrimaryButton>
        </div>
      </StepCard>
    </AuthShell>
  );
}
