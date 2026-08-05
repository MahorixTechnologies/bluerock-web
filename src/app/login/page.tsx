import { Suspense } from "react";

import { LoginStep } from "@/components/feature/auth/steps/LoginStep";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginStep />
    </Suspense>
  );
}
