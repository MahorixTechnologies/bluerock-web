import { apiFetch } from "@/api/client";

function asRecord(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
}

export type RequestEmailVerificationResult = {
  success: boolean;
  /** Only present because this demo backend has no real email delivery. */
  emailVerificationToken?: string;
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
    emailVerificationToken:
      typeof data.emailVerificationToken === "string" ? data.emailVerificationToken : undefined,
  };
}

export async function verifyEmail(token: string): Promise<void> {
  await apiFetch("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export type ForgotPasswordResult = {
  success: boolean;
  /** Only present because this demo backend has no real email delivery. */
  passwordResetToken?: string;
};

export async function forgotPassword(email: string): Promise<ForgotPasswordResult> {
  const raw = await apiFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  const data = asRecord(raw);
  return {
    success: Boolean(data.success ?? true),
    passwordResetToken:
      typeof data.passwordResetToken === "string" ? data.passwordResetToken : undefined,
  };
}

export async function resetPassword(params: {
  token: string;
  newPassword: string;
}): Promise<void> {
  await apiFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(params),
  });
}
