"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import PageHeader from "@/components/page-header";

type UserInvitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  organizationId: string;
  organizationName: string;
  inviterId: string;
  teamId?: string | null;
  expiresAt: string | Date;
  createdAt: string | Date;
};

const formatDate = (value?: string | Date | null) =>
  value ? new Date(value).toLocaleDateString() : "-";

const readClientError = (
  error: { message?: string; statusText?: string } | null | undefined,
  fallback: string
) => error?.message || error?.statusText || fallback;

export default function InvitationsPage() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [invitationsError, setInvitationsError] = useState<string | null>(null);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(true);
  const [invitationAction, setInvitationAction] = useState<{
    id: string;
    type: "accept" | "reject";
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadInvitations = async () => {
      setIsLoadingInvitations(true);
      setInvitationsError(null);

      try {
        const response = await authClient.organization.listUserInvitations();
        if (response.error) {
          if (!isMounted) return;
          setInvitationsError(
            readClientError(response.error, "Unable to load invitations.")
          );
          setInvitations([]);
          return;
        }

        const data = response.data ?? [];
        if (!isMounted) return;
        setInvitations(Array.isArray(data) ? data : []);
      } catch {
        if (!isMounted) return;
        setInvitationsError("Unable to load invitations.");
        setInvitations([]);
      } finally {
        if (!isMounted) return;
        setIsLoadingInvitations(false);
      }
    };

    void loadInvitations();

    return () => {
      isMounted = false;
    };
  }, []);

  const pendingInvitations = useMemo(
    () => invitations.filter((invitation) => invitation.status === "pending"),
    [invitations]
  );

  const handleInvitationAction = async (
    invitationId: string,
    type: "accept" | "reject"
  ) => {
    setInvitationsError(null);
    setInvitationAction({ id: invitationId, type });

    try {
      const response =
        type === "accept"
          ? await authClient.organization.acceptInvitation({ invitationId })
          : await authClient.organization.rejectInvitation({ invitationId });

      if (response.error) {
        setInvitationsError(
          readClientError(response.error, "Unable to update invitation.")
        );
        setInvitationAction(null);
        return;
      }

      if (type === "accept") {
        router.replace("/");
        return;
      }

      const updatedInvitation = response.data?.invitation as
        | Partial<UserInvitation>
        | undefined;

      setInvitations((prev) =>
        prev.map((invitation) =>
          invitation.id === invitationId
            ? { ...invitation, ...updatedInvitation, status: "rejected" }
            : invitation
        )
      );
      setInvitationAction(null);
    } catch {
      setInvitationsError("Unable to update invitation.");
      setInvitationAction(null);
    }
  };

  return (
    <>
      <PageHeader title="Invitations" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Invitations</CardTitle>
            <CardDescription>
              Pending invitations require action. Accepted invitations will
              activate the organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invitationsError ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {invitationsError}
              </div>
            ) : null}

            {isLoadingInvitations ? (
              <p className="text-sm text-neutral-600">
                Checking for invitations...
              </p>
            ) : invitations.length > 0 ? (
              <div className="space-y-3">
                {invitations.map((invitation) => {
                  const isPending = invitation.status === "pending";
                  const isAccepting =
                    invitationAction?.id === invitation.id &&
                    invitationAction.type === "accept";
                  const isRejecting =
                    invitationAction?.id === invitation.id &&
                    invitationAction.type === "reject";

                  return (
                    <div
                      key={invitation.id}
                      className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-medium text-neutral-900">
                          {invitation.organizationName}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Role: {invitation.role} · Status: {invitation.status}{" "}
                          · Sent {formatDate(invitation.createdAt)} · Expires{" "}
                          {formatDate(invitation.expiresAt)}
                        </p>
                      </div>
                      {isPending ? (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="secondary"
                            onClick={() =>
                              handleInvitationAction(invitation.id, "accept")
                            }
                            disabled={isAccepting || isRejecting}
                          >
                            {isAccepting ? "Accepting..." : "Accept"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              handleInvitationAction(invitation.id, "reject")
                            }
                            disabled={isAccepting || isRejecting}
                          >
                            {isRejecting ? "Rejecting..." : "Reject"}
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs uppercase tracking-wide text-neutral-400">
                          {invitation.status}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-neutral-600">No invitations found.</p>
            )}

            {pendingInvitations.length === 0 && invitations.length > 0 ? (
              <p className="text-xs text-neutral-600">
                All invitations have been handled.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
