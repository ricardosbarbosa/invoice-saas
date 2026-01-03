import Link from "next/link";

import { InvoiceForm } from "@/components/invoice-form";
import { Button } from "@workspace/ui/components/button";
import PageHeader from "@/components/page-header";
import { InvoiceFormV2 } from "@/components/invoice-form-v2";
import {
  Card,
  CardAction,
  CardDescription,
  CardTitle,
  CardHeader,
  CardContent,
} from "@workspace/ui/components/card";

type PageProps = {
  searchParams?: Promise<{ clientId?: string | string[] }>;
};

export default async function Page({ searchParams }: PageProps) {
  const clientIdParam = (await searchParams)?.clientId;
  const clientId = Array.isArray(clientIdParam)
    ? clientIdParam[0]
    : clientIdParam;

  return (
    <>
      <PageHeader
        title="New invoice"
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/invoices">Back to invoices</Link>
          </Button>
        }
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-4 container mx-auto">
        <InvoiceFormV2 initialValues={{ clientId: clientId ?? "" }} />
      </div>
    </>
  );
}
