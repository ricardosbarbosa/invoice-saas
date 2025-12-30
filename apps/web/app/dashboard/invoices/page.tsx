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
import {
  useDeleteInvoiceMutation,
  useGetInvoicesQuery,
} from "@/lib/store/invoices";
import { useSearchParams } from "next/navigation";

export default function UsersPage() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId");
  const { data, isLoading } = useGetInvoicesQuery({
    clientId: clientId ?? undefined,
  });
  const [deleteInvoice] = useDeleteInvoiceMutation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const invoices = data?.data ?? [];

  return (
    <>
      <PageHeader title="Invoices" />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Invoice list</CardTitle>
            <CardDescription>Manage invoices.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns({
                deleteInvoice: async (invoiceId: string) => {
                  await deleteInvoice({ invoiceId }).unwrap();
                },
              })}
              data={invoices}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
