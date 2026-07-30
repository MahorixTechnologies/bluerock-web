import { Suspense } from "react";
import { notFound } from "next/navigation";

import { PasswordStep } from "@/components/auth/steps/PasswordStep";
import { getRoleContent } from "@/components/auth/data";

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
