import { Suspense } from "react";
import VerifyEmailClient from "./verify-email-client";

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <VerifyEmailClient />
    </Suspense>
  );
}
