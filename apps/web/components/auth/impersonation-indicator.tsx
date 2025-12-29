"use client";

import { UserX } from "lucide-react";
import { BetterAuthActionButton } from "@/components/auth/better-auth-action-button";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function ImpersonationIndicator() {
  const router = useRouter();
  const { data: session, refetch } = authClient.useSession();

  if (session?.session.impersonatedBy == null) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <BetterAuthActionButton
        action={() =>
          authClient.admin.stopImpersonating(undefined, {
            onSuccess: () => {
              router.push("/");
              refetch();
            },
          })
        }
        variant="destructive"
        size="sm"
      >
        <UserX className="size-4" />
      </BetterAuthActionButton>
    </div>
  );
}
