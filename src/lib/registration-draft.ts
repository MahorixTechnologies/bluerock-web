const KEY = "bluerock.web.registrationDraft.v1";

export type RegistrationDraft = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export function saveRegistrationDraft(draft: RegistrationDraft) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // ignore storage errors (private browsing etc.)
  }
}

export function readRegistrationDraft(): RegistrationDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RegistrationDraft;
  } catch {
    return null;
  }
}

export function clearRegistrationDraft() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // ignore storage errors
  }
}
