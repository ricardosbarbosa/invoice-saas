import Link from "next/link"

import { InvoiceForm } from "@/components/invoice-form"
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

type PageProps = {
  searchParams?: { clientId?: string | string[] }
}

export default function Page({ searchParams }: PageProps) {
  const clientIdParam = searchParams?.clientId
  const clientId = Array.isArray(clientIdParam)
    ? clientIdParam[0]
    : clientIdParam

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-lg font-semibold">New invoice</h1>
        </div>
        <div className="ml-auto px-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/invoices">Back to invoices</Link>
          </Button>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Invoice details</CardTitle>
            <CardDescription>
              Define pricing, taxes, discounts, and shipping before sending.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvoiceForm initialValues={{ clientId: clientId ?? "" }} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
