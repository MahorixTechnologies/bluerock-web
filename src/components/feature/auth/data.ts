export type Role = "homeowner" | "renter";

export type RoleContent = {
  slug: Role;
  label: string;
  title: string;
  description: string;
  bullets: string[];
  cta: string;
  intro: string;
  dashboardLabel: string;
};

export const roleContent: Record<Role, RoleContent> = {
  homeowner: {
    slug: "homeowner",
    label: "Homeowner",
    title: "Homeowner Registration",
    description:
      "Manage your properties, track tenants, monitor payments, and oversee rental activities from your dashboard.",
    bullets: [
      "Add and manage properties",
      "Track rental payments",
      "Review tenant requests",
      "Access homeowner dashboard",
    ],
    cta: "Register as Homeowner",
    intro: "Create your homeowner account to start managing your properties.",
    dashboardLabel: "Homeowner Dashboard",
  },
  renter: {
    slug: "renter",
    label: "Renter",
    title: "Renter Registration",
    description:
      "Search for available properties, manage rent payments, and communicate with homeowners easily.",
    bullets: [
      "Browse available homes",
      "Submit rental applications",
      "Pay rent securely",
      "Access renter dashboard",
    ],
    cta: "Register as Renter",
    intro: "Create your renter account to start exploring properties and applications.",
    dashboardLabel: "Renter Dashboard",
  },
};

export function getRoleContent(role: string) {
  if (role === "homeowner" || role === "renter") {
    return roleContent[role];
  }
  return null;
}

export function maskEmail(email: string) {
  const trimmed = email.trim();
  if (!trimmed.includes("@")) return "jsm***@gmail.com";
  const [local, domain] = trimmed.split("@");
  const visible = local.slice(0, 3) || "jsm";
  return `${visible}***@${domain}`;
}
