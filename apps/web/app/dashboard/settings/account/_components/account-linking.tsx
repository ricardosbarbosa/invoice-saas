"use client";

import { BetterAuthActionButton } from "@/components/auth/better-auth-action-button";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Account } from "better-auth";

import { Plus, Shield, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AccountLinking() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  useEffect(() => {
    authClient.listAccounts().then((response) => {
      setAccounts(response.data ?? []);
    });
  }, []);

  const nonCredentialAccounts = accounts.filter(
    (a) => a.providerId !== "credential"
  );

  const currentAccounts = nonCredentialAccounts;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Linked Accounts</h3>

        {currentAccounts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-secondary-muted">
              No linked accounts found
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {currentAccounts.map((account) => (
              <AccountCard
                key={account.id}
                provider={account.providerId}
                account={account}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Link Other Accounts</h3>
        <div className="grid gap-3">
          {["google", "facebook", "twitter"]
            .filter(
              (provider) =>
                !currentAccounts.find((acc) => acc.providerId === provider)
            )
            .map((provider) => (
              <AccountCard key={provider} provider={provider} />
            ))}
        </div>
      </div>
    </div>
  );
}

function AccountCard({
  provider,
  account,
}: {
  provider: string;
  account?: Account;
}) {
  const router = useRouter();
  const { refetch } = authClient.useSession();

  function linkAccount() {
    return authClient.linkSocial({
      provider,
      callbackURL: `${window.location.origin}/dashboard/settings/account?tab=accounts`,
    });
  }

  function unlinkAccount() {
    if (account == null) {
      return Promise.resolve({ error: { message: "Account not found" } });
    }
    return authClient.unlinkAccount(
      {
        accountId: account.accountId,
        providerId: provider,
      },
      {
        onSuccess: () => {
          console.log("unlinkAccount success");
          router.replace(`/dashboard/settings/account?tab=accounts`);
        },
      }
    );
  }

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {<Shield className="size-5" />}
            <div>
              <p className="font-medium">{provider}</p>
              {account == null ? (
                <p className="text-sm text-muted-foreground">
                  Connect your {provider} account for easier sign-in
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Linked on {new Date(account.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          {account == null ? (
            <BetterAuthActionButton
              variant="outline"
              size="sm"
              action={linkAccount}
            >
              <Plus />
              Link
            </BetterAuthActionButton>
          ) : (
            <BetterAuthActionButton
              variant="destructive"
              size="sm"
              action={unlinkAccount}
            >
              <Trash2 />
              Unlink
            </BetterAuthActionButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
