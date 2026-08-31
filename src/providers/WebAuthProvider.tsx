"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { API_URL } from "@/api/config";
import { onUnauthorized } from "@/api/client";
import { fetchMe } from "@/api/users";
import type { WebUserProfile } from "@/types/models";

export { API_URL };

type AuthStatus = "loading" | "signedOut" | "signedIn";

type LoginParams = {
  email: string;
  password: string;
};

type RegisterParams = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "RENTER" | "LANDLORD";
};

type StoredSession = {
  profile: WebUserProfile;
  accessToken: string;
};

type WebAuthContextValue = {
  status: AuthStatus;
  profile: WebUserProfile | null;
  accessToken: string | null;
  login: (params: LoginParams) => Promise<void>;
  register: (params: RegisterParams) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: (next: Partial<WebUserProfile>) => void;
};

type DemoAccount = {
  email: string;
  password: string;
  profile: WebUserProfile;
};

const SESSION_KEY = "bluerock.web.session.v2";

const demoAccounts: DemoAccount[] = [
  {
    email: "admin@bluerock.com",
    password: "admin123",
    profile: {
      email: "admin@bluerock.com",
      name: "BlueRock Admin",
      phone: "",
      emailVerified: true,
      role: "ADMIN",
    },
  },
  {
    email: "landlord@bluerock.com",
    password: "landlord123",
    profile: {
      email: "landlord@bluerock.com",
      name: "BlueRock Landlord",
      phone: "+2348123456789",
      emailVerified: true,
      role: "LANDLORD",
    },
  },
  {
    email: "renter@bluerock.com",
    password: "renter123",
    profile: {
      email: "renter@bluerock.com",
      name: "BlueRock Renter",
      phone: "",
      emailVerified: true,
      role: "RENTER",
    },
  },
];

const WebAuthContext = createContext<WebAuthContextValue | null>(null);

function readStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed?.profile || typeof parsed?.accessToken !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

async function loginWithApi({
  email,
  password,
}: LoginParams): Promise<{ profile: WebUserProfile; accessToken: string }> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const envelope = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  const payload = (envelope?.success === true ? envelope.data : envelope) as
    | Record<string, unknown>
    | undefined;

  if (!response.ok) {
    const message = typeof payload?.message === "string" ? payload.message : undefined;
    throw new Error(message ?? `Login failed (${response.status})`);
  }
  if (!payload || typeof payload !== "object") {
    throw new Error("Login response was empty.");
  }

  const accessToken = typeof payload.accessToken === "string" ? payload.accessToken : "";
  const user = payload.user;
  if (!accessToken || !user || typeof user !== "object" || !("email" in user)) {
    throw new Error("Login response was missing an account.");
  }
  const data = user as Record<string, unknown>;

  return {
    accessToken,
    profile: {
      email: String(data.email),
      name: typeof data.name === "string" ? data.name : "",
      phone: typeof data.phone === "string" ? data.phone : "",
      emailVerified: Boolean(data.emailVerified),
      role:
        data.role === "ADMIN" || data.role === "LANDLORD" || data.role === "RENTER"
          ? data.role
          : "RENTER",
    },
  };
}

async function registerWithApi(
  params: RegisterParams,
): Promise<{ profile: WebUserProfile; accessToken: string }> {
  if (!API_URL) {
    throw new Error("API_URL not configured");
  }

  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const envelope = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  const payload = (envelope?.success === true ? envelope.data : envelope) as
    | Record<string, unknown>
    | undefined;

  if (!response.ok) {
    const message = typeof payload?.message === "string" ? payload.message : undefined;
    throw new Error(message ?? `Registration failed (${response.status})`);
  }
  if (!payload || typeof payload !== "object") {
    throw new Error("Registration response was empty.");
  }

  const accessToken = typeof payload.accessToken === "string" ? payload.accessToken : "";
  const user = payload.user;
  if (!accessToken || !user || typeof user !== "object" || !("email" in user)) {
    throw new Error("Registration response was missing an account.");
  }
  const data = user as Record<string, unknown>;

  return {
    accessToken,
    profile: {
      email: String(data.email),
      name: typeof data.name === "string" ? data.name : params.name,
      phone: typeof data.phone === "string" ? data.phone : params.phone ?? "",
      emailVerified: Boolean(data.emailVerified),
      role:
        data.role === "ADMIN" || data.role === "LANDLORD" || data.role === "RENTER"
          ? data.role
          : params.role,
    },
  };
}

function loginWithDemo({ email, password }: LoginParams) {
  const normalized = email.trim().toLowerCase();
  const match = demoAccounts.find(
    (account) => account.email.toLowerCase() === normalized && account.password === password,
  );
  return match?.profile ?? null;
}

export function WebAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(() => readStoredSession());
  const [status, setStatus] = useState<AuthStatus>(() =>
    readStoredSession() ? "signedIn" : "signedOut",
  );

  useEffect(() => {
    if (session) {
      try {
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } catch {
        // ignore storage errors (private browsing etc.)
      }
    }
  }, [session]);

  useEffect(() => {
    return onUnauthorized(() => {
      try {
        window.localStorage.removeItem(SESSION_KEY);
      } catch {
        // ignore
      }
      setSession(null);
      setStatus("signedOut");
    });
  }, []);

  // Confirm a restored (real, non-demo) session's token is still valid and
  // the user is still ACTIVE — a 401 here flows through the handler above
  // and signs the user out. Demo sessions have no backend to check against
  // and are skipped so they never get invalidated by a real API's 401.
  useEffect(() => {
    if (!API_URL || !session || session.accessToken.startsWith("demo.")) return;
    let cancelled = false;
    void (async () => {
      const fresh = await fetchMe(session.accessToken);
      if (cancelled || !fresh) return;
      setSession((prev) => (prev ? { ...prev, profile: fresh } : prev));
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  const value = useMemo<WebAuthContextValue>(() => {
    return {
      status,
      profile: session?.profile ?? null,
      accessToken: session?.accessToken ?? null,
      login: async ({ email, password }) => {
        setStatus("loading");

        try {
          let next: StoredSession;
          if (API_URL) {
            const result = await loginWithApi({ email, password });
            next = { profile: result.profile, accessToken: result.accessToken };
          } else {
            const demoProfile = loginWithDemo({ email, password });
            if (!demoProfile) {
              throw new Error("Invalid credentials. Use the seeded mobile demo accounts.");
            }
            next = {
              profile: demoProfile,
              accessToken: `demo.${demoProfile.role}.${btoa(demoProfile.email)}`,
            };
          }
          setSession(next);
          setStatus("signedIn");
        } catch (err) {
          setStatus("signedOut");
          throw err;
        }
      },
      register: async (params) => {
        setStatus("loading");

        try {
          let next: StoredSession;
          if (API_URL) {
            const result = await registerWithApi(params);
            next = { profile: result.profile, accessToken: result.accessToken };
          } else {
            next = {
              profile: {
                email: params.email.trim().toLowerCase(),
                name: params.name,
                phone: params.phone ?? "",
                emailVerified: false,
                role: params.role,
              },
              accessToken: `dev.${Date.now()}`,
            };
          }
          setSession(next);
          setStatus("signedIn");
        } catch (err) {
          setStatus("signedOut");
          throw err;
        }
      },
      logout: async () => {
        try {
          window.localStorage.removeItem(SESSION_KEY);
        } catch {
          // ignore
        }
        setSession(null);
        setStatus("signedOut");
      },
      refreshUserProfile: (next: Partial<WebUserProfile>) => {
        setSession((prev) => {
          if (!prev) return prev;
          return { ...prev, profile: { ...prev.profile, ...next } };
        });
      },
    };
  }, [session, status]);

  return <WebAuthContext.Provider value={value}>{children}</WebAuthContext.Provider>;
}

export function useWebAuth() {
  const context = useContext(WebAuthContext);
  if (!context) {
    throw new Error("useWebAuth must be used inside WebAuthProvider");
  }
  return context;
}
