import { Suspense } from "react";

import { ResetPasswordStep } from "@/components/feature/auth/steps/ResetPasswordStep";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordStep />
    </Suspense>
  );
}
