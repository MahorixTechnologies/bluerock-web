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

export type RequestSignupCodeResult = {
  success: boolean;
  /** Only present outside production, when no email server is wired up. */
  signupCode?: string;
};

/**
 * Proves ownership of an email address BEFORE the account is created —
 * the registration order is details -> verify -> password, so there's no
 * User row yet to attach a Token to (see backend AuthService.sendSignupCode).
 */
export async function requestSignupCode(email: string): Promise<RequestSignupCodeResult> {
  const raw = await apiFetch("/auth/register/send-code", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  const data = asRecord(raw);
  return {
    success: Boolean(data.success ?? true),
    signupCode: typeof data.signupCode === "string" ? data.signupCode : undefined,
  };
}

export async function verifySignupCode(params: { email: string; code: string }): Promise<void> {
  await apiFetch("/auth/register/verify-code", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export type VerifyEmailResult = {
  accessToken: string;
  user: {
    email: string;
    role: "ADMIN" | "LANDLORD" | "RENTER";
    name: string | null;
    phone: string | null;
    emailVerified: boolean;
  };
};

/**
 * A successful verification also signs the user in — the backend issues an
 * accessToken here since register() deliberately never does (see
 * WebAuthProvider.completeVerification).
 */
export async function verifyEmail(params: {
  email: string;
  code: string;
}): Promise<VerifyEmailResult> {
  const raw = await apiFetch("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(params),
  });
  const data = asRecord(raw);
  const user = asRecord(data.user);
  if (typeof data.accessToken !== "string" || !data.accessToken) {
    throw new Error("Verification response was missing an access token.");
  }
  return {
    accessToken: data.accessToken,
    user: {
      email: typeof user.email === "string" ? user.email : params.email,
      role:
        user.role === "ADMIN" || user.role === "LANDLORD" || user.role === "RENTER"
          ? user.role
          : "RENTER",
      name: typeof user.name === "string" ? user.name : null,
      phone: typeof user.phone === "string" ? user.phone : null,
      emailVerified: Boolean(user.emailVerified),
    },
  };
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
