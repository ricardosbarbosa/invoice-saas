import { Suspense } from "react";
import OrganizationSelectPage from "./OrganizationSelectPage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  return (
    <Suspense fallback={<>Loading...</>}>
      <OrganizationSelectPage mode={mode} />
    </Suspense>
  );
}
