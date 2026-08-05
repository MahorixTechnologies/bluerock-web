import { notFound } from "next/navigation";

import { SuccessStep } from "@/components/feature/auth/steps/SuccessStep";
import { getRoleContent } from "@/components/feature/auth/data";

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;

  if (!getRoleContent(role)) {
    notFound();
  }

  return <SuccessStep role={role as "homeowner" | "renter"} />;
}
