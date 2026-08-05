"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getRoleContent, type Role } from "../data";
import {
  InputLabel,
  PrimaryButton,
  SecondaryButton,
  SectionLabel,
  StepCard,
  StepHeader,
  TextInput,
} from "../AuthElements";
import { AuthShell } from "../AuthShell";

export function RegistrationDetailsStep({ role }: { role: Role }) {
  const router = useRouter();
  const content = getRoleContent(role);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  if (!content) return null;

  const canContinue =
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    phone.trim() &&
    acceptedTerms;

  return (
    <AuthShell>
      <StepCard>
        <StepHeader
          title={content.title}
          intro={content.intro}
          backHref="/register"
        />

        <div className="mt-7 border-t border-[#eef1f5] pt-5">
          <SectionLabel>PERSONAL INFORMATION</SectionLabel>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <label className="block">
              <InputLabel required>First Name</InputLabel>
              <TextInput value={firstName} onChange={setFirstName} />
            </label>

            <label className="block">
              <InputLabel required>Last Name</InputLabel>
              <TextInput value={lastName} onChange={setLastName} />
            </label>
          </div>

          <label className="mt-4 block">
            <InputLabel required>Email Address</InputLabel>
            <TextInput type="email" value={email} onChange={setEmail} muted />
          </label>

          <label className="mt-4 block">
            <InputLabel required>Phone Number</InputLabel>
            <div className="mt-2 flex h-11 overflow-hidden rounded-[9px] border border-[#e4e7ee] bg-[#f7f8fb]">
              <span className="flex items-center border-r border-[#e4e7ee] px-3 text-[20px] font-medium text-[#7a7f8e]">
                +234
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="h-full flex-1 bg-transparent px-3 text-[14px] text-[#1c2438] outline-none"
              />
            </div>
          </label>

          <label className="mt-5 flex items-start gap-3">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[#d5d8e2] text-[#2b5df3] focus:ring-[#c9d7ff]"
            />
            <span className="text-[12px] leading-5 text-[#9aa2b3]">
              I have read and agree to the{" "}
              <Link href="#" className="font-bold text-[#2760ff]">
                Terms &amp; Conditions
              </Link>{" "}
              and{" "}
              <Link href="#" className="font-bold text-[#2760ff]">
                Privacy Policy.
              </Link>
            </span>
          </label>
        </div>

        <div className="mt-6 space-y-4">
          <PrimaryButton
            disabled={!canContinue}
            onClick={() =>
              router.push(
                `/register/${role}/verify?email=${encodeURIComponent(email.trim())}`,
              )
            }
          >
            Continue
          </PrimaryButton>

          <SecondaryButton href="/register">Change Registration Type</SecondaryButton>
        </div>
      </StepCard>
    </AuthShell>
  );
}
