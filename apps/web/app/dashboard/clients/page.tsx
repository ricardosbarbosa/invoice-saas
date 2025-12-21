"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import React from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import {
  useDeleteClientMutation,
  useGetClientsQuery,
} from "@/lib/store/clients";
import PageHeader from "@/components/page-header";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

export default function UsersPage() {
  const { data, isLoading } = useGetClientsQuery();
  const [deleteClient] = useDeleteClientMutation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const clients = data?.data ?? [];

  return (
    <>
      <PageHeader title="Clients" />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Client list</CardTitle>
            <CardDescription>
              Manage clients and their invoices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns({
                deleteClient: async (clientId: string) => {
                  await deleteClient({ clientId }).unwrap();
                },
              })}
              data={clients}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
