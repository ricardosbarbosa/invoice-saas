import Link from "next/link";
import { notFound } from "next/navigation";
import type { InvoiceStatus, DiscountType } from "@workspace/types";

import { InvoiceForm } from "@/components/invoice-form";
import { apiFetch } from "@/lib/api";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import PageHeader from "@/components/page-header";

// API response types (serialized format with string dates/numbers)
type InvoiceItem = {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  taxRate?: string | null;
};

type Invoice = {
  id: string;
  clientId: string;
  number: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate?: string | null;
  currency: string;
  discountType?: DiscountType | null;
  discountValue?: string | null;
  shippingAmount?: string | null;
  shippingTaxRate?: string | null;
  notes?: string | null;
  terms?: string | null;
  items: InvoiceItem[];
};

type PageProps = {
  params: Promise<{ invoiceId: string }>;
};

export default async function Page({ params }: PageProps) {
  const response = await apiFetch(`/invoices/${(await params).invoiceId}`);
  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    return (
      <>
        <PageHeader title="Edit invoice" />
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
      </>
    );
  }

  const data = (await response.json()) as { invoice: Invoice };
  const invoice = data.invoice;

  return (
    <>
      <PageHeader
        title="Edit invoice"
        actions={
          <Button variant="outline" asChild>
            <Link href={`/dashboard/invoices/${invoice.id}`}>
              Back to invoice
            </Link>
          </Button>
        }
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Edit invoice</CardTitle>
            <CardDescription>
              Update line items, discounts, shipping, and taxes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvoiceForm
              invoiceId={invoice.id}
              initialValues={{
                clientId: invoice.clientId,
                issueDate: invoice.issueDate,
                dueDate: invoice.dueDate ?? "",
                currency: invoice.currency,
                discountType: invoice.discountType ?? "",
                discountValue: invoice.discountValue ?? "",
                shippingAmount: invoice.shippingAmount ?? "",
                shippingTaxRate: invoice.shippingTaxRate ?? "",
                notes: invoice.notes ?? "",
                terms: invoice.terms ?? "",
                items: invoice.items.map((item) => ({
                  description: item.description,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  taxRate: item.taxRate ?? "",
                })),
              }}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
