import { Suspense } from "react";

import { ForgotPasswordStep } from "@/components/feature/auth/steps/ForgotPasswordStep";

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordStep />
    </Suspense>
  );
}
