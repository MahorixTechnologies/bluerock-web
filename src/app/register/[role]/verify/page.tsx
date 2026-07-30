import { Suspense } from "react";
import { notFound } from "next/navigation";

import { VerificationStep } from "@/components/auth/steps/VerificationStep";
import { getRoleContent } from "@/components/auth/data";

export default async function VerificationPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;

  if (!getRoleContent(role)) {
    notFound();
  }

  return (
    <Suspense>
      <VerificationStep role={role as "homeowner" | "renter"} />
    </Suspense>
  );
}
