"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import React, { useEffect, useState } from "react";
import { columns } from "./columns";
import { authClient } from "@/lib/auth-client";
import { SessionWithImpersonatedBy } from "better-auth/plugins";
import { DataTable } from "./data-table";
import { useParams } from "next/navigation";
import { toast } from "@workspace/ui/components/sonner";
import PageHeader from "@/components/page-header";

export default function UsersPage() {
  const userId = useParams<{ userId: string }>().userId;
  const [sessions, setSessions] = useState<SessionWithImpersonatedBy[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await authClient.admin.listUserSessions({
        userId,
      });
      if (response.error) {
        toast.error(response.error.message);
      } else {
        setSessions(response.data.sessions);
      }
    };
    fetchUsers();
  }, [userId]);

  return (
    <>
      <PageHeader title={`User ${userId} sessions`} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>User {userId} Sessions</CardTitle>
            <CardDescription>Manage user {userId} sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={sessions} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
