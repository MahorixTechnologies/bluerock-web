"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { getRoleContent, maskEmail, type Role } from "../data";
import {
  PrimaryButton,
  SectionLabel,
  StepCard,
  StepHeader,
} from "../AuthElements";
import { AuthShell } from "../AuthShell";

export function VerificationStep({ role }: { role: Role }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const content = getRoleContent(role);
  const [otp, setOtp] = useState(["5", "2", "2", "5"]);

  if (!content) return null;

  const email = searchParams.get("email") ?? "jsmith@gmail.com";
  const canContinue = otp.every((digit) => digit.length === 1);

  return (
    <AuthShell>
      <StepCard>
        <StepHeader
          title={content.title}
          intro={content.intro}
          backHref={`/register/${role}`}
        />

        <div className="mt-7 border-t border-[#eef1f5] pt-5">
          <SectionLabel>VERIFY ACCOUNT</SectionLabel>

          <p className="mt-5 text-[15px] leading-7 text-[#737b8c]">
            We&apos;ll send a verification link to the registered email address{" "}
            <span className="font-extrabold text-[#1f2536]">{maskEmail(email)}</span>
          </p>

          <div className="mt-5 grid grid-cols-4 gap-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                aria-label={`Verification digit ${index + 1}`}
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(event) => {
                  const value = event.target.value.replace(/\D/g, "").slice(0, 1);
                  setOtp((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? value : item,
                    ),
                  );
                }}
                className="h-[60px] w-full rounded-[9px] border border-[#e4e7ee] bg-white text-center text-[24px] font-extrabold text-[#2b5df3] outline-none transition focus:border-[#7a97ff] focus:ring-2 focus:ring-[#dfe7ff]"
              />
            ))}
          </div>

          <div className="mt-5 text-[14px] text-[#8b93a4]">
            Didn&apos;t receive code?{" "}
            <button type="button" className="font-bold text-[#2760ff]">
              Resend Code
            </button>
          </div>
        </div>

        <div className="mt-7">
          <PrimaryButton
            disabled={!canContinue}
            onClick={() =>
              router.push(
                `/register/${role}/password?email=${encodeURIComponent(email)}`,
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
