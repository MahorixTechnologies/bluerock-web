import { notFound } from "next/navigation";

import { RegistrationDetailsStep } from "@/components/auth/steps/RegistrationDetailsStep";
import { getRoleContent } from "@/components/auth/data";

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
