import Link from "next/link"

import { apiFetch } from "@/lib/api"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"

type InvoiceTotals = {
  total: string
}

type InvoiceListItem = {
  id: string
  number: string
  status: "draft" | "sent" | "paid" | "void"
  issueDate: string
  currency: string
  client: {
    id: string
    name: string
  }
  totals: InvoiceTotals
}

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : "-"

const formatCurrency = (amount: string | null | undefined, currency: string) => {
  if (!amount) return "-"
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(Number(amount))
  } catch {
    return `${amount} ${currency}`
  }
}

export default async function Page() {
  const response = await apiFetch("/invoices")
  if (!response.ok) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="text-lg font-semibold">Invoices</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Card>
            <CardHeader>
              <CardTitle>Invoice list</CardTitle>
              <CardDescription>
                Track draft, sent, and paid invoices for each client.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-sm">
                Unable to load invoices right now.
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  const data = (await response.json()) as { invoices: InvoiceListItem[] }
  const invoices = data.invoices ?? []

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-lg font-semibold">Invoices</h1>
        </div>
        <div className="ml-auto px-4">
          <Button asChild>
            <Link href="/dashboard/invoices/new">New invoice</Link>
          </Button>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Invoice list</CardTitle>
            <CardDescription>
              Track draft, sent, and paid invoices for each client.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-muted-foreground text-sm">
                No invoices created yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-muted-foreground text-xs uppercase">
                    <tr className="border-b">
                      <th className="py-2 text-left font-medium">Invoice</th>
                      <th className="py-2 text-left font-medium">Client</th>
                      <th className="py-2 text-left font-medium">Status</th>
                      <th className="py-2 text-left font-medium">Issue date</th>
                      <th className="py-2 text-left font-medium">Total</th>
                      <th className="py-2 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="border-b last:border-0 hover:bg-muted/40"
                      >
                        <td className="py-3">
                          <Link
                            href={`/dashboard/invoices/${invoice.id}`}
                            className="font-medium hover:underline"
                          >
                            {invoice.number}
                          </Link>
                        </td>
                        <td className="py-3">{invoice.client?.name ?? "-"}</td>
                        <td className="py-3 capitalize">{invoice.status}</td>
                        <td className="py-3">{formatDate(invoice.issueDate)}</td>
                        <td className="py-3">
                          {formatCurrency(invoice.totals?.total, invoice.currency)}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/invoices/${invoice.id}`}>
                                View
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                                Edit
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
