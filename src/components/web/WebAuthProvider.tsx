"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { WebUserProfile } from "@/lib/models";

type AuthStatus = "loading" | "signedOut" | "signedIn";

type LoginParams = {
  email: string;
  password: string;
};

type WebAuthContextValue = {
  status: AuthStatus;
  profile: WebUserProfile | null;
  login: (params: LoginParams) => Promise<void>;
  logout: () => Promise<void>;
};

type DemoAccount = {
  email: string;
  password: string;
  profile: WebUserProfile;
};

const SESSION_KEY = "bluerock.web.session.v1";
const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "";

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

function readStoredProfile() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as WebUserProfile) : null;
  } catch {
    return null;
  }
}

async function loginWithApi({
  email,
  password,
}: LoginParams): Promise<WebUserProfile | null> {
  if (!API_URL) return null;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) return null;
    const payload = (await response.json()) as Record<string, unknown>;
    const user = payload?.user;
    if (!user || typeof user !== "object" || !("email" in user)) return null;
    const data = user as Record<string, unknown>;

    return {
      email: String(data.email),
      name: typeof data.name === "string" ? data.name : "",
      phone: typeof data.phone === "string" ? data.phone : "",
      emailVerified: Boolean(data.emailVerified),
      role:
        data.role === "ADMIN" || data.role === "LANDLORD" || data.role === "RENTER"
          ? data.role
          : "RENTER",
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
  const [profile, setProfile] = useState<WebUserProfile | null>(() => readStoredProfile());
  const [status, setStatus] = useState<AuthStatus>(() =>
    readStoredProfile() ? "signedIn" : "signedOut",
  );

  const value = useMemo<WebAuthContextValue>(() => {
    return {
      status,
      profile,
      login: async ({ email, password }) => {
        setStatus("loading");

        const apiProfile = await loginWithApi({ email, password });
        const nextProfile = apiProfile ?? loginWithDemo({ email, password });

        if (!nextProfile) {
          setProfile(null);
          setStatus("signedOut");
          throw new Error("Invalid credentials. Use the seeded mobile demo accounts.");
        }

        window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextProfile));
        setProfile(nextProfile);
        setStatus("signedIn");
      },
      logout: async () => {
        window.localStorage.removeItem(SESSION_KEY);
        setProfile(null);
        setStatus("signedOut");
      },
    };
  }, [profile, status]);

  return <WebAuthContext.Provider value={value}>{children}</WebAuthContext.Provider>;
}

export function useWebAuth() {
  const context = useContext(WebAuthContext);
  if (!context) {
    throw new Error("useWebAuth must be used inside WebAuthProvider");
  }
  return context;
}
