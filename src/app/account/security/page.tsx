"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { DashboardRouter } from "@/components/feature/home/DashboardRouter";
import { useWebAuth } from "@/providers/WebAuthProvider";

function initialsFor(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "??";
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

function SidebarNavItem({
  href,
  label,
  glyph,
  active,
  onClick,
}: {
  href?: string;
  label: string;
  glyph: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base ${
          active
            ? "bg-[var(--success)]/15 text-[var(--success)]"
            : "bg-[var(--panel-soft)] text-[var(--muted)]"
        }`}
      >
        {glyph}
      </span>
      <span className="truncate">{label}</span>
    </>
  );
  const classes = `group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
    active
      ? "bg-[rgba(22,163,74,0.10)] text-[var(--success)]"
      : "text-[#374151] hover:bg-[var(--panel-soft)] hover:text-[var(--text)]"
  }`;
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${classes} w-full text-left`}>
        {content}
      </button>
    );
  }
  return (
    <Link href={href ?? "#"} className={classes}>
      {content}
    </Link>
  );
}

function calcStrength(password: string) {
  let segments = 0;
  if (password.length >= 8 && /[a-z]/.test(password)) segments = 1;
  if (segments >= 1 && /\d/.test(password)) segments = 2;
  if (segments >= 2 && /[A-Z]/.test(password)) segments = 3;
  if (segments >= 3 && /[^A-Za-z0-9]/.test(password)) segments = 4;
  return segments;
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  showStrength = false,
  strengthSegments = 0,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  showStrength?: boolean;
  strengthSegments?: number;
}) {
  const [hidden, setHidden] = useState(true);
  return (
    <div>
      <p className="text-sm font-bold text-[#374151]">{label}</p>
      <div className="mt-2 flex h-12 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-3.5 transition-all duration-200 focus-within:border-[var(--success)] focus-within:ring-4 focus-within:ring-[var(--success)]/10">
        <input
          type={hidden ? "password" : "text"}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="h-full flex-1 bg-transparent text-sm text-[var(--text)] outline-none"
        />
        <button
          type="button"
          onClick={() => setHidden((c) => !c)}
          className="flex items-center px-1 text-[var(--muted)] transition-colors hover:text-[var(--success)]"
          aria-label={hidden ? "Show password" : "Hide password"}
        >
          {hidden ? "👁" : "🙈"}
        </button>
      </div>
      {showStrength ? (
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-colors ${
                i < strengthSegments ? "bg-[var(--success)]" : "bg-[rgba(17,24,39,0.10)]"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SecurityContent() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, status, logout, accessToken } = useWebAuth();

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [verifyBanner, setVerifyBanner] = useState(false);

  const strength = calcStrength(newPw);
  const isDemoToken = accessToken?.startsWith("demo.") ?? false;

  const isAccountActive = (href: string) =>
    href === "/account" ? pathname === "/account" : pathname.startsWith(href);

  const requestVerify = () => {
    setVerifyBanner(true);
    setTimeout(() => setVerifyBanner(false), 3500);
  };

  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);

    if (!isDemoToken && !currentPw) {
      setPwError("Current password is required.");
      return;
    }

    if (newPw.length < 8) {
      setPwError("New password must be at least 8 characters long.");
      return;
    }

    const hasUpperOrDigit = /[A-Z]/.test(newPw) || /\d/.test(newPw);
    if (!hasUpperOrDigit) {
      setPwError("New password must contain at least one uppercase letter or digit.");
      return;
    }

    if (newPw !== confirmPw) {
      setPwError("New password and confirmation do not match.");
      return;
    }

    setPwSuccess(true);
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setTimeout(() => setPwSuccess(false), 4000);
  };

  const handleSignOut = async () => {
    await logout();
    router.push("/login");
  };

  void status;

  return (
    <AppShell heading="Security" subheading="Protect your account and manage sign-in methods">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-1">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-3 px-2 py-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--sidebar)] text-[11px] font-black text-white">
                {initialsFor(profile?.name || profile?.email || "")}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[var(--text)]">
                  {profile?.name || profile?.email}
                </p>
                <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                  {profile?.role}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-[var(--border)] bg-white p-3 shadow-[var(--shadow-soft)]">
            <p className="px-3 pb-2 pt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
              Account
            </p>
            <div className="space-y-1">
              <SidebarNavItem
                href="/account"
                label="Profile"
                glyph="◉"
                active={pathname === "/account"}
              />
              <SidebarNavItem
                href="/account/security"
                label="Security"
                glyph="🔒"
                active={isAccountActive("/account/security")}
              />
              <SidebarNavItem href="/bookings" label="Bookings" glyph="📅" />
            </div>
            <p className="px-3 pb-2 pt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
              Session
            </p>
            <div className="space-y-1">
              <SidebarNavItem label="Sign out" glyph="↪" onClick={handleSignOut} />
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--success-soft)] text-xl text-[var(--success)]">
                  ✉
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                    Email address
                  </p>
                  <p className="mt-1 text-lg font-black tracking-tight text-[var(--text)]">
                    Registered email: {profile?.email}
                  </p>
                  <p className="mt-2">
                    {profile?.emailVerified ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--success-soft)] px-3 py-1 text-xs font-bold text-[var(--success)]">
                        Verified ✅
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(234,179,8,0.14)] px-3 py-1 text-xs font-bold text-[#ca8a04]">
                        Not verified yet ⚠
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            {!profile?.emailVerified ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Your email has not been verified. Access to certain features may be limited until
                you confirm your email address.
              </div>
            ) : null}
            {verifyBanner ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                Verification link sent to your email ✉
              </div>
            ) : null}
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={requestVerify}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-bold text-[#374151] transition hover:bg-[var(--panel-soft)] hover:text-[var(--text)]"
              >
                Request verification email
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-soft)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
              Change password
            </p>
            <p className="mt-1 text-lg font-black tracking-tight text-[var(--text)]">
              Update your sign-in password
            </p>

            {isDemoToken ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                Demo mode: no backend current password check.
              </div>
            ) : null}

            {pwError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {pwError}
              </div>
            ) : null}

            {pwSuccess ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                Your password has been updated 🔒
              </div>
            ) : null}

            <form onSubmit={handleSubmitPassword} className="mt-5 space-y-4">
              {!isDemoToken ? (
                <PasswordField
                  label="Current password"
                  value={currentPw}
                  onChange={setCurrentPw}
                  placeholder="Enter current password"
                />
              ) : null}
              <PasswordField
                label="New password"
                value={newPw}
                onChange={setNewPw}
                placeholder="Create new password"
                showStrength
                strengthSegments={strength}
              />
              <PasswordField
                label="Confirm new password"
                value={confirmPw}
                onChange={setConfirmPw}
                placeholder="Re-enter new password"
              />
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--success)] px-6 font-bold text-white shadow-[0_8px_24px_rgba(22,163,74,0.35)] transition hover:-translate-y-0.5 hover:bg-[#15803d] hover:shadow-[0_12px_32px_rgba(22,163,74,0.45)]"
                >
                  Update password
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Active sessions
                </p>
                <p className="mt-1 text-lg font-black tracking-tight text-[var(--text)]">
                  Manage devices signed into your account
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[rgba(234,179,8,0.14)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#ca8a04]">
                Demo build - single session supported
              </span>
            </div>

            <div className="mt-4 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)]">
              <div className="flex items-center gap-4 px-4 py-4">
                <span className="relative flex h-3 w-3 shrink-0 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)]/40 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--success)]" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-[var(--text)]">
                      This device / Current session
                    </p>
                    <span className="inline-flex items-center rounded-full bg-[var(--success-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--success)]">
                      ● current
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    Signed in a few moments ago · Localhost
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                disabled
                className="inline-flex h-10 cursor-not-allowed items-center justify-center rounded-xl bg-[var(--border)] px-4 text-sm font-bold text-[rgba(17,24,39,0.40)]"
              >
                Sign out all other sessions
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-[var(--shadow-soft)]">
            <div className="rounded-xl border border-red-200 bg-red-50/60 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-700">
                Account actions
              </p>
              <p className="mt-1 text-lg font-black tracking-tight text-red-900">
                Danger zone
              </p>
              <p className="mt-1 text-xs text-red-700/80">
                Actions here affect your account permanently and cannot be undone.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-white px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--text)]">Sign out of account</p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    End your current session on this device.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-bold text-white shadow-[0_6px_18px_rgba(220,38,38,0.30)] transition hover:-translate-y-0.5 hover:bg-red-700"
                >
                  Sign out
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-white px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--text)]">Delete account?</p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    To permanently remove your account,{" "}
                    <span className="font-semibold text-[#374151]">contact support</span>.
                  </p>
                </div>
                <button
                  type="button"
                  disabled
                  title="Contact support to request account deletion"
                  className="inline-flex h-10 shrink-0 cursor-not-allowed items-center justify-center rounded-xl bg-[rgba(220,38,38,0.18)] px-4 text-sm font-bold text-[rgba(185,28,28,0.60)]"
                >
                  Request account deletion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function PublicRedirect() {
  const router = useRouter();
  if (typeof window !== "undefined") {
    router.replace("/login");
  }
  return null;
}

export default function AccountSecurityRoute() {
  return (
    <DashboardRouter
      public={<PublicRedirect />}
      renter={<SecurityContent />}
      landlord={<SecurityContent />}
      admin={<SecurityContent />}
    />
  );
}
