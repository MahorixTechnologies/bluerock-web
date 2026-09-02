import { apiFetch } from "@/api/client";

function asRecord(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
}

export type RequestEmailVerificationResult = {
  success: boolean;
  /** Only present outside production, when no email server is wired up. */
  emailVerificationCode?: string;
};

export async function requestEmailVerification(
  email: string,
): Promise<RequestEmailVerificationResult> {
  const raw = await apiFetch("/auth/request-email-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  const data = asRecord(raw);
  return {
    success: Boolean(data.success ?? true),
    emailVerificationCode:
      typeof data.emailVerificationCode === "string" ? data.emailVerificationCode : undefined,
  };
}

export async function verifyEmail(params: { email: string; code: string }): Promise<void> {
  await apiFetch("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export type ForgotPasswordResult = {
  success: boolean;
  /** Only present outside production, when no email server is wired up. */
  passwordResetCode?: string;
};

export async function forgotPassword(email: string): Promise<ForgotPasswordResult> {
  const raw = await apiFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  const data = asRecord(raw);
  return {
    success: Boolean(data.success ?? true),
    passwordResetCode:
      typeof data.passwordResetCode === "string" ? data.passwordResetCode : undefined,
  };
}

export async function resetPassword(params: {
  email: string;
  code: string;
  newPassword: string;
}): Promise<void> {
  await apiFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(params),
  });
}
