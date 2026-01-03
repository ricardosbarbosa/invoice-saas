"use client";
import { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { toast } from "@workspace/ui/components/sonner";
import { env } from "@/env";
import { useGetInvoiceByIdQuery } from "@/lib/store/invoices";
import { authClient } from "@/lib/auth-client";
import { Download, Share2 } from "lucide-react";

const formatDate = (value?: string | Date | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (
  amount: string | null | undefined,
  currency: string
) => {
  if (!amount) return "-";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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

  const { useActiveOrganization } = authClient;
  const { data: organization } = useActiveOrganization();

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @media print {
        @page {
          margin: 0;
          size: A4;
        }
        body {
          background: white !important;
        }
        .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

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
    } catch {
      toast.error("Unable to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="text-muted-foreground text-sm">
          Unable to load this invoice.
        </div>
      </div>
    );
  }

  if (!invoice) {
    notFound();
  }

  // Format organization address
  let orgAddress = "";
  let orgEmail = "";
  if (organization?.metadata) {
    try {
      const metadata =
        typeof organization.metadata === "string"
          ? JSON.parse(organization.metadata)
          : organization.metadata;
      orgAddress = metadata.address || "";
      orgEmail = metadata.email || "";
    } catch {
      // Ignore parsing errors
    }
  }

  // Format client address
  const clientAddressParts = [
    invoice.client.addressLine1,
    invoice.client.addressLine2,
    invoice.client.city,
    invoice.client.state,
    invoice.client.postalCode,
    invoice.client.country,
  ].filter(Boolean);
  const clientAddress = clientAddressParts.join(", ") || null;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Action Buttons - Top Right */}
      <div className="no-print fixed right-4 top-4 z-50 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="bg-white shadow-md hover:bg-gray-50"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Print
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportPdf}
          disabled={isExporting}
          className="bg-white shadow-md hover:bg-gray-50"
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Preparing PDF..." : "Download PDF"}
        </Button>
      </div>

      {/* Invoice Document */}
      <div className="mx-auto my-8 w-full max-w-4xl bg-white px-12 py-16 shadow-sm">
        {/* Header Section */}
        <div className="mb-12 flex items-start justify-between">
          {/* Left: Company Info */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-blue-600 text-white">
              <span className="text-xl font-bold">
                {organization?.name?.[0]?.toUpperCase() || "I"}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {organization?.name || "Invoicify"}
              </h2>
              {orgAddress && (
                <p className="mt-1 text-sm text-gray-600">{orgAddress}</p>
              )}
              {orgEmail && <p className="text-sm text-gray-600">{orgEmail}</p>}
            </div>
          </div>

          {/* Right: Invoice Title & Details */}
          <div className="text-right">
            {/* Status Badge - Top Right */}
            <div className="mb-4">
              <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase text-gray-800">
                {invoice.status}
              </span>
            </div>
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-gray-900">
              INVOICE
            </h1>
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-700">
                Invoice Number
              </div>
              <div className="text-sm text-gray-600">{invoice.number}</div>
            </div>
          </div>
        </div>

        {/* Billing Section */}
        <div className="mb-12 grid grid-cols-2 gap-12">
          {/* Bill To */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Bill To
            </h3>
            <div className="space-y-1">
              <p className="font-semibold text-gray-900">
                {invoice.client.name}
              </p>
              {clientAddress && (
                <p className="text-sm text-gray-600">{clientAddress}</p>
              )}
              {invoice.client.email && (
                <p className="text-sm text-gray-600">{invoice.client.email}</p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="text-right">
            <div className="space-y-4">
              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Invoice Date
                </div>
                <div className="text-sm text-gray-900">
                  {formatDate(invoice.issueDate)}
                </div>
              </div>
              {invoice.dueDate && (
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Due Date
                  </div>
                  <div className="text-sm text-gray-900">
                    {formatDate(invoice.dueDate)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Description
                </th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Qty
                </th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Price
                </th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => {
                const lineTotal =
                  Number(String(item.quantity)) *
                  Number(String(item.unitPrice));
                return (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="py-4 text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="py-4 text-right text-sm text-gray-600">
                      {String(item.quantity)}
                    </td>
                    <td className="py-4 text-right text-sm text-gray-600">
                      {formatCurrency(String(item.unitPrice), invoice.currency)}
                    </td>
                    <td className="py-4 text-right text-sm font-medium text-gray-900">
                      {formatCurrency(lineTotal.toString(), invoice.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="mb-8 flex justify-end">
          <div className="w-64">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">
                {formatCurrency(invoice.totals.subtotal, invoice.currency)}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-gray-900">
                  Total
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(invoice.totals.total, invoice.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-8 border-t border-gray-200 pt-6">
            <div className="text-sm text-gray-600">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Notes
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">
                {invoice.notes}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          Thank you for your business!
        </div>
      </div>
    </div>
  );
}
