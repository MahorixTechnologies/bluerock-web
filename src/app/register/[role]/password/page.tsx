import { Suspense } from "react";
import { notFound } from "next/navigation";

import { PasswordStep } from "@/components/feature/auth/steps/PasswordStep";
import { getRoleContent } from "@/components/feature/auth/data";

export default async function PasswordPage({
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
      <PasswordStep role={role as "homeowner" | "renter"} />
    </Suspense>
  );
}
