import { Suspense } from "react";
import InvoicesClient from "./invoices-client";

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <InvoicesClient />
    </Suspense>
  );
}
