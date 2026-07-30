import { Suspense } from "react";

import { LoginStep } from "@/components/auth/steps/LoginStep";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginStep />
    </Suspense>
  );
}
