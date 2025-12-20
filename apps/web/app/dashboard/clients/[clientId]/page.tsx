import Link from "next/link"
import { notFound } from "next/navigation"

import { apiFetch } from "@/lib/api"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"

type Client = {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  taxId?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  country?: string | null
  currency?: string | null
  status: "active" | "archived"
  notes?: string | null
  createdAt: string
}

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : "-"

const formatValue = (value?: string | null) => value ?? "-"

type PageProps = {
  params: Promise<{ clientId: string }>
}

export default async function Page({ params }: PageProps) {
  const response = await apiFetch(`/clients/${(await params).clientId}`)
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
            <h1 className="text-lg font-semibold">Client</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Card>
            <CardHeader>
              <CardTitle>Client details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-sm">
                Unable to load this client.
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  const data = (await response.json()) as { client: Client }
  const client = data.client
  const address = [
    client.addressLine1,
    client.addressLine2,
    client.city,
    client.state,
    client.postalCode,
    client.country,
  ]
    .filter(Boolean)
    .join(", ")

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
            <h1 className="text-lg font-semibold">{client.name}</h1>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
              {client.status}
            </span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 px-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/clients">Back to clients</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/clients/${client.id}/edit`}>Edit</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/dashboard/invoices/new?clientId=${client.id}`}>
              New invoice
            </Link>
          </Button>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Client details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-muted-foreground text-xs uppercase">Email</div>
              <div className="text-sm">{formatValue(client.email)}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs uppercase">Phone</div>
              <div className="text-sm">{formatValue(client.phone)}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs uppercase">Tax ID</div>
              <div className="text-sm">{formatValue(client.taxId)}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs uppercase">Currency</div>
              <div className="text-sm">{formatValue(client.currency)}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs uppercase">Address</div>
              <div className="text-sm">{address || "-"}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs uppercase">Created</div>
              <div className="text-sm">{formatDate(client.createdAt)}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-muted-foreground text-xs uppercase">Notes</div>
              <div className="text-sm">{formatValue(client.notes)}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
