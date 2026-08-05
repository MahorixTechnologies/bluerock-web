"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { WebUserProfile } from "@/types/models";

type AuthStatus = "loading" | "signedOut" | "signedIn";

type LoginParams = {
  email: string;
  password: string;
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
  logout: () => Promise<void>;
  refreshUserProfile: (next: Partial<WebUserProfile>) => void;
};

type DemoAccount = {
  email: string;
  password: string;
  profile: WebUserProfile;
};

const SESSION_KEY = "bluerock.web.session.v2";
const _API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "";
export const API_URL = _API_BASE ? `${_API_BASE}/api/v1` : "";

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
}: LoginParams): Promise<{ profile: WebUserProfile; accessToken: string } | null> {
  if (!API_URL) return null;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) return null;
    const envelope = (await response.json()) as Record<string, unknown>;
    const payload = (envelope?.success === true ? envelope.data : envelope) as Record<string, unknown> | undefined;
    if (!payload || typeof payload !== "object") return null;
    const accessToken =
      typeof payload.accessToken === "string" ? payload.accessToken : "";
    const user = payload.user;
    if (!user || typeof user !== "object" || !("email" in user)) return null;
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
  } catch {
    return null;
  }
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

  const value = useMemo<WebAuthContextValue>(() => {
    return {
      status,
      profile: session?.profile ?? null,
      accessToken: session?.accessToken ?? null,
      login: async ({ email, password }) => {
        setStatus("loading");

        const apiResult = await loginWithApi({ email, password });
        let next: StoredSession | null = null;
        if (apiResult) {
          next = { profile: apiResult.profile, accessToken: apiResult.accessToken };
        } else {
          const demoProfile = loginWithDemo({ email, password });
          if (demoProfile) {
            next = { profile: demoProfile, accessToken: `demo.${demoProfile.role}.${btoa(demoProfile.email)}` };
          }
        }

        if (!next) {
          setSession(null);
          setStatus("signedOut");
          throw new Error("Invalid credentials. Use the seeded mobile demo accounts.");
        }

        setSession(next);
        setStatus("signedIn");
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
