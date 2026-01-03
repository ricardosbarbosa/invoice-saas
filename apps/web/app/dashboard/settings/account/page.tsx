import { Suspense } from "react";
import AccountClient from "./account-client";

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <AccountClient />
    </Suspense>
  );
}
