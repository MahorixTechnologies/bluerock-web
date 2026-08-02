"use client";

import type { ReactNode } from "react";

import { useWebAuth } from "./WebAuthProvider";

type DashboardRouterProps = {
  landlord: ReactNode;
  renter: ReactNode;
  public: ReactNode;
  admin?: ReactNode;
};

export function DashboardRouter({
  landlord,
  renter,
  public: publicNode,
  admin,
}: DashboardRouterProps) {
  const { status, profile } = useWebAuth();

  if (status === "signedIn" && profile?.role === "LANDLORD") {
    return <>{landlord}</>;
  }

  if (status === "signedIn" && profile?.role === "ADMIN") {
    return <>{admin ?? renter}</>;
  }

  if (status === "signedIn" && profile?.role === "RENTER") {
    return <>{renter}</>;
  }

  return <>{publicNode}</>;
}
