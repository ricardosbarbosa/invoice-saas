"use client";
import { useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { toast } from "@workspace/ui/components/sonner";
import { env } from "@/env";
import { useGetInvoiceByIdQuery } from "@/lib/store/invoices";
import PageHeader from "@/components/page-header";

const formatDate = (value?: string | Date | null) =>
  value ? new Date(value).toLocaleDateString() : "-";

const formatCurrency = (
  amount: string | null | undefined,
  currency: string
) => {
  if (!amount) return "-";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(Number(amount));
  } catch {
    return `${amount} ${currency}`;
  }
};


export default function Page() {
  const params = useParams();
  const [isExporting, setIsExporting] = useState(false);
  const {
    data: invoice,
    isLoading,
    error,
  } = useGetInvoiceByIdQuery({
    invoiceId: params.invoiceId as string,
  });

  const handleExportPdf = async () => {
    if (!invoice || isExporting) return;

    setIsExporting(true);
    try {
      const response = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/invoices/${invoice.id}/pdf`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/pdf",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to export PDF (${response.status})`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const safeNumber = invoice.number
        .replace(/[^a-zA-Z0-9._-]+/g, "_")
        .replace(/^_+|_+$/g, "");
      const filename = safeNumber ? `${safeNumber}.pdf` : "invoice.pdf";

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (exportError) {
      toast.error("Unable to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Invoice details</CardTitle>
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
      <>
        <PageHeader title="Invoice details" />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Card>
            <CardHeader>
              <CardTitle>Invoice details</CardTitle>
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

  if (!invoice) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">{invoice.number}</h1>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
              {invoice.status}
            </span>
          </div>
        }
        actions={
          <div className="ml-auto flex items-center gap-2 px-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/invoices">Back to invoices</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/invoices/${invoice.id}/edit`}>Edit</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPdf}
              disabled={isExporting}
            >
              {isExporting ? "Preparing PDF..." : "Download PDF"}
            </Button>
          </div>
        }
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Invoice details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-muted-foreground text-xs uppercase">
                    Client
                  </div>
                  <div className="text-sm">
                    <Link
                      href={`/dashboard/clients/${invoice.client.id}`}
                      className="font-medium hover:underline"
                    >
                      {invoice.client.name}
                    </Link>
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">
                    Currency
                  </div>
                  <div className="text-sm">{invoice.currency}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">
                    Issue date
                  </div>
                  <div className="text-sm">{formatDate(invoice.issueDate)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">
                    Due date
                  </div>
                  <div className="text-sm">{formatDate(invoice.dueDate)}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Line items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-muted-foreground text-xs uppercase">
                      <tr className="border-b">
                        <th className="py-2 text-left font-medium">
                          Description
                        </th>
                        <th className="py-2 text-right font-medium">Qty</th>
                        <th className="py-2 text-right font-medium">Unit</th>
                        <th className="py-2 text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item) => {
                        const lineTotal =
                          Number(String(item.quantity)) *
                          Number(String(item.unitPrice));
                        return (
                          <tr key={item.id} className="border-b last:border-0">
                            <td className="py-3">{item.description}</td>
                            <td className="py-3 text-right">
                              {String(item.quantity)}
                            </td>
                            <td className="py-3 text-right">
                              {formatCurrency(
                                String(item.unitPrice),
                                invoice.currency
                              )}
                            </td>
                            <td className="py-3 text-right">
                              {formatCurrency(
                                lineTotal.toString(),
                                invoice.currency
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {invoice.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <div>{invoice.notes}</div>
                </CardContent>
              </Card>
            )}

            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Totals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    {formatCurrency(invoice.totals.subtotal, invoice.currency)}
                  </span>
                </div>
                <div className="border-t pt-3 text-base font-semibold">
                  <div className="flex items-center justify-between">
                    <span>Total</span>
                    <span>
                      {formatCurrency(invoice.totals.total, invoice.currency)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
