import Link from "next/link"
import { notFound } from "next/navigation"

import { ClientForm } from "@/components/client-form"
import { apiFetch } from "@/lib/api"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
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
  notes?: string | null
}

type PageProps = {
  params: Promise<{ clientId: string }>
}

export default async function Page({ params }: PageProps) {
  const response = await apiFetch(`/clients/${(await params).clientId}`)
  console.log(response)
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
            <h1 className="text-lg font-semibold">Edit client</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Card>
            <CardHeader>
              <CardTitle>Edit client</CardTitle>
              <CardDescription>
                Update client contact details and billing preferences.
              </CardDescription>
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

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-lg font-semibold">Edit client</h1>
        </div>
        <div className="ml-auto px-4">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/clients/${client.id}`}>Back to client</Link>
          </Button>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Edit client</CardTitle>
            <CardDescription>
              Update client contact details and billing preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientForm
              clientId={client.id}
              initialValues={{
                name: client.name,
                email: client.email ?? "",
                phone: client.phone ?? "",
                taxId: client.taxId ?? "",
                addressLine1: client.addressLine1 ?? "",
                addressLine2: client.addressLine2 ?? "",
                city: client.city ?? "",
                state: client.state ?? "",
                postalCode: client.postalCode ?? "",
                country: client.country ?? "",
                currency: client.currency ?? "",
                notes: client.notes ?? "",
              }}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
