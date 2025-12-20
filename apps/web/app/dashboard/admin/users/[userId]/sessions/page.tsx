"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { SidebarTrigger } from "@workspace/ui/components/sidebar";
import React, { useEffect, useState } from "react";
import { columns } from "./columns";
import { authClient } from "@/lib/auth-client";
import { SessionWithImpersonatedBy } from "better-auth/plugins";
import { DataTable } from "./data-table";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export default function UsersPage() {

  const userId = useParams<{ userId: string }>().userId;
  const [sessions, setSessions] = useState<SessionWithImpersonatedBy[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await authClient.admin.listUserSessions({
        userId
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
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-lg font-semibold">Users</h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>User {userId} Sessions</CardTitle>
            <CardDescription>Manage user {userId} sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={sessions}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
