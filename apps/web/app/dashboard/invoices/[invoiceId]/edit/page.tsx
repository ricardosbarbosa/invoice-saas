"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { useGetInvoiceByIdQuery } from "@/lib/store/invoices";
import { useParams } from "next/navigation";
import { InvoiceFormV2 } from "@/components/invoice-form-v2";
import PageHeader from "@/components/page-header";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

export default function Page() {
  const params = useParams();
  const invoiceId = params.invoiceId as string;
  const {
    data: invoice,
    isLoading,
    error,
  } = useGetInvoiceByIdQuery({
    invoiceId,
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Edit invoice</CardTitle>
            <CardDescription>
              Update line items, discounts, shipping, and taxes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Edit invoice</CardTitle>
            <CardDescription>
              Update line items, discounts, shipping, and taxes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm">
              Unable to load this invoice.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Edit invoice"
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/invoices">Back to invoices</Link>
          </Button>
        }
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit invoice</CardTitle>
            <CardDescription>
              Update line items, discounts, shipping, and taxes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvoiceFormV2
              invoiceId={invoice?.id}
              initialValues={{
                clientId: invoice?.clientId ?? "",
                issueDate: invoice?.issueDate,
                dueDate: invoice?.dueDate ?? undefined,
                currency: invoice?.currency?.toUpperCase() ?? "",
                notes: invoice?.notes ?? "",
                items:
                  invoice?.items?.map((item) => ({
                    description: item.description,
                    quantity: item.quantity?.toNumber?.() ?? 0,
                    unitPrice: item.unitPrice?.toNumber?.() ?? 0,
                  })) ?? [],
              }}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
