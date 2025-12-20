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

type Client = {
  id: string
  name: string
  email?: string | null
  currency?: string | null
  status: "active" | "archived"
  createdAt: string
}

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : "-"

export default async function Page() {
  const response = await apiFetch("/clients")
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
            <h1 className="text-lg font-semibold">Clients</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Card>
            <CardHeader>
              <CardTitle>Client list</CardTitle>
              <CardDescription>
                Manage contacts and billing details for each organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-sm">
                Unable to load clients right now.
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  const data = (await response.json()) as { clients: Client[] }
  const clients = data.clients ?? []

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-lg font-semibold">Clients</h1>
        </div>
        <div className="ml-auto px-4">
          <Button asChild>
            <Link href="/dashboard/clients/new">New client</Link>
          </Button>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Client list</CardTitle>
            <CardDescription>
              Manage contacts and billing details for each organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <div className="text-muted-foreground text-sm">
                No clients created yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-muted-foreground text-xs uppercase">
                    <tr className="border-b">
                      <th className="py-2 text-left font-medium">Client</th>
                      <th className="py-2 text-left font-medium">Email</th>
                      <th className="py-2 text-left font-medium">Currency</th>
                      <th className="py-2 text-left font-medium">Status</th>
                      <th className="py-2 text-left font-medium">Created</th>
                      <th className="py-2 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr
                        key={client.id}
                        className="border-b last:border-0 hover:bg-muted/40"
                      >
                        <td className="py-3">
                          <Link
                            href={`/dashboard/clients/${client.id}`}
                            className="font-medium hover:underline"
                          >
                            {client.name}
                          </Link>
                        </td>
                        <td className="py-3">{client.email ?? "-"}</td>
                        <td className="py-3">{client.currency ?? "-"}</td>
                        <td className="py-3 capitalize">{client.status}</td>
                        <td className="py-3">{formatDate(client.createdAt)}</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/clients/${client.id}`}>
                                View
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/clients/${client.id}/edit`}>
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
