import Link from "next/link"
import { notFound } from "next/navigation"

import { apiFetch } from "@/lib/api"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"

type InvoiceItem = {
  id: string
  description: string
  quantity: string
  unitPrice: string
  taxRate?: string | null
}

type InvoiceTotals = {
  subtotal: string
  discountTotal: string
  taxTotal: string
  shippingTotal: string
  shippingTax: string
  total: string
}

type Invoice = {
  id: string
  number: string
  status: "draft" | "sent" | "paid" | "void"
  issueDate: string
  dueDate?: string | null
  currency: string
  notes?: string | null
  terms?: string | null
  discountType?: "percentage" | "fixed" | null
  discountValue?: string | null
  shippingAmount?: string | null
  shippingTaxRate?: string | null
  client: {
    id: string
    name: string
  }
  items: InvoiceItem[]
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

const formatRate = (value?: string | null) =>
  value ? `${Number(value) * 100}%` : "-"

type PageProps = {
  params: { invoiceId: string }
}

export default async function Page({ params }: PageProps) {
  const response = await apiFetch(`/invoices/${params.invoiceId}`)
  if (response.status === 404) {
    notFound()
  }

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
            <h1 className="text-lg font-semibold">Invoice</h1>
          </div>
        </header>
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
    )
  }

  const data = (await response.json()) as { invoice: Invoice }
  const invoice = data.invoice

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">{invoice.number}</h1>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
              {invoice.status}
            </span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 px-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/invoices">Back to invoices</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/invoices/${invoice.id}/edit`}>Edit</Link>
          </Button>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Invoice details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Client</div>
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
                  <div className="text-muted-foreground text-xs uppercase">Currency</div>
                  <div className="text-sm">{invoice.currency}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Issue date</div>
                  <div className="text-sm">{formatDate(invoice.issueDate)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Due date</div>
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
                        <th className="py-2 text-left font-medium">Description</th>
                        <th className="py-2 text-right font-medium">Qty</th>
                        <th className="py-2 text-right font-medium">Unit</th>
                        <th className="py-2 text-right font-medium">Tax</th>
                        <th className="py-2 text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item) => {
                        const lineTotal =
                          Number(item.quantity) * Number(item.unitPrice)
                        return (
                          <tr key={item.id} className="border-b last:border-0">
                            <td className="py-3">{item.description}</td>
                            <td className="py-3 text-right">{item.quantity}</td>
                            <td className="py-3 text-right">
                              {formatCurrency(item.unitPrice, invoice.currency)}
                            </td>
                            <td className="py-3 text-right">
                              {formatRate(item.taxRate)}
                            </td>
                            <td className="py-3 text-right">
                              {formatCurrency(
                                lineTotal.toString(),
                                invoice.currency
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {(invoice.notes || invoice.terms) && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes & terms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs uppercase">Notes</div>
                    <div>{invoice.notes ?? "-"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs uppercase">Terms</div>
                    <div>{invoice.terms ?? "-"}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Totals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(invoice.totals.subtotal, invoice.currency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>{formatCurrency(invoice.totals.discountTotal, invoice.currency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(invoice.totals.taxTotal, invoice.currency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatCurrency(invoice.totals.shippingTotal, invoice.currency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shipping tax</span>
                <span>{formatCurrency(invoice.totals.shippingTax, invoice.currency)}</span>
              </div>
              <div className="border-t pt-3 text-base font-semibold">
                <div className="flex items-center justify-between">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.totals.total, invoice.currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
