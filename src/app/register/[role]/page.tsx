import { notFound } from "next/navigation";

import { RegistrationDetailsStep } from "@/components/feature/auth/steps/RegistrationDetailsStep";
import { getRoleContent } from "@/components/feature/auth/data";

export default async function RegistrationDetailsPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;

  if (!getRoleContent(role)) {
    notFound();
  }

  return <RegistrationDetailsStep role={role as "homeowner" | "renter"} />;
}
